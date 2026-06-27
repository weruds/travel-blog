# KYAHWERU Travel Vlog - Project Documentation

> **Last updated:** 2026-06-28
> Maintain this file. Every future change must add an entry under the Changelog section.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Files Reference](#3-files-reference)
4. [How the Site Works](#4-how-the-site-works)
5. [Workflow - Adding Content](#5-workflow---adding-content)
   - [5.1 Add a New Story / Destination](#51-add-a-new-story--destination)
   - [5.2 Add Photos to the Gallery](#52-add-photos-to-the-gallery)
   - [5.3 Updating Both at Once](#53-updating-both-at-once)
6. [Folder Conventions](#6-folder-conventions)
   - [6.1 Stories Folder Structure](#61-stories-folder-structure)
   - [6.2 Gallery - Compiled Folder Structure](#62-gallery---compiled-folder-structure)
7. [Publishing Guide](#7-publishing-guide)
8. [Security Features](#8-security-features)
9. [Footer Social Links](#9-footer-social-links)
10. [Changelog](#10-changelog)

---

## 1. Project Overview

**KYAHWERU** is a personal travel vlog - a fully self-contained, static HTML website.
It works both as a local file (`file://`) and as a hosted website on any static web host.

| Property     | Value                                                     |
|--------------|-----------------------------------------------------------|
| Owner        | Wilson Serquina                                           |
| Brand        | KYAHWERU                                                  |
| Entry point  | `bob-artifacts/travel-vlog.html`                          |
| Stylesheet   | `bob-artifacts/travel-vlog.css`                           |
| Theme        | Amber / orange / black - Gen Z palette, light + dark mode |

---

## 2. Folder Structure

```
bob-artifacts/
|
|-- travel-vlog.html                  <- Main website (open this in a browser)
|-- travel-vlog.css                   <- All styles
|
|-- DOCUMENTATION.md                  <- This file
|
|-- stories-manifest.json             <- Auto-generated, do not edit manually
|-- gallery-compiled-manifest.json    <- Auto-generated, do not edit manually
|
|-- generate-stories-manifest.ps1     <- Scans Stories/ and injects data into HTML
|-- generate-gallery-manifest.ps1     <- Scans Gallery - Compiled/ and injects data into HTML
|
|-- run-generate-all-manifests.bat    <- Double-click after ANY content change
|-- run-generate-stories-manifest.bat <- Runs only the stories script
|-- run-generate-gallery-manifest.bat <- Runs only the gallery script
|
|-- Stories/
|   |-- Philippines/
|   |   |-- 2024/                     <- Year subfolder (empty)
|   |   |-- 2025/
|   |   |   `-- San Vicente, Palawan/
|   |   |       |-- Storyline.txt     <- Story paragraphs (blank lines = paragraph breaks)
|   |   |       `-- *.jpeg            <- Carousel photos
|   |   `-- 2026/
|   `-- Vietnam/
|       |-- 2024/
|       |   |-- Ha Long Bay/
|       |   |-- Hanoi/
|       |   |-- Ninh Binh/
|       |   `-- Sapa/
|       |-- 2025/
|       `-- 2026/
|
|-- Gallery - Compiled/
|   |-- IMG_0701.JPEG                 <- Flat drop - photos go here directly
|   |-- IMG_0703.JPEG
|   `-- ... (18 photos total)
|
`-- Travel Photos Gallery/            <- Legacy folder (no longer used by the site)
```

---

## 3. Files Reference

| File                              | Purpose                                                           | Edit manually? |
|-----------------------------------|-------------------------------------------------------------------|----------------|
| `travel-vlog.html`                | The entire website - HTML + inline JS + injected data             | Only for structural/feature changes |
| `travel-vlog.css`                 | All visual styles                                                 | Yes, for design changes |
| `generate-stories-manifest.ps1`   | Scans `Stories/` and injects `window.__STORIES_DATA__` into HTML  | No |
| `generate-gallery-manifest.ps1`   | Scans `Gallery - Compiled/` and injects `window.__GALLERY_DATA__` | No |
| `run-generate-all-manifests.bat`  | Runs both PS1 scripts + updates doc timestamp                     | No |
| `stories-manifest.json`           | Snapshot of last generated stories data                           | No - auto-generated |
| `gallery-compiled-manifest.json`  | Snapshot of last generated gallery data                           | No - auto-generated |
| `DOCUMENTATION.md`                | This file - project reference and changelog                       | Yes, add changelog entries |

---

## 4. How the Site Works

The site is **100% static** and works on both `file://` and `https://` URLs.

### Data injection pattern

Because `fetch()` is blocked on `file://` URLs by browsers, all dynamic data is
**embedded directly into `travel-vlog.html`** as inline `<script>` tags in the `<head>`:

```html
<script>window.__GALLERY_DATA__={ ... };</script>
<script>window.__STORIES_DATA__={ ... };</script>
<!-- ##MANIFEST## -->
```

The `<!-- ##MANIFEST## -->` comment is the **injection anchor** used by the PowerShell
scripts. Every time you run the `.bat` file, the scripts replace the old data blocks
with freshly scanned content.

### Destinations (Blog Cards)

- Read from `window.__STORIES_DATA__`
- Each entry maps to one `Stories/{Country}/{Year}/{Destination}/` folder
- Cards with images -> photo carousel (auto-advances every 3.2 s)
- Cards without images -> SVG artwork placeholder (Ha Long Bay, Hanoi, Ninh Binh, Sapa)
- Filter pills auto-generate from unique countries (grouped Local / International)

### Gallery

- Read from `window.__GALLERY_DATA__`
- Photos can be dropped flat into `Gallery - Compiled/` or organised into sub-folders
- Click any photo -> full-size modal (image only, no filename shown)
- Filter bar only appears when there are 2+ named categories

### Dark / Light Mode

Toggled via a hidden `<input type="checkbox" id="themeChk">`. State is CSS-only (no JS, no localStorage).

---

## 5. Workflow - Adding Content

### 5.1 Add a New Story / Destination

1. Create: `Stories/{Country}/{Year}/{Destination Name}/`
   - Example: `Stories/Philippines/2026/Coron, Palawan/`
2. Drop photos (`.jpg`, `.jpeg`, `.png`, `.webp`) into the folder
3. *(Optional)* Create `Storyline.txt` - use blank lines to separate paragraphs
4. Double-click **`run-generate-all-manifests.bat`**
5. Reload `travel-vlog.html`

> If the country is new (not Philippines or Vietnam), it auto-detects as "International".
> To change the region label, edit `$countryMeta` in `generate-stories-manifest.ps1`.

### 5.2 Add Photos to the Gallery

**Option A - Flat (simplest):** Drop files directly into `Gallery - Compiled/`

**Option B - Organised:** Create sub-folders: `Gallery - Compiled/{Category}/{Destination}/`
- When 2+ categories exist, filter buttons auto-appear above the gallery

After dropping files, double-click **`run-generate-all-manifests.bat`** and reload.

### 5.3 Updating Both at Once

```
Double-click:  bob-artifacts/run-generate-all-manifests.bat
Then reload:   travel-vlog.html
```

---

## 6. Folder Conventions

### 6.1 Stories Folder Structure

```
Stories/
  {Country}/          <- e.g. Philippines, Vietnam, Japan
    {Year}/           <- e.g. 2024, 2025, 2026
      {Destination}/  <- e.g. San Vicente Palawan, Hanoi
        Storyline.txt (optional)
        photo1.jpeg
        photo2.jpeg
```

- **Country** - determines filter pill label and Local/International grouping
- **Year** - displayed on the card as the date (e.g. `2025 - San Vicente, Palawan`)
- **Destination** - becomes the card title and meta location label
- **Storyline.txt** - paragraphs separated by blank lines; shown in the expanded card overlay

### 6.2 Gallery - Compiled Folder Structure

```
Gallery - Compiled/
  photo1.jpg           <- Flat drop (simplest)
  photo2.jpg
  ...
  OR
  {Category}/          <- e.g. Local, International
    {Destination}/     <- e.g. Metro Manila, Vietnam
      photo1.jpg
```

- Flat photos -> grouped under "All Photos" (no filter bar shown)
- 2+ named category folders -> filter bar appears automatically

---

## 7. Publishing Guide

The site is a static folder - no build step, no backend needed.
The recommended free host is **Netlify Drop** (fastest, no account required for a test).
For a permanent URL, use **GitHub Pages** (free, your own domain possible).

---

### Option A - Netlify Drop (Quickest - Live in 2 Minutes)

**What you need:** A browser. No account required for a temporary URL.

1. Go to **https://app.netlify.com/drop**
2. Open File Explorer and navigate to `C:\kyahweru\bob-artifacts\`
3. Select the entire **`bob-artifacts`** folder and drag it onto the Netlify Drop page
4. Netlify gives you a live URL like `https://random-name-12345.netlify.app` instantly
5. Share that URL

**Limitations of free drop:**
- URL is random (e.g. `random-name.netlify.app`) - not a custom domain
- Site expires after some time unless you create a free account and claim it
- To get a custom domain or permanent URL, create a free Netlify account

**To make it permanent with a free account:**
1. Sign up at https://app.netlify.com (free)
2. After dropping, click **"Claim site"** and log in
3. Rename the site to `kyahweru` -> URL becomes `kyahweru.netlify.app`
4. (Optional) Add a custom domain from the Site Settings panel

---

### Option B - GitHub Pages (Free Permanent URL)

**What you need:** A free GitHub account.

1. Go to https://github.com and create a free account if you don't have one
2. Create a new repository named **`kyahweru`** (set to Public)
3. Upload the entire `bob-artifacts` folder contents as the repository root:
   - Drag all files/folders from `bob-artifacts\` directly into the GitHub web uploader
   - **Important:** The file `travel-vlog.html` must be renamed to `index.html` before uploading
4. Go to **Settings > Pages > Source** and select `main` branch, `/ (root)` folder
5. Click Save - your site will be live at `https://yourusername.github.io/kyahweru/`

**Renaming travel-vlog.html to index.html:**
- Before uploading, make a copy of `travel-vlog.html` named `index.html`
- Upload `index.html` (not `travel-vlog.html`) as the entry point

---

### Option C - Custom Domain (Any Host)

If you already have a hosting provider (GoDaddy, Hostinger, etc.):

1. Run `run-generate-all-manifests.bat` one final time to ensure all data is fresh
2. Use your host's File Manager or FTP client to upload the **entire `bob-artifacts` folder**
3. The upload must preserve this exact structure:
   ```
   / (web root or subdirectory)
   |-- index.html             <- rename travel-vlog.html to this
   |-- travel-vlog.css
   |-- Stories/
   |-- Gallery - Compiled/
   ```
4. Point your domain to the folder containing `index.html`

---

### What to Upload - Checklist

Before uploading to any host, confirm these files/folders are included:

- [x] `travel-vlog.html` (rename to `index.html` for most hosts)
- [x] `travel-vlog.css`
- [x] `Stories/` folder with all sub-folders and images
- [x] `Gallery - Compiled/` folder with all photos
- **Do NOT upload** (not needed on the web):
  - `*.ps1` scripts
  - `*.bat` files
  - `*.json` manifest files
  - `DOCUMENTATION.md`
  - `Travel Photos Gallery/` (legacy, unused)

---

### After Publishing - Updating the Live Site

Every time you add new content:

1. Run `run-generate-all-manifests.bat` locally
2. Re-upload only the changed files:
   - Always re-upload `travel-vlog.html` (it contains the injected data)
   - Upload any new photos in `Stories/` or `Gallery - Compiled/`

---

## 8. Security Features

All security runs client-side in `travel-vlog.html`.

| # | Feature | Method |
|---|---|---|
| 1 | Right-click blocked | `contextmenu` event cancelled everywhere |
| 2 | Image drag blocked | `dragstart` cancelled on `IMG`, `SVG`, `.blog-card-img`, `.masonry-item` |
| 3 | F12 blocked | `keydown` -> `e.key === 'F12'` -> prevented + warning shown |
| 4 | Ctrl+Shift+I/J/C blocked | All three DevTools keyboard shortcuts intercepted |
| 5 | Ctrl+S / Ctrl+U / Ctrl+P blocked | Save, view-source, print silently blocked |
| 6 | PrintScreen | Warning shown + white flash overlay |
| 7 | DevTools size detection | Checks `outerWidth - innerWidth > 160px` every 800 ms -> blurs page + warning |
| 8 | DevTools timing detection | `performance.now()` delta check every 3 s |
| 9 | Window blur / focus | Page blurs to `blur(20px)` the moment window loses focus |
| 10 | Visibility change | `document.hidden` -> immediate blur; unblurs 600 ms after returning |
| 11 | Mouse leaves viewport | `mouseleave` on `<html>` -> blurs; `mouseenter` -> unblurs |
| 12 | Touch-hold blocked | `touchstart` prevented on all images (mobile long-press save) |
| 13 | Download link intercept | `<a download>` and `blob:` URLs blocked with warning |
| 14 | Text selection blocked | `selectstart` cancelled outside `input`/`textarea` |
| 15 | Copy / Cut blocked | `copy` and `cut` events cancelled |
| 16 | CSS watermark | Ghost `(C) KYWR Travel Vlog` rotated text overlaid on every image via `::after` |
| 17 | CSP header | `Content-Security-Policy` meta tag blocks external resources, iframes, object embeds |

> **Known limitation:** OS-level screen recorders on a second monitor cannot be stopped by browser JS.
> The blur-on-focus-loss protections make any captured content unusable in most practical cases.

---

## 9. Footer Social Links

| Platform  | URL                                              |
|-----------|--------------------------------------------------|
| Instagram | https://www.instagram.com/kyahweru/              |
| Facebook  | https://www.facebook.com/wilson.serquina.50      |
| LinkedIn  | https://www.linkedin.com/in/wserquina/           |

All links open in a new tab with `target="_blank" rel="noopener"`.

---

## 10. Changelog

All changes are listed newest-first.

---

### 2026-06-29 - Pre-publish Fixes

**Files:** `travel-vlog.html`

- Changed `<meta name="robots">` from `noindex, nofollow` to `index, follow` so search engines can index the site
- Updated `<title>` from `"My Travel Vlog"` to `"KYAHWERU - Travel Vlog by Wilson Serquina"`

---

### 2026-06-28 - Security Hardening: Snip Tool & Screen Recording

**Files:** `travel-vlog.html`

- Upgraded focus-loss protection: page blurs to `blur(20px)` on `window.blur`, `visibilitychange`, `mouseleave`, and `pagehide`
- Unblur delayed by 600 ms on focus return so transition frames remain blurred
- Re-enabled DevTools size detection (`setInterval` every 800 ms)
- Re-enabled DevTools timing detection (`setInterval` every 3 s)
- Added F12 block with warning dialog
- Added Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C blocks with warning

---

### 2026-06-28 - Gallery Modal: Remove Filename & Title

**Files:** `travel-vlog.html`, `travel-vlog.css`

- `modalTitle` and `modalDesc` cleared to `''` when opening gallery photo
- Added `.modal-info h3:empty` and `.modal-info p:empty` -> `display:none` so the white info bar collapses completely

---

### 2026-06-28 - Footer Social Links Updated

**Files:** `travel-vlog.html`

- Replaced placeholder `#` links with real URLs
- Added Facebook and LinkedIn; removed YouTube
- All links: `target="_blank" rel="noopener"`

---

### 2026-06-28 - Gallery Filter Buttons Removed

**Files:** `travel-vlog.html`

- `galleryFilterBar` starts hidden (`style="display:none"`)
- `buildGalleryFilters()` only shows the bar when there are 2+ distinct named categories
- Eliminates "ALL" and "ALL PHOTOS" buttons that appeared for single flat folders

---

### 2026-06-28 - Stories: Year Subfolder Support

**Files:** `generate-stories-manifest.ps1`, `travel-vlog.html`

- Folder depth changed from `Stories/{Country}/{Destination}/` to `Stories/{Country}/{Year}/{Destination}/`
- PowerShell script updated to walk 4 levels: Country -> Year -> Destination
- Year folder name is now used as the `date` field on the card meta line

---

### 2026-06-28 - Security Features Re-enabled

**Files:** `travel-vlog.html`

- F12, Ctrl+Shift+I/J/C keyboard blocks activated
- DevTools size and timing detection `setInterval` calls uncommented and made active
- Visibility change blur added

---

### 2026-06-28 - Gallery Hover Caption Removed

**Files:** `travel-vlog.css`

- `.masonry-caption` -> `display:none` - filename/category label no longer shows on hover
- Hover overlay opacity reduced from `rgba(0,0,0,0.5)` to `rgba(0,0,0,0.18)`

---

### 2026-06-28 - Gallery Source Changed to Gallery - Compiled

**Files:** `travel-vlog.html`, `generate-gallery-manifest.ps1`

- Gallery section now reads from `Gallery - Compiled/` instead of `Travel Photos Gallery/`
- Script updated to support flat photo drops and nested sub-folders
- Extension matching made case-insensitive (`.JPEG`, `.JPG` now detected)

---

### 2026-06-27 - Switched from fetch() to Inline Data Injection

**Files:** `travel-vlog.html`, `generate-stories-manifest.ps1`, `generate-gallery-manifest.ps1`

- `fetch()` removed - was silently blocked on `file://` URLs in Chromium/Edge
- Both PowerShell scripts now inject `window.__STORIES_DATA__` and `window.__GALLERY_DATA__` directly into the HTML `<head>` via a `<!-- ##MANIFEST## -->` anchor
- `.bat` launcher files added to bypass PowerShell execution policy
- Removed all empty-state / remark messages from both sections

---

### 2026-06-27 - Dynamic Blog Cards from Stories Folder

**Files:** `travel-vlog.html`, `generate-stories-manifest.ps1`

- Removed all hardcoded HTML blog cards
- Blog grid now renders dynamically from `window.__STORIES_DATA__`
- Filter bar auto-builds from unique countries (grouped Local / International)
- Cards with photos -> photo carousel; cards without -> SVG artwork placeholder
- SVG artwork preserved for Ha Long Bay, Hanoi, Ninh Binh, Sapa

---

### 2026-06-27 - Dynamic Gallery from Gallery - Compiled

**Files:** `travel-vlog.html`, `generate-gallery-manifest.ps1`

- Gallery masonry grid now renders dynamically from `window.__GALLERY_DATA__`
- Category filter pills auto-generate (hidden when fewer than 2 categories)
- Click-to-enlarge modal added
- `generate-gallery-manifest.ps1` created

---

### 2026-06-27 - Initial Auto-Upload System

**Files:** `travel-vlog.html`, `Travel Photos Gallery/gallery-manifest.json`, `Travel Photos Gallery/generate-manifest.ps1`

- First dynamic gallery implementation using `Travel Photos Gallery/` as source
- `gallery-manifest.json` introduced as a machine-readable registry
- *(Later superseded by the Gallery - Compiled system)*
