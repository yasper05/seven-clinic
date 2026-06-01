@echo off
title Configurar Pendrive - TCC Seven Clinic
cls

echo ==========================================================
echo    INICIANDO CONFIGURADOR DE PORTABILIDADE DO PENDRIVE
echo ==========================================================
echo.
echo Este script ira baixar o Node.js portatil e o Chromium
echo diretamente para o seu pendrive. Isso garante que a
echo aplicacao funcione offline e sem precisar instalar nada
echo nos computadores da faculdade.
echo.
echo Pressione qualquer tecla para comecar...
pause > nul

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0configurar_pendrive.ps1"
