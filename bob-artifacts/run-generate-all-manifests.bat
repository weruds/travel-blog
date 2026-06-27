@echo off
echo Generating stories manifest...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0generate-stories-manifest.ps1"
echo.
echo Generating gallery manifest...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0generate-gallery-manifest.ps1"
echo.
echo Updating documentation timestamp...
powershell.exe -ExecutionPolicy Bypass -Command "$f='%~dp0DOCUMENTATION.md'; $d=Get-Date -Format 'yyyy-MM-dd'; (Get-Content $f -Raw) -replace '(?<=\*\*Last updated:\*\* )\d{4}-\d{2}-\d{2}', $d | Set-Content $f -Encoding UTF8 -NoNewline; Write-Host 'DOCUMENTATION.md timestamp updated.' -ForegroundColor Cyan"
echo.
echo Done! Reload travel-vlog.html in your browser to see the changes.
pause
