# sync-to-index.ps1
# Injects updated __STORIES_DATA__ and __GALLERY_DATA__ from travel-vlog.html
# into index.html WITHOUT overwriting any other code improvements.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcFile   = Join-Path $scriptDir "travel-vlog.html"
$dstFile   = Join-Path $scriptDir "..\index.html"

if (-not (Test-Path $srcFile)) { Write-Host "ERROR: travel-vlog.html not found." -ForegroundColor Red; exit 1 }
if (-not (Test-Path $dstFile)) { Write-Host "ERROR: index.html not found."        -ForegroundColor Red; exit 1 }

$src = [System.IO.File]::ReadAllText($srcFile, [System.Text.Encoding]::UTF8)
$dst = [System.IO.File]::ReadAllText($dstFile, [System.Text.Encoding]::UTF8)

# Extract the two data script blocks from travel-vlog.html
$newStories = [regex]::Match($src, '<script>window\.__STORIES_DATA__=.*?;</script>').Value
$newGallery = [regex]::Match($src, '<script>window\.__GALLERY_DATA__=.*?;</script>').Value

if (-not $newStories) { Write-Host "ERROR: __STORIES_DATA__ not found in travel-vlog.html" -ForegroundColor Red; exit 1 }
if (-not $newGallery) { Write-Host "ERROR: __GALLERY_DATA__ not found in travel-vlog.html"  -ForegroundColor Red; exit 1 }

# Replace ONLY the data blocks in index.html — all other code stays untouched
$dst = [regex]::Replace($dst, '<script>window\.__STORIES_DATA__=.*?;</script>', $newStories)
$dst = [regex]::Replace($dst, '<script>window\.__GALLERY_DATA__=.*?;</script>',  $newGallery)

# Apply bob-artifacts/ path prefixes for GitHub Pages
$dst = $dst -replace '"path":"Stories/', '"path":"bob-artifacts/Stories/'
$dst = [regex]::Replace($dst,
  "'Gallery - Compiled/' \+ photo\.file : 'Gallery - Compiled/' \+ folder\.path \+ '/' \+ photo\.file",
  "'bob-artifacts/Gallery - Compiled/' + photo.file : 'bob-artifacts/Gallery - Compiled/' + folder.path + '/' + photo.file")

[System.IO.File]::WriteAllText($dstFile, $dst, [System.Text.Encoding]::UTF8)
Write-Host "index.html data blocks updated successfully (code improvements preserved)." -ForegroundColor Cyan
