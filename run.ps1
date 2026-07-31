Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Starting AI Cold Email Generator..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$ErrorActionPreference = "SilentlyContinue"
$projectRoot = $PSScriptRoot

# --- Free up our ports (8000, 3000) from any conflicting process ---
foreach ($port in @(8000, 3000)) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        Write-Host "[INFO] Killing process $($c.OwningProcess) on port $port..." -ForegroundColor Yellow
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2

# --- Check Ollama is running (local LLM: Gemma) ---
try {
    $null = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3
    Write-Host "`n[1/4] Ollama detected. Local LLM (Gemma) is ready." -ForegroundColor Green
} catch {
    Write-Host "`n[1/4] WARNING: Ollama is not running on http://localhost:11434" -ForegroundColor Yellow
    Write-Host "  Start Ollama and run:  ollama pull gemma2:2b" -ForegroundColor Yellow
    Write-Host "  Email generation will fail until Ollama is available." -ForegroundColor Yellow
}

# --- Apply database migrations ---
Write-Host "`n[2/4] Applying database migrations..." -ForegroundColor Yellow
if (-not (Test-Path "$projectRoot\backend\venv\Scripts\Activate.ps1")) {
    Write-Host "[INFO] Creating Python virtual environment and installing dependencies..." -ForegroundColor Cyan
    Set-Location "$projectRoot\backend"
    python -m venv venv
    & "$projectRoot\backend\venv\Scripts\Activate.ps1"
    pip install -r requirements.txt
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend'; . .\venv\Scripts\Activate.ps1; alembic upgrade head; Write-Host 'Migrations complete.'" -WindowStyle Normal

# --- Backend ---
Write-Host "`n[3/4] Starting Backend (FastAPI on http://localhost:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend'; . .\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload --port 8000" -WindowStyle Normal

# --- Frontend ---
Write-Host "`n[4/4] Starting Frontend (Vite on http://localhost:3000)..." -ForegroundColor Yellow
if (-not (Test-Path "$projectRoot\frontend\node_modules")) {
    Write-Host "[INFO] Installing Frontend dependencies..." -ForegroundColor Cyan
    Set-Location "$projectRoot\frontend"
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\frontend'; npm run dev" -WindowStyle Normal

# --- Wait for backend health, then open browser ---
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  Waiting for backend to come online..." -ForegroundColor Green
$tries = 0
while ($tries -lt 60) {
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 2
        Write-Host "  Backend is up! Opening browser..." -ForegroundColor Green
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3000"
        break
    } catch {
        $tries++
        Start-Sleep -Seconds 1
    }
}
if ($tries -ge 60) {
    Write-Host "  Backend did not become ready within 60s. Check the backend window for errors." -ForegroundColor Red
}

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  All services have been started!" -ForegroundColor Green
Write-Host "  - Backend : http://localhost:8000" -ForegroundColor Green
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  - Ollama  : http://localhost:11434 (must be running)" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
