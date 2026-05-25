@echo off
set PIDFILE=%~dp0.presence.pid
if not exist "%PIDFILE%" (
    echo Claude Code Rich Presence is not running.
    timeout /t 2 /nobreak > nul
    exit /b 0
)
set /p PID=<"%PIDFILE%"
taskkill /PID %PID% /F > nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Stopped.
) else (
    echo Process not found, cleaning up.
)
del "%PIDFILE%" > nul 2>&1
timeout /t 2 /nobreak > nul
