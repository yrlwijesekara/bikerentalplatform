from pathlib import Path

import joblib
import pandas as pd
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "bike_recommender .joblib"

app = Flask(__name__)
CORS(app)

model = joblib.load(MODEL_PATH)


def get_city_coordinates(city_name: str):
    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": city_name,
        "count": 1,
        "country": "LK",
        "language": "en",
        "format": "json",
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    results = payload.get("results") or []
    if not results:
        return None

    result = results[0]
    return {
        "lat": result["latitude"],
        "lon": result["longitude"],
        "official_name": result["name"],
    }


def get_elevation(lat: float, lon: float) -> float:
    url = "https://api.open-meteo.com/v1/elevation"
    params = {
        "latitude": lat,
        "longitude": lon,
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    elevations = payload.get("elevation") or []
    return float(elevations[0]) if elevations else 0.0


def get_current_precipitation(lat: float, lon: float) -> float:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "precipitation",
        "timezone": "auto",
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    current = payload.get("current") or {}
    return float(current.get("precipitation", 0.0))


def normalize_traffic_risk(value):
    try:
        risk = int(value)
    except (TypeError, ValueError):
        risk = 0

    return max(0, min(risk, 2))


def build_recommendation_label(prediction: int) -> str:
    return "geared bike" if prediction == 1 else "automatic scooter"


@app.get("/health")
def health_check():
    return jsonify({"status": "ok", "service": "bike-recommendation-ai"})


@app.post("/api/bike-recommendation/predict")
def predict_bike_recommendation():
    payload = request.get_json(silent=True) or {}
    city = (payload.get("city") or "").strip()
    traffic_risk = normalize_traffic_risk(payload.get("traffic_risk", 0))
    rainfall_input = payload.get("rainfall_mm", None)

    rainfall_mm = None
    if rainfall_input not in (None, ""):
        try:
            rainfall_mm = float(rainfall_input)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid rainfall_mm value. Use a numeric value or leave it empty."}), 400

    if not city:
        city = "Sri Lanka"

    try:
        if city.lower() in {"sri lanka", "srilanka"}:
            geo_data = {
                "lat": 7.8731,
                "lon": 80.7718,
                "official_name": "Sri Lanka",
            }
        else:
            geo_data = get_city_coordinates(city)
            if not geo_data:
                return jsonify({"error": f"Could not locate '{city}' in Sri Lanka."}), 404

        elevation = get_elevation(geo_data["lat"], geo_data["lon"])

        if rainfall_mm is None:
            rainfall_mm = get_current_precipitation(geo_data["lat"], geo_data["lon"])
            rainfall_source = "api_auto"
        else:
            rainfall_source = "user_input"

        rain_status = 1 if rainfall_mm > 0 else 0

        feature_frame = pd.DataFrame(
            [[elevation, traffic_risk, rain_status]],
            columns=["Elevation", "Traffic_Risk", "Rainfall"],
        )

        prediction = int(model.predict(feature_frame)[0])
        recommendation = build_recommendation_label(prediction)

        if recommendation == "geared bike":
            reason = (
                "Higher elevation and the current road conditions suggest a geared bike will"
                " give better control on hills and descents."
            )
        else:
            reason = (
                "Flat terrain or lower riding complexity makes an automatic scooter the easier"
                " and more comfortable option."
            )

        confidence = None
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(feature_frame)[0]
            confidence = float(max(probabilities))

        return jsonify(
            {
                "city": city,
                "official_location": geo_data["official_name"],
                "elevation_m": round(elevation, 1),
                "traffic_risk": traffic_risk,
                "traffic_risk_label": ["Low", "Medium", "High"][traffic_risk],
                "rainfall_mm": round(rainfall_mm, 2),
                "rainfall_source": rainfall_source,
                "rain_status": rain_status,
                "recommendation": recommendation,
                "recommendation_label": recommendation.title(),
                "reason": reason,
                "confidence": confidence,
            }
        )
    except requests.RequestException as error:
        return jsonify({"error": f"Failed to contact Open-Meteo: {error}"}), 502
    except Exception as error:
        return jsonify({"error": f"Prediction failed: {error}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)