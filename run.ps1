Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Starting AI Cold Email Generator..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Starting Database (Docker)..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "`n[2/3] Starting Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload" -WindowStyle Normal

Write-Host "`n[3/3] Starting Frontend (Vite/React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  All services have been started!" -ForegroundColor Green
Write-Host "  - Backend is running in a new window" -ForegroundColor Green
Write-Host "  - Frontend is running in a new window" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
