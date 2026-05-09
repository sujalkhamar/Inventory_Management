@echo off
echo ==============================================
echo Starting Inventory Management System
echo ==============================================

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Starting ML Service...
start "ML Service" cmd /k "cd ml_service && venv\Scripts\activate && python main.py"

echo ==============================================
echo All services have been launched in new windows!
echo ==============================================
