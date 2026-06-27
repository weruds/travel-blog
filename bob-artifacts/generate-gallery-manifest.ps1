# ============================================================
#  generate-gallery-manifest.ps1
#  Scans Gallery - Compiled/ and injects data inline into
#  travel-vlog.html so the page works when opened via file://.
#
#  Supports two layouts:
#    A) Flat:  Gallery - Compiled/*.jpg   (all in one "General" folder)
#    B) Nested: Gallery - Compiled/{Category}/{Destination}/*.jpg
#
#  Usage:
#    cd bob-artifacts
#    powershell -ExecutionPolicy Bypass -File generate-gallery-manifest.ps1
# ============================================================

$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$galleryDir = Join-Path $scriptDir "Gallery - Compiled"
$htmlFile   = Join-Path $scriptDir "travel-vlog.html"
$imageExts  = @('.jpg','.jpeg','.png','.gif','.webp','.avif','.JPEG','.JPG','.PNG','.WEBP')

$categories  = @()
$totalPhotos = 0

# ── Check for FLAT photos directly in root of Gallery - Compiled ──────
$flatPhotos = @()
Get-ChildItem -Path $galleryDir -File |
    Where-Object { $imageExts -contains $_.Extension } |
    Sort-Object Name |
    ForEach-Object {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
        $flatPhotos += @{ file = $_.Name; caption = $baseName; alt = "Gallery - $baseName" }
        $totalPhotos++
    }

if ($flatPhotos.Count -gt 0) {
    $categories += @{
        id      = 'all-photos'
        label   = 'All Photos'
        folders = @(@{ name = 'Gallery'; path = '.'; photos = $flatPhotos })
    }
}

# ── Check for NESTED sub-folders: {Category}/{Destination}/ ───────────
Get-ChildItem -Path $galleryDir -Directory | Sort-Object Name | ForEach-Object {
    $catDir   = $_
    $catId    = $catDir.Name.ToLower() -replace '\s+','-'
    $catLabel = $catDir.Name
    $folders  = @()

    # Direct images in the category folder itself
    $catFlat = @()
    Get-ChildItem -Path $catDir.FullName -File |
        Where-Object { $imageExts -contains $_.Extension } |
        Sort-Object Name |
        ForEach-Object {
            $b = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
            $catFlat += @{ file = $_.Name; caption = $b; alt = "$catLabel - $b" }
            $totalPhotos++
        }
    if ($catFlat.Count -gt 0) {
        $folders += @{ name = $catLabel; path = $catDir.Name; photos = $catFlat }
    }

    # Sub-folder destinations
    Get-ChildItem -Path $catDir.FullName -Directory | Sort-Object Name | ForEach-Object {
        $destDir   = $_
        $destName  = $destDir.Name
        $relFolder = "$($catDir.Name)/$destName"
        $photos    = @()
        Get-ChildItem -Path $destDir.FullName -File |
            Where-Object { $imageExts -contains $_.Extension } |
            Sort-Object Name |
            ForEach-Object {
                $b = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
                $photos += @{ file = $_.Name; caption = $b; alt = "$destName - $b" }
                $totalPhotos++
            }
        if ($photos.Count -gt 0) {
            $folders += @{ name = $destName; path = $relFolder; photos = $photos }
        }
    }

    if ($folders.Count -gt 0) {
        $categories += @{ id = $catId; label = $catLabel; folders = $folders }
    }
}

$manifest = [ordered]@{ version = 1; categories = $categories }
$json = $manifest | ConvertTo-Json -Depth 10 -Compress

# Inject into HTML — replace the <!-- ##MANIFEST## --> placeholder
if (Test-Path $htmlFile) {
    $html = Get-Content -Path $htmlFile -Raw -Encoding UTF8
    $tag  = '<!-- ##MANIFEST## -->'
    $block = "<script>window.__GALLERY_DATA__=$json;</script>"
    # Replace any previously injected gallery block plus the placeholder
    $html = $html -replace '<script>window\.__GALLERY_DATA__=.*?;</script>\s*', ''
    $html = $html.Replace($tag, "$block`n$tag")
    Set-Content -Path $htmlFile -Value $html -Encoding UTF8 -NoNewline
    Write-Host "gallery data injected into travel-vlog.html - $totalPhotos photo(s)." -ForegroundColor Green
} else {
    Write-Host "ERROR: travel-vlog.html not found at $htmlFile" -ForegroundColor Red
}
