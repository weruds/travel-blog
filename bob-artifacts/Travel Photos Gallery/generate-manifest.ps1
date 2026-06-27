# ============================================================
#  generate-manifest.ps1
#  Run this script from the "Travel Photos Gallery" folder
#  (or from the repo root as shown below) after adding or
#  removing photos.  It scans all sub-folders and rewrites
#  gallery-manifest.json automatically.
#
#  Usage (from repo root):
#    cd "bob-artifacts\Travel Photos Gallery"
#    .\generate-manifest.ps1
# ============================================================

$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputFile = Join-Path $scriptDir "gallery-manifest.json"
$imageExts  = @('.jpg','.jpeg','.png','.gif','.webp','.avif')

# Top-level folders = categories  (e.g. "Local", "International")
$categories = @()

Get-ChildItem -Path $scriptDir -Directory | Sort-Object Name | ForEach-Object {
    $catDir   = $_
    $catId    = $catDir.Name.ToLower() -replace '\s+','-'
    $catLabel = $catDir.Name
    $folders  = @()

    # Second-level folders = destinations  (e.g. "Metro Manila", "Vietnam")
    Get-ChildItem -Path $catDir.FullName -Directory | Sort-Object Name | ForEach-Object {
        $destDir   = $_
        $destName  = $destDir.Name
        $relFolder = "$($catDir.Name)/$destName"
        $photos    = @()

        # Collect image files inside the destination folder
        Get-ChildItem -Path $destDir.FullName -File |
            Where-Object { $imageExts -contains $_.Extension.ToLower() } |
            Sort-Object Name |
            ForEach-Object {
                $baseName = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
                $photos += @{
                    file    = $_.Name
                    caption = $baseName
                    alt     = "$destName - $baseName"
                }
            }

        $folders += @{
            name   = $destName
            path   = $relFolder
            photos = $photos
        }
    }

    $categories += @{
        id      = $catId
        label   = $catLabel
        folders = $folders
    }
}

$manifest = [ordered]@{
    version     = 1
    description = "Auto-generated gallery manifest. Run generate-manifest.ps1 after adding photos."
    categories  = $categories
}

$manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $outputFile -Encoding UTF8

$totalPhotos = 0
foreach ($cat in $categories) {
    foreach ($folder in $cat.folders) {
        $totalPhotos += $folder.photos.Count
    }
}
Write-Host "gallery-manifest.json updated - $totalPhotos photo(s) across $($categories.Count) category folder(s)." -ForegroundColor Green
