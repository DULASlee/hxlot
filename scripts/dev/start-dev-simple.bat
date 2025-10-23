@echo off

echo ========================================
echo    SmartAbp Development Launcher
echo ========================================
echo.

echo Cleaning ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":9001 :9002" 2^>nul') do taskkill /F /PID %%a >nul 2>&1
echo.

echo Starting backend...
start "SmartAbp Backend" cmd /k "cd /d "%~dp0..\..\src\SmartAbp.Web" && dotnet run --urls=http://localhost:9002"

timeout /t 5 /nobreak > nul

echo Starting frontend...
start "SmartAbp Frontend" cmd /k "cd /d "%~dp0..\..\src\SmartAbp.Vue" && npm run dev -- --port 9001 --host"

echo.
echo Done!
echo Backend:  http://localhost:9002
echo Frontend: http://localhost:9001
echo.
pause
