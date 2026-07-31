@echo off
setlocal enabledelayedexpansion
title AI Cold Email Generator - Launcher
cd /d "%~dp0"
echo =========================================
echo   Starting AI Cold Email Generator...
echo =========================================

rem --- Kill any process squatting on our ports ---
set "PORTS=8000 3000"
for %%p in (%PORTS%) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":%%p "') do (
        echo [INFO] Killing process %%a on port %%p...
        taskkill /f /pid %%a >nul 2>&1
    )
)
timeout /t 2 /nobreak >nul 2>&1 || ping -n 2 127.0.0.1 >nul

echo.
echo [1/4] Checking Ollama (local LLM: Gemma)...
curl -s --max-time 3 http://localhost:11434/api/tags >nul 2>&1
if not errorlevel 1 goto ollama_ok
echo   WARNING: Ollama is not running on http://localhost:11434
echo   Start Ollama and run:  ollama pull gemma2:2b
echo   Email generation will fail until Ollama is available.
goto ollama_done
:ollama_ok
echo   Ollama detected. Local LLM (Gemma) is ready.
:ollama_done

echo.
echo [2/4] Applying database migrations...
if not exist "%~dp0backend\venv\Scripts\activate.bat" (
    echo [INFO] Creating Python virtual environment...
    cd /d "%~dp0backend"
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
)
start "Backend Setup" /D "%~dp0backend" cmd /k "call venv\Scripts\activate.bat && alembic upgrade head && echo Migrations complete."

echo.
echo [3/4] Starting Backend (FastAPI on http://localhost:8000)...
start "Backend (FastAPI)" /D "%~dp0backend" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --port 8000"

echo.
echo [4/4] Starting Frontend (Vite on http://localhost:3000)...
if not exist "%~dp0frontend\node_modules\" (
    echo [INFO] Installing Frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
)
start "Frontend (Vite)" /D "%~dp0frontend" cmd /k "npm run dev"

echo.
echo =========================================
echo   Waiting for backend to come online...
echo =========================================
set /a tries=0
:waitloop
set /a tries+=1
curl -s --max-time 2 http://localhost:8000/health >nul 2>&1
if not errorlevel 1 goto backend_up
if %tries% geq 60 (
    echo   Backend did not become ready within 60s. Check the backend window for errors.
    goto done
)
timeout /t 1 /nobreak >nul 2>&1 || ping -n 2 127.0.0.1 >nul
goto waitloop

:backend_up
echo   Backend is up! Opening browser...
timeout /t 2 /nobreak >nul 2>&1 || ping -n 2 127.0.0.1 >nul
start http://localhost:3000

:done
echo.
echo =========================================
echo   All services have been started!
echo   - Backend : http://localhost:8000
echo   - Frontend: http://localhost:3000
echo   - Ollama  : http://localhost:11434 (must be running)
echo =========================================
pause
