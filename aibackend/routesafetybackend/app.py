import os
from pathlib import Path
from datetime import datetime

import joblib
import pandas as pd
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "bike_risk_model.joblib"
DATA_PATH = BASE_DIR / "cleaned_traffic_data.csv"

app = Flask(__name__)
CORS(app)

model = joblib.load(MODEL_PATH)
df = pd.read_csv(DATA_PATH)

# Remove aggregate rows if present and normalize labels for matching.
df = df[df["Location"].str.strip().str.lower() != "total"].copy()
df["Location"] = df["Location"].str.replace('"', "", regex=False).str.strip()

IGNORED_COLUMNS = {"Location", "Total", "accident_percentage", "risk"}
if hasattr(model, "feature_names_in_"):
    FEATURE_COLUMNS = list(model.feature_names_in_)
else:
    FEATURE_COLUMNS = [c for c in df.columns if c not in IGNORED_COLUMNS]

DEFAULT_SRI_LANKA_COORDS = {
    "lat": 7.8731,
    "lon": 80.7718,
    "official_name": "Sri Lanka",
}


def get_city_coordinates(city_input: str):
    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": city_input,
        "count": 1,
        "country": "LK",
        "language": "en",
        "format": "json",
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    if not payload.get("results"):
        return None

    result = payload["results"][0]
    return {
        "lat": result["latitude"],
        "lon": result["longitude"],
        "official_name": result["name"],
    }


def get_live_weather_and_elevation(lat: float, lon: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation",
        "hourly": "temperature_2m",
        "forecast_days": 2,
        "timezone": "auto",
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    current = payload.get("current", {})
    hourly = payload.get("hourly", {})
    hourly_times = hourly.get("time", [])
    hourly_temps = hourly.get("temperature_2m", [])

    current_time_str = current.get("time")
    try:
        now_local = datetime.fromisoformat(current_time_str) if current_time_str else None
    except ValueError:
        now_local = None

    next_hours = []

    for time_str, temp in zip(hourly_times, hourly_temps):
        try:
            slot = datetime.fromisoformat(time_str)
        except ValueError:
            continue

        if now_local is None or slot >= now_local:
            next_hours.append(
                {
                    "time": slot.strftime("%Y-%m-%d %H:%M"),
                    "temperature_c": round(float(temp), 1),
                }
            )

        if len(next_hours) >= 8:
            break

    return {
        "temperature": float(current.get("temperature_2m", 28.0)),
        "humidity": float(current.get("relative_humidity_2m", 70.0)),
        "rainfall": float(current.get("precipitation", 0.0)),
        "elevation": float(payload.get("elevation", 0.0)),
        "hourly_temperature_next_hours": next_hours,
    }


def classify_terrain(elevation: float):
    if elevation > 400:
        return "hill_country"
    if elevation < 30:
        return "coastal_or_lowland"
    return "flat_open"


def get_city_traffic_features(city_name: str):
    match = df[df["Location"].str.contains(city_name, case=False, na=False)]

    if not match.empty:
        # Use local history when city/division is present in the dataset.
        return match[FEATURE_COLUMNS].mean().tolist()

    # Fall back to a national median profile for villages not in the dataset.
    return df[FEATURE_COLUMNS].median().tolist()


def map_base_risk_label(prediction_value: int):
    if prediction_value == 2:
        return "High"
    if prediction_value == 1:
        return "Medium"
    return "Low"


def compute_final_risk(base_risk_text: str, rainfall: float):
    if rainfall > 5 and base_risk_text == "High":
        return "VERY HIGH RISK"
    if rainfall > 0 and base_risk_text == "High":
        return "HIGH RISK"
    if rainfall > 5:
        return "HIGH RISK"
    if rainfall > 0:
        return "MEDIUM RISK"
    if base_risk_text == "High":
        return "HIGH RISK"
    if base_risk_text == "Medium":
        return "MEDIUM RISK"
    return "LOW RISK"


def build_safety_tips(terrain_type: str, elevation: float, base_risk_text: str, rainfall: float):
    tips = []

    if terrain_type == "hill_country":
        tips.append(
            f"Terrain ({elevation:.0f}m): Steep slopes and sharp bends. Use lower gears downhill."
        )
    elif terrain_type == "coastal_or_lowland":
        tips.append(
            f"Terrain ({elevation:.0f}m): Lowland/coastal area. Expect crosswinds and heavy junction traffic."
        )
    else:
        tips.append(
            f"Terrain ({elevation:.0f}m): Standard elevation. Stay alert for animals and sudden crossings."
        )

    if base_risk_text == "High":
        tips.append("History: High accident zone. Keep speed controlled and maintain extra braking distance.")
    elif base_risk_text == "Medium":
        tips.append("History: Moderate traffic risk. Keep lane discipline and watch for pedestrians.")
    else:
        tips.append("History: Lower historical risk. Follow standard defensive riding practices.")

    if rainfall > 5:
        tips.append("Weather: Heavy rain. Visibility drops quickly; avoid aggressive overtakes.")
    elif rainfall > 0:
        tips.append("Weather: Wet road surface. Avoid sudden braking and sharp leaning.")

    return tips


@app.get("/health")
def health_check():
    return jsonify({"status": "ok", "service": "route-safety-ai"})


@app.post("/api/route-safety/predict")
def predict_route_safety():
    payload = request.get_json(silent=True) or {}
    city_input = (payload.get("city") or "").strip()

    try:
        used_default_country = not city_input
        if used_default_country:
            geo_data = DEFAULT_SRI_LANKA_COORDS.copy()
            feature_lookup_key = ""
        else:
            geo_data = get_city_coordinates(city_input)
            if not geo_data:
                return jsonify({"error": f"Could not locate '{city_input}' in Sri Lanka."}), 404
            feature_lookup_key = city_input

        weather = get_live_weather_and_elevation(geo_data["lat"], geo_data["lon"])
        terrain_type = classify_terrain(weather["elevation"])

        city_features = get_city_traffic_features(feature_lookup_key)
        feature_df = pd.DataFrame([city_features], columns=FEATURE_COLUMNS)

        base_prediction = int(model.predict(feature_df)[0])
        base_risk_text = map_base_risk_label(base_prediction)

        final_risk = compute_final_risk(base_risk_text, weather["rainfall"])
        tips = build_safety_tips(
            terrain_type=terrain_type,
            elevation=weather["elevation"],
            base_risk_text=base_risk_text,
            rainfall=weather["rainfall"],
        )

        return jsonify(
            {
                "searched_input": city_input if city_input else "Sri Lanka (default)",
                "official_location": geo_data["official_name"] if used_default_country else f"{geo_data['official_name']}, Sri Lanka",
                "coordinates": {
                    "lat": geo_data["lat"],
                    "lon": geo_data["lon"],
                },
                "elevation_m": round(weather["elevation"], 1),
                "temperature_c": round(weather["temperature"], 1),
                "hourly_temperature_next_hours": weather["hourly_temperature_next_hours"],
                "humidity_percent": round(weather["humidity"], 1),
                "rainfall_mm": round(weather["rainfall"], 2),
                "base_historical_risk": base_risk_text,
                "final_risk_level": final_risk,
                "terrain_type": terrain_type,
                "safety_tips": tips,
            }
        )
    except requests.RequestException as exc:
        return jsonify({"error": f"External API error: {str(exc)}"}), 502
    except Exception as exc:  # pragma: no cover
        return jsonify({"error": f"Unexpected server error: {str(exc)}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    debug = os.getenv("FLASK_DEBUG", "false").strip().lower() in ("1", "true", "yes", "on")
    app.run(host="0.0.0.0", port=port, debug=debug)
