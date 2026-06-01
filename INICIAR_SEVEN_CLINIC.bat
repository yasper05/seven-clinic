@echo off
title TCC Seven Clinic - Inicializador Portatil
cls

echo ==========================================================
echo         INICIALIZADOR DO SISTEMA SEVEN CLINIC TCC
echo ==========================================================
echo.

REM 1. Verificar se o Node.js portatil existe
set PORTABLE_NODE=%~dp0node-portable
set USE_PORTABLE=0

if exist "%PORTABLE_NODE%" (
    set USE_PORTABLE=1
)

REM Exibir mensagem com base na deteccao
if "%USE_PORTABLE%"=="1" (
    echo [INFO] Usando o Node.js portatil local do pendrive...
) else (
    echo [AVISO] Pasta 'node-portable' nao encontrada. Tentando usar o Node.js do sistema...
)

REM Modificar o PATH fora de qualquer bloco de parenteses para evitar o bug do CMD com (x86)
if "%USE_PORTABLE%"=="1" set PATH=%PORTABLE_NODE%;%PATH%

REM 2. Verificar se o Node.js esta acessivel
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERRO CRITICO] O Node.js nao esta instalado no sistema e a pasta portatil nao foi encontrada!
    echo Para corrigir isso, execute primeiro o arquivo 'configurar_pendrive.bat' no seu PC com internet.
    echo.
    pause
    exit /b 1
)

REM Exibir versao do Node em uso
for /f "delims=" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js detectado! Versao em uso: %NODE_VER%
echo.

REM 3. Verificar/Instalar dependencias e compilar o Frontend
echo [1/3] Preparando o Frontend (seven-clinic)...
cd /d "%~dp0seven-clinic"
if not exist "node_modules" (
    echo [INFO] Pasta 'node_modules' do frontend nao encontrada. Instalando dependencias...
    call npm install
)

echo [INFO] Compilando a versao de producao do frontend (Vite Build)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao compilar o frontend! O sistema pode nao funcionar corretamente.
    pause
) else (
    echo [OK] Frontend compilado com sucesso!
)
echo.

REM 4. Verificar/Instalar dependencias do Backend
echo [2/3] Preparando o Backend (seven-clinic-api)...
cd /d "%~dp0seven-clinic-api"
if not exist "node_modules" (
    echo [INFO] Pasta 'node_modules' do backend nao encontrada. Instalando dependencias...
    call npm install
)

REM 5. Iniciar o Servidor Backend (que tambem servira o Frontend)
echo.
echo ==========================================================
echo [3/3] INICIANDO O SERVIDOR E ABRINDO O NAVEGADOR...
echo ==========================================================
echo.
echo * O backend ira rodar em http://localhost:3001
echo * O frontend do TCC tambem estara disponivel na mesma URL!
echo * ATENCAO: Mantenha esta janela aberta durante a apresentacao.
echo.

REM Abre o navegador apos 3 segundos
start /b cmd /c "ping 127.0.0.1 -n 4 >nul && start http://localhost:3001"

REM Inicia o backend
call npm start

pause
