# Route Safety Backend (Flask)

This service exposes a route risk API for Sri Lanka locations using:
- A trained risk model (`bike_risk_model.joblib`)
- Historical traffic accident features (`cleaned_traffic_data.csv`)
- Live weather + geocoding from Open-Meteo

## Run Locally

```bash
cd aibackend
py -m venv .venv
.venv\\Scripts\\python -m pip install -r chatbotbackend\\requirements.txt
.venv\\Scripts\\python -m pip install -r routesafetybackend\\requirements.txt

# run only route safety backend
cd routesafetybackend
..\\.venv\\Scripts\\python app.py
```

Server starts at `http://127.0.0.1:5001`.

## Run Both AI Backends (Single Command)

From `aibackend`:

```bash
run-ai-backends.cmd
```

or in PowerShell:

```powershell
.\\run-ai-backends.ps1
```

## API

### Health
`GET /health`

### Predict Route Risk
`POST /api/route-safety/predict`

Body:

```json
{
  "city": "Colombo"
}
```

`city` is optional. If omitted or empty, the API uses Sri Lanka default coordinates.

Response includes location, weather, hourly next-hours temperature forecast,
base risk, final risk, and safety tips.
