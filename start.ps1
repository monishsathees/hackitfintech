# Start both frontend and backend servers
Write-Host "Starting hackItFinTech application..." -ForegroundColor Green

# Start backend in background
Write-Host "Starting backend..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    cd "c:\Users\1moni\hackItFinTech\asset-backend"
    python -m uvicorn app:app --reload --port 8000
} -Name "backend"

# Start frontend in background
Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    cd "c:\Users\1moni\hackItFinTech\frontend"
    npx vite
} -Name "frontend"

Write-Host "`n✅ Application started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "`nJobs running:" -ForegroundColor Cyan
Get-Job
