@echo off
setlocal
title DataFlow Startup Wizard
color 0B

REM Resolve repo root from this script location (portable — no hardcoded C:\dev\...)
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "API_DIR=%ROOT%\apps\api"
set "WEB_DIR=%ROOT%\apps\web"

echo ============================================================
echo      Iniciando o DataFlow (Next.js 15 + FastAPI)
echo ============================================================
echo.
echo Root: %ROOT%
echo.

if not exist "%API_DIR%\app\main.py" (
  echo [ERRO] Nao encontrei apps\api. Rode este script na raiz do repositorio DataFlow.
  pause
  exit /b 1
)

echo [1/3] Iniciando o servidor Backend (FastAPI)...
if exist "%API_DIR%\.venv\Scripts\python.exe" (
  start "DataFlow API" /min cmd /k "cd /d "%API_DIR%" && .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
) else (
  echo [AVISO] .venv nao encontrado em apps\api. Criando venv e instalando deps...
  pushd "%API_DIR%"
  python -m venv .venv
  call .venv\Scripts\activate.bat
  pip install -r requirements.txt
  popd
  start "DataFlow API" /min cmd /k "cd /d "%API_DIR%" && .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
)

echo [2/3] Iniciando o servidor Frontend (Next.js)...
if not exist "%WEB_DIR%\node_modules" (
  echo [AVISO] node_modules ausente. Rodando npm install...
  pushd "%WEB_DIR%"
  call npm install
  popd
)
start "DataFlow Web" /min cmd /k "cd /d "%WEB_DIR%" && npm run dev"

echo.
echo [3/3] Aguardando 5 segundos para os servidores inicializarem...
timeout /t 5 /nobreak >nul

echo.
echo Abrindo o DataFlow no seu navegador padrao...
start http://localhost:3000

echo.
echo ============================================================
echo   DataFlow iniciado.
echo   API:  http://127.0.0.1:8000/docs
echo   Web:  http://localhost:3000
echo   Demo: http://localhost:3000/?demo=true
echo ============================================================
pause >nul
endlocal
