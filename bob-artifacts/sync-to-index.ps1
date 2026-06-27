# sync-to-index.ps1
# Copies travel-vlog.html to ../index.html with the bob-artifacts/ path prefix applied

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcFile   = Join-Path $scriptDir "travel-vlog.html"
$dstFile   = Join-Path $scriptDir "..\index.html"

$src = [System.IO.File]::ReadAllText($srcFile, [System.Text.Encoding]::UTF8)

# Fix story image paths
$src = $src -replace '"path":"Stories/', '"path":"bob-artifacts/Stories/'

# Fix gallery image paths
$src = $src -replace "'Gallery - Compiled/' \+ photo\.file : 'Gallery - Compiled/' \+ folder\.path \+ '/' \+ photo\.file",
                     "'bob-artifacts/Gallery - Compiled/' + photo.file : 'bob-artifacts/Gallery - Compiled/' + folder.path + '/' + photo.file"

[System.IO.File]::WriteAllText($dstFile, $src, [System.Text.Encoding]::UTF8)
Write-Host "index.html synced successfully." -ForegroundColor Cyan
