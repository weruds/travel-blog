@echo off
echo ================================================
echo  KYAHWERU Travel Blog — Auto-Update ^& Deploy
echo ================================================
echo.

echo [1/5] Generating stories manifest...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0generate-stories-manifest.ps1"
if errorlevel 1 ( echo ERROR: Stories manifest failed. & pause & exit /b 1 )

echo.
echo [2/5] Generating gallery manifest...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0generate-gallery-manifest.ps1"
if errorlevel 1 ( echo ERROR: Gallery manifest failed. & pause & exit /b 1 )

echo.
echo [3/5] Updating documentation timestamp...
powershell.exe -ExecutionPolicy Bypass -Command "$f='%~dp0DOCUMENTATION.md'; $d=Get-Date -Format 'yyyy-MM-dd'; (Get-Content $f -Raw) -replace '(?<=\*\*Last updated:\*\* )\d{4}-\d{2}-\d{2}', $d | Set-Content $f -Encoding UTF8 -NoNewline; Write-Host 'DOCUMENTATION.md timestamp updated.' -ForegroundColor Cyan"

echo.
echo [4/5] Syncing travel-vlog.html to index.html (GitHub Pages)...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0sync-to-index.ps1"
if errorlevel 1 ( echo ERROR: index.html sync failed. & pause & exit /b 1 )

echo.
echo [5/5] Pushing to GitHub...
cd /d "%~dp0.."
git add bob-artifacts/ index.html
git commit -m "Auto-update: new content added on %date% %time%"
git push origin main
if errorlevel 1 ( echo ERROR: Git push failed. Check your connection or credentials. & pause & exit /b 1 )

echo.
echo ================================================
echo  Done! Live site will update in ~1 minute at:
echo  https://weruds.github.io/travel-blog/
echo ================================================
pause
