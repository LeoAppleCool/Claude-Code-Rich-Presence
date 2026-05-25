@echo off
cd /d "%~dp0"
if not exist ".env" (
    echo Fehler: .env Datei nicht gefunden.
    echo Kopiere .env.example zu .env und trage deine Discord Client ID ein.
    pause
    exit /b 1
)
if not exist "node_modules" (
    echo Installiere Abhaengigkeiten...
    npm install
)
echo Starte Claude Code Rich Presence...
npm start
pause
