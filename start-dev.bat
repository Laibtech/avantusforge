@echo off
cd /d "%~dp0"
echo ========================================================
echo   Starting AvantusForge Development Server (Next.js)
echo   Local URL: http://localhost:3000
echo   Admin URL: http://localhost:3000/admin
echo ========================================================
echo.
npm run dev
pause

