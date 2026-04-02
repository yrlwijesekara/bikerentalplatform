$ErrorActionPreference = "Stop"

$mainDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sharedVenvPython = Join-Path $mainDir ".venv\Scripts\python.exe"
$chatbotDir = Join-Path $mainDir "chatbotbackend"
$bikeRecommendationDir = Join-Path $mainDir "bikerecommendationbackend"
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
        Write-Host "  .\.venv\Scripts\python -m pip install -r bikerecommendationbackend\requirements.txt" -ForegroundColor Yellow
        exit 1
    }
}

Set-Location $mainDir
& $pythonToUse "app.py"
Write-Host "All AI services are running in the same PowerShell window"
