# ============================================================
#  generate-stories-manifest.ps1
#  Scans the Stories/ folder and injects data inline into
#  travel-vlog.html so the page works when opened via file://.
#
#  Folder convention (4 levels):
#    Stories/{Country}/{Year}/{Destination}/
#      - Storyline.txt      (optional)
#      - *.jpg / *.jpeg / *.png / *.webp  (carousel images)
#
#  Usage:
#    cd bob-artifacts
#    powershell -ExecutionPolicy Bypass -File generate-stories-manifest.ps1
# ============================================================

$scriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$storiesDir  = Join-Path $scriptDir "Stories"
$htmlFile    = Join-Path $scriptDir "travel-vlog.html"
$imageExts   = @('.jpg','.jpeg','.png','.gif','.webp','.avif','.JPEG','.JPG','.PNG','.WEBP')

$countryMeta = @{
    'Philippines' = @{ id = 'philippines'; label = 'Philippines'; region = 'Local' }
    'Vietnam'     = @{ id = 'vietnam';     label = 'Vietnam';     region = 'International' }
}

$stories = @()

# Level 1: Country
Get-ChildItem -Path $storiesDir -Directory | Sort-Object Name | ForEach-Object {
    $countryDir  = $_
    $countryName = $countryDir.Name
    $meta = $countryMeta[$countryName]
    if (-not $meta) {
        $meta = @{ id = $countryName.ToLower() -replace '\s+','-'; label = $countryName; region = 'International' }
    }

    # Level 2: Year
    Get-ChildItem -Path $countryDir.FullName -Directory | Sort-Object Name | ForEach-Object {
        $yearDir  = $_
        $year     = $yearDir.Name

        # Level 3: Destination
        Get-ChildItem -Path $yearDir.FullName -Directory | Sort-Object Name | ForEach-Object {
            $destDir   = $_
            $destName  = $destDir.Name
            $relBase   = "Stories/$countryName/$year/$destName"

            # Collect images
            $images = @()
            Get-ChildItem -Path $destDir.FullName -File |
                Where-Object { $imageExts -contains $_.Extension } |
                Sort-Object Name |
                ForEach-Object {
                    $images += @{
                        file = $_.Name
                        alt  = "$destName - $([System.IO.Path]::GetFileNameWithoutExtension($_.Name))"
                    }
                }

            # Read storyline paragraphs
            $paragraphs = @()
            $storylinePath = Join-Path $destDir.FullName "Storyline.txt"
            if (Test-Path $storylinePath) {
                $rawText = Get-Content -Path $storylinePath -Raw -Encoding UTF8
                $paragraphs = ($rawText -split '(\r?\n){2,}') |
                    ForEach-Object { $_.Trim() } |
                    Where-Object { $_ -ne '' }
            }

            $stories += @{
                id           = "$($meta.id)-$year-$($destName.ToLower() -replace '[^a-z0-9]+','-')"
                country      = $countryName
                countryId    = $meta.id
                countryLabel = $meta.label
                region       = $meta.region
                year         = $year
                destination  = $destName
                title        = $destName
                date         = $year
                path         = $relBase
                images       = $images
                paragraphs   = $paragraphs
            }
        }
    }
}

$manifest = [ordered]@{ version = 1; stories = $stories }
$json = $manifest | ConvertTo-Json -Depth 10 -Compress

# Inject into HTML
if (Test-Path $htmlFile) {
    $html = Get-Content -Path $htmlFile -Raw -Encoding UTF8
    $tag  = '<!-- ##MANIFEST## -->'
    $block = "<script>window.__STORIES_DATA__=$json;</script>"
    $html = $html -replace '<script>window\.__STORIES_DATA__=.*?;</script>\s*', ''
    $html = $html.Replace($tag, "$block`n$tag")
    Set-Content -Path $htmlFile -Value $html -Encoding UTF8 -NoNewline
    Write-Host "stories data injected into travel-vlog.html - $($stories.Count) destination(s)." -ForegroundColor Green
} else {
    Write-Host "ERROR: travel-vlog.html not found at $htmlFile" -ForegroundColor Red
}
