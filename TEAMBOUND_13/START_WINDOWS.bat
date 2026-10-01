@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 22 or newer, then reopen this file.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<22){console.error('Node.js 22 or newer is required.');process.exit(1)}"
if errorlevel 1 (
  pause
  exit /b 1
)
echo TEAMBOUND 13 - one host, one shared server.
echo Close an old TEAMBOUND server first if its port is already in use.
echo Keep this terminal open. Share the invite from this server's page.
echo.
node server.js
if errorlevel 1 echo Server stopped with an error. Read the message above; check the port and Node version.
pause
