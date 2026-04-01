# AI Backends (Single Main Folder Setup)

This folder contains both Flask services:
- chatbotbackend
- routesafetybackend

## One-time setup (shared environment)

Run these from the aibackend folder:

1. py -m venv .venv
2. .\.venv\Scripts\python -m pip install -r chatbotbackend\requirements.txt
3. .\.venv\Scripts\python -m pip install -r routesafetybackend\requirements.txt

## Run both services in one command

From the aibackend folder:

- Python: python app.py
- PowerShell: .\run-ai-backends.ps1
- CMD: run-ai-backends.cmd

All of the commands above run both backends in the same terminal session (no extra PowerShell windows).

This starts:
- Chatbot backend on http://127.0.0.1:8000
- Route safety backend on http://127.0.0.1:5001
