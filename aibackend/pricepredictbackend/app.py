import os
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "bike_price_model.joblib"
COLUMNS_PATH = BASE_DIR / "model_columns.joblib"

app = Flask(__name__)
CORS(app)

model = joblib.load(MODEL_PATH)
training_columns = list(joblib.load(COLUMNS_PATH))


PEAK_SEASON_MONTHS = {12, 1, 2, 3, 4}


def infer_peak_season() -> int:
    return 1 if datetime.now().month in PEAK_SEASON_MONTHS else 0


def safe_int(value, field_name: str):
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ValueError(f"Invalid {field_name}. Expected an integer value.")


def build_feature_row(payload: dict) -> pd.DataFrame:
    bike_type = (payload.get("bikeType") or payload.get("bike_type") or "").strip()
    fuel_type = (payload.get("fuelType") or payload.get("fuel_type") or "").strip()
    city = (payload.get("city") or "").strip()

    if not bike_type:
        raise ValueError("bikeType is required.")
    if not fuel_type:
        raise ValueError("fuelType is required.")
    if not city:
        raise ValueError("city is required.")

    engine_cc = safe_int(payload.get("engineCC") or payload.get("engine_cc"), "engineCC")

    manufacturing_year_raw = payload.get("manufacturingYear") or payload.get("manufacturing_year")
    if manufacturing_year_raw in (None, ""):
        age = safe_int(payload.get("age"), "age")
    else:
        manufacturing_year = safe_int(manufacturing_year_raw, "manufacturingYear")
        current_year = datetime.now().year
        age = max(0, current_year - manufacturing_year)

    peak_raw = payload.get("isPeakSeason")
    if peak_raw in (None, ""):
        is_peak_season = infer_peak_season()
    else:
        is_peak_season = 1 if str(peak_raw).lower() in {"1", "true", "yes", "on"} else 0

    feature_dict = {column: 0 for column in training_columns}

    if "Engine_CC" in feature_dict:
        feature_dict["Engine_CC"] = engine_cc
    if "Age" in feature_dict:
        feature_dict["Age"] = age
    if "Is_Peak_Season" in feature_dict:
        feature_dict["Is_Peak_Season"] = is_peak_season

    bike_type_column = f"Bike_Type_{bike_type}"
    fuel_type_column = f"Fuel_Type_{fuel_type}"
    city_column = f"City_{city}"

    if bike_type_column in feature_dict:
        feature_dict[bike_type_column] = 1
    if fuel_type_column in feature_dict:
        feature_dict[fuel_type_column] = 1
    if city_column in feature_dict:
        feature_dict[city_column] = 1

    return pd.DataFrame([feature_dict], columns=training_columns)


@app.get("/health")
def health_check():
    return jsonify({"status": "ok", "service": "price-predict-ai"})


@app.post("/api/price-predict/predict")
def predict_price():
    payload = request.get_json(silent=True) or {}

    try:
        features = build_feature_row(payload)
        predicted_price = float(model.predict(features)[0])

        return jsonify(
            {
                "suggested_price_lkr": round(predicted_price, 2),
                "suggested_price_rounded_lkr": int(round(predicted_price / 100.0) * 100),
                "currency": "LKR",
            }
        )
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:
        return jsonify({"error": f"Prediction failed: {error}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5003"))
    debug = os.getenv("FLASK_DEBUG", "false").strip().lower() in ("1", "true", "yes", "on")
    app.run(host="0.0.0.0", port=port, debug=debug)
