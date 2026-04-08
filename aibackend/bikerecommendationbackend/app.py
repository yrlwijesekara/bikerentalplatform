import os
import time
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

DEFAULT_COORDS = {
    "lat": 7.8731,
    "lon": 80.7718,
    "official_name": "Sri Lanka",
    "elevation": 300.0,
}
WEATHER_CACHE_TTL_SECONDS = int(os.getenv("WEATHER_CACHE_TTL_SECONDS", "300"))
DEFAULT_ELEVATION_M = float(os.getenv("DEFAULT_ELEVATION_M", "300"))
DEFAULT_RAINFALL_MM = float(os.getenv("DEFAULT_RAINFALL_MM", "0"))
OPEN_METEO_TIMEOUT_SECONDS = int(os.getenv("OPEN_METEO_TIMEOUT_SECONDS", "10"))
OPEN_METEO_MAX_RETRIES = int(os.getenv("OPEN_METEO_MAX_RETRIES", "2"))
_ELEVATION_CACHE = {}
_RAINFALL_CACHE = {}


def _open_meteo_get_json(url: str, params: dict):
    last_error = None
    for attempt in range(OPEN_METEO_MAX_RETRIES + 1):
        try:
            response = requests.get(url, params=params, timeout=OPEN_METEO_TIMEOUT_SECONDS)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as exc:
            last_error = exc
            if attempt < OPEN_METEO_MAX_RETRIES:
                # Exponential backoff reduces repeat timeout collisions.
                time.sleep(0.4 * (2**attempt))
                continue
            raise last_error


def get_city_coordinates(city_name: str):
    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": city_name,
        "count": 1,
        "country": "LK",
        "language": "en",
        "format": "json",
    }

    payload = _open_meteo_get_json(url, params)

    results = payload.get("results") or []
    if not results:
        return None

    result = results[0]
    return {
        "lat": result["latitude"],
        "lon": result["longitude"],
        "official_name": result["name"],
        "elevation": float(result.get("elevation", DEFAULT_ELEVATION_M)),
    }


def get_elevation(lat: float, lon: float, fallback_elevation: float | None = None) -> tuple[float, str]:
    cache_key = (round(lat, 4), round(lon, 4))
    now = time.time()
    cached = _ELEVATION_CACHE.get(cache_key)
    if cached and (now - cached["timestamp"]) < WEATHER_CACHE_TTL_SECONDS:
        return float(cached["value"]), "cache"

    fallback_value = float(fallback_elevation if fallback_elevation is not None else DEFAULT_ELEVATION_M)

    url = "https://api.open-meteo.com/v1/elevation"
    params = {
        "latitude": lat,
        "longitude": lon,
    }

    try:
        payload = _open_meteo_get_json(url, params)
        elevations = payload.get("elevation") or []
        value = float(elevations[0]) if elevations else fallback_value
        _ELEVATION_CACHE[cache_key] = {"timestamp": now, "value": value}
        return value, "live_api"
    except requests.RequestException as exc:
        if exc.response is not None and exc.response.status_code == 429:
            if cached:
                return float(cached["value"]), "cache_fallback_rate_limited"
            return fallback_value, "fallback_rate_limited"
        if cached:
            return float(cached["value"]), "cache_fallback_timeout"
        return fallback_value, "fallback_timeout"


def get_current_precipitation(lat: float, lon: float) -> tuple[float, str]:
    cache_key = (round(lat, 4), round(lon, 4))
    now = time.time()
    cached = _RAINFALL_CACHE.get(cache_key)
    if cached and (now - cached["timestamp"]) < WEATHER_CACHE_TTL_SECONDS:
        return float(cached["value"]), "cache"

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "precipitation",
        "timezone": "auto",
    }

    try:
        payload = _open_meteo_get_json(url, params)
        current = payload.get("current") or {}
        value = float(current.get("precipitation", DEFAULT_RAINFALL_MM))
        _RAINFALL_CACHE[cache_key] = {"timestamp": now, "value": value}
        return value, "live_api"
    except requests.RequestException as exc:
        if exc.response is not None and exc.response.status_code == 429:
            if cached:
                return float(cached["value"]), "cache_fallback_rate_limited"
            return DEFAULT_RAINFALL_MM, "fallback_rate_limited"
        if cached:
            return float(cached["value"]), "cache_fallback_timeout"
        return DEFAULT_RAINFALL_MM, "fallback_timeout"


def normalize_traffic_risk(value):
    try:
        risk = int(value)
    except (TypeError, ValueError):
        risk = 0

    return max(0, min(risk, 2))


def build_recommendation_label(prediction: int) -> str:
    return "geared bike" if prediction == 1 else "automatic scooter"


@app.get("/")
def index():
    return jsonify(
        {
            "status": "ok",
            "service": "bike-recommendation-ai",
            "message": "Use POST /api/bike-recommendation/predict for predictions.",
        }
    )


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
            geo_data = dict(DEFAULT_COORDS)
        else:
            geo_data = get_city_coordinates(city)
            if not geo_data:
                return jsonify({"error": f"Could not locate '{city}' in Sri Lanka."}), 404

        elevation, elevation_source = get_elevation(
            geo_data["lat"],
            geo_data["lon"],
            fallback_elevation=geo_data.get("elevation"),
        )

        if rainfall_mm is None:
            rainfall_mm, rainfall_fetch_source = get_current_precipitation(geo_data["lat"], geo_data["lon"])
            rainfall_source = f"api_auto_{rainfall_fetch_source}"
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
                "elevation_source": elevation_source,
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
    port = int(os.getenv("PORT", "5002"))
    debug = os.getenv("FLASK_DEBUG", "false").strip().lower() in ("1", "true", "yes", "on")
    app.run(host="0.0.0.0", port=port, debug=debug)