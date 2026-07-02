@echo off
title Neural Brain Dev Suite
echo ===================================================
echo   🧠 STARTING NEURAL BRAIN DEVELOPMENT SUITE 🧠
echo ===================================================
echo.

:: 1. Check if Ollama is already running on default port 11434
netstat -ano | findstr ":11434" >nul
if %errorlevel% neq 0 (
    echo [1/3] Booting Local Ollama Server on port 11434...
    start "Ollama Engine" /min "C:\Users\ishar\AppData\Local\Programs\Ollama\ollama.exe" serve
    timeout /t 3 /nobreak >nul
) else (
    echo [1/3] Ollama is already running on port 11434.
)

:: 2. Launch browser automatically in the background
echo [2/3] Preparing to open Dashboard in default browser...
start http://localhost:5180

:: 3. Launch Dashboard dev server directly in this window
echo [3/3] Booting Vite Frontend + Express Backend...
echo.
echo ---------------------------------------------------
echo   Dev servers are launching below. 
echo   Close this window to stop the Second Brain.
echo ---------------------------------------------------
echo.
cd /d "C:\Users\ishar\Projects\SecondBrain\90_System\dashboard"
npm run dev
