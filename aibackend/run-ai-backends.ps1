$ErrorActionPreference = "Stop"

$mainDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$chatbotDir = Join-Path $mainDir "chatbotbackend"
$routeSafetyDir = Join-Path $mainDir "routesafetybackend"
$sharedVenvPython = Join-Path $mainDir ".venv\Scripts\python.exe"
$chatbotVenvPython = Join-Path $chatbotDir ".venv\Scripts\python.exe"

$pythonToUse = $sharedVenvPython

if (!(Test-Path $sharedVenvPython)) {
    if (Test-Path $chatbotVenvPython) {
        $pythonToUse = $chatbotVenvPython
        Write-Host "Shared venv not found. Using chatbotbackend/.venv" -ForegroundColor Yellow
    }
    else {
        Write-Host "No usable virtual environment found." -ForegroundColor Yellow
        Write-Host "Create shared venv with:" -ForegroundColor Yellow
        Write-Host "  cd aibackend" -ForegroundColor Yellow
        Write-Host "  py -m venv .venv" -ForegroundColor Yellow
        Write-Host "  .\.venv\Scripts\python -m pip install -r chatbotbackend\requirements.txt" -ForegroundColor Yellow
        Write-Host "  .\.venv\Scripts\python -m pip install -r routesafetybackend\requirements.txt" -ForegroundColor Yellow
        exit 1
    }
}

$chatbotCmd = "Set-Location '$chatbotDir'; & '$pythonToUse' app.py"
$routeCmd = "Set-Location '$routeSafetyDir'; & '$pythonToUse' app.py"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $chatbotCmd | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $routeCmd | Out-Null

Write-Host "Started AI chatbot backend on http://127.0.0.1:8000"
Write-Host "Started route safety backend on http://127.0.0.1:5001"
Write-Host "Both services are running in separate PowerShell windows"
