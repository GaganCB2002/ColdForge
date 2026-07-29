@echo off
echo =========================================
echo   Starting AI Cold Email Generator...
echo =========================================

echo.
echo [1/3] Starting Database (Docker)...
docker-compose up -d

echo.
echo [2/3] Starting Backend (FastAPI)...
cd backend
start "Backend (FastAPI)" cmd /k "call venv\Scripts\activate.bat && uvicorn app.main:app --reload"
cd ..

echo.
echo [3/3] Starting Frontend (Vite/React)...
cd frontend
start "Frontend (Vite)" cmd /k "npm run dev"
cd ..

echo.
echo =========================================
echo   All services have been started!
echo   - Backend is running in a new window
echo   - Frontend is running in a new window
echo =========================================
pause
