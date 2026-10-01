@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 22 or newer is required for this installer.
 echo Alternatively, use Import local .tbchar inside the game; no Node.js is needed for that.
 pause
 exit /b 1
)
node src\install_rescuer13.cjs
pause
