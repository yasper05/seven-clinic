# Script para configurar o Node.js portátil no Pendrive para o TCC Seven Clinic
$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    CONFIGURADOR DE PORTABILIDADE - SEVEN CLINIC TCC     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$DestFolder = Join-Path $PSScriptRoot "node-portable"
$ZipFile = Join-Path $PSScriptRoot "node-portable.zip"
$TempExtract = Join-Path $PSScriptRoot "node-temp"

# Versão do Node.js correspondente à instalada no sistema
$NodeVersion = "v24.14.0"
$Url = "https://nodejs.org/dist/$NodeVersion/node-$NodeVersion-win-x64.zip"

if (Test-Path $DestFolder) {
    Write-Host "[OK] Pasta 'node-portable' já existe. Pulando download do Node.js." -ForegroundColor Green
} else {
    try {
        Write-Host "[1/3] Fazendo o download do Node.js portátil ($NodeVersion)..." -ForegroundColor Yellow
        Write-Host "URL: $Url" -ForegroundColor Gray
        
        # Download
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $Url -OutFile $ZipFile
        
        Write-Host "[2/3] Extraindo arquivos..." -ForegroundColor Yellow
        if (Test-Path $TempExtract) { Remove-Item $TempExtract -Recurse -Force }
        Expand-Archive -Path $ZipFile -DestinationPath $TempExtract
        
        Write-Host "[3/3] Organizando diretórios..." -ForegroundColor Yellow
        $ExtractedFolder = Get-ChildItem -Path $TempExtract | Select-Object -First 1
        Move-Item -Path $ExtractedFolder.FullName -Destination $DestFolder
        
        Write-Host "[SUCESSO] Node.js portátil configurado em: $DestFolder" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERRO] Falha ao configurar o Node.js portátil: $_" -ForegroundColor Red
        Write-Host "Certifique-se de que você está conectada à internet." -ForegroundColor Yellow
    }
    finally {
        # Limpeza de arquivos temporários
        if (Test-Path $ZipFile) { Remove-Item $ZipFile -Force }
        if (Test-Path $TempExtract) { Remove-Item $TempExtract -Recurse -Force }
    }
}

# Passo adicional: Forçar instalação das dependências do Puppeteer
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    CONFIGURANDO O CHROMIUM PORTÁTIL PARA WHATSAPP        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$ApiFolder = Join-Path $PSScriptRoot "seven-clinic-api"
if (Test-Path $ApiFolder) {
    Write-Host "[1/2] Entrando na pasta do backend para baixar o Chromium..." -ForegroundColor Yellow
    
    # Vamos usar o node local se já existir, senão o global
    $NodeExe = if (Test-Path (Join-Path $DestFolder "node.exe")) { Join-Path $DestFolder "node.exe" } else { "node" }
    $NpmCmd = if (Test-Path (Join-Path $DestFolder "npm.cmd")) { Join-Path $DestFolder "npm.cmd" } else { "npm" }
    
    # Executa a instalação do Puppeteer para forçar o download local do Chromium
    Write-Host "Executando download do Chromium portátil (isso pode levar alguns minutos)..." -ForegroundColor Yellow
    
    Push-Location $ApiFolder
    try {
        # Roda o npx puppeteer browsers install chrome
        # Esse comando baixa a versão estável compatível do chrome no cache configurado
        & $NpmCmd run build --silent 2>$null
        # Para garantir que o puppeteer baixe no local do .puppeteerrc.cjs:
        & $NodeExe -e "try { const p = require('puppeteer'); console.log('[OK] Puppeteer carregado'); } catch(e) { console.log('Instalando dependências...'); }"
        
        Write-Host "Baixando navegador através do Puppeteer..." -ForegroundColor Yellow
        & $NpmCmd exec puppeteer browsers install chrome
        
        Write-Host "[SUCESSO] Navegador Chromium portátil configurado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "[ERRO] Erro ao baixar o navegador Chromium: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
} else {
    Write-Host "[ERRO] Pasta 'seven-clinic-api' não encontrada!" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    CONFIGURAÇÃO DE PORTABILIDADE CONCLUÍDA!             " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Agora o seu pendrive está pronto com Node.js e Chromium locais." -ForegroundColor White
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
