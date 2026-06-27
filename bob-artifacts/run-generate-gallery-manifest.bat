@echo off
powershell.exe -ExecutionPolicy Bypass -File "%~dp0generate-gallery-manifest.ps1"
pause
