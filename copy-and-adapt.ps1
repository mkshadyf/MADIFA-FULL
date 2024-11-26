# Set paths
$SOURCE = "public_html"
$DEST = "madifa/src"

# Copy directories
$dirs = @(
    "components",
    "lib",
    "types",
    "app/(admin)/pages/admin",
    "app/(auth)/pages/auth",
    "app/(main)/pages/main"
)

foreach ($dir in $dirs) {
    Copy-Item -Path "$SOURCE/$dir/*" -Destination "$DEST/$dir" -Recurse -Force
}

# Copy and adapt files
Get-ChildItem -Path "$DEST" -Recurse -Include "*.tsx","*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Add React import
    if (!($content -match "import React")) {
        $content = "import React from 'react'`n$content"
    }
    
    # Replace Next.js imports
    $content = $content -replace "next/link", "react-router-dom"
    $content = $content -replace "next/navigation", "react-router-dom"
    $content = $content -replace "next/image", "react-router-dom"
    $content = $content -replace "'use client'", ""
    $content = $content -replace '"use client"', ""
    
    Set-Content $_.FullName $content
} 