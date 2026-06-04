@echo off
title DataFlow Startup Wizard
color 0B
echo ============================================================
echo      Iniciando o DataFlow (Next.js 15 + FastAPI)
echo ============================================================
echo.

echo [1/3] Iniciando o servidor Backend (FastAPI)...
start "DataFlow API" /min cmd /k "cd /d C:\dev\DataFlow\apps\api && .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo [2/3] Iniciando o servidor Frontend (Next.js)...
start "DataFlow Web" /min cmd /k "cd /d C:\dev\DataFlow\apps\web && npm run dev"

echo.
echo [3/3] Aguardando 5 segundos para os servidores inicializarem...
timeout /t 5 /nobreak >nul

echo.
echo Abrindo o DataFlow no seu navegador padrao...
start http://localhost:3000

echo.
echo ============================================================
echo   DataFlow foi iniciado com sucesso!
echo   Pressione qualquer tecla para encerrar este assistente.
echo ============================================================
pause >nul
