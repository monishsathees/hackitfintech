@echo off
REM Start hackItFinTech application with both frontend and backend

echo Starting hackItFinTech...
echo.

REM Start backend in new window
echo Starting Backend (FastAPI)...
start cmd /k "cd asset-backend && python -m uvicorn app:app --reload --port 8000"

REM Wait 2 seconds for backend to start
timeout /t 2 /nobreak

REM Start frontend in new window
echo Starting Frontend (Vite)...
start cmd /k "cd frontend && npx vite"

echo.
echo ✅ Application started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
pause
