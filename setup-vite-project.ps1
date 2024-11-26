# Setup script for migrating Next.js to Vite project
Write-Host "Starting Next.js to Vite migration..." -ForegroundColor Green

# Set correct source and destination paths
$SOURCE_DIR = "public_html"
$DEST_DIR = "madifa"

# Ensure we're in the correct directory
Set-Location "MADIFA FULL"

# Create base directories
$directories = @(
    "madifa/src/components/admin",
    "madifa/src/components/ads",
    "madifa/src/components/auth",
    "madifa/src/components/content",
    "madifa/src/components/layout",
    "madifa/src/components/onboarding/steps",
    "madifa/src/components/providers",
    "madifa/src/components/search",
    "madifa/src/components/subscription",
    "madifa/src/components/ui",
    "madifa/src/components/user",
    "madifa/src/lib/config",
    "madifa/src/lib/db",
    "madifa/src/lib/hooks",
    "madifa/src/lib/services",
    "madifa/src/lib/supabase",
    "madifa/src/lib/types",
    "madifa/src/lib/utils",
    "madifa/src/lib/workers",
    "madifa/src/pages/admin",
    "madifa/src/pages/auth",
    "madifa/src/pages/main",
    "madifa/src/routes",
    "madifa/src/styles",
    "madifa/src/types"
)

foreach ($dir in $directories) {
    New-Item -Path $dir -ItemType Directory -Force
    Write-Host "Created directory: $dir" -ForegroundColor Yellow
}

# Copy components
Write-Host "Copying components..." -ForegroundColor Cyan
Copy-Item -Path "$SOURCE_DIR/components/*" -Destination "$DEST_DIR/src/components" -Recurse -Force

# Copy lib files
Write-Host "Copying lib files..." -ForegroundColor Cyan
Copy-Item -Path "$SOURCE_DIR/lib/*" -Destination "$DEST_DIR/src/lib" -Recurse -Force

# Copy types
Write-Host "Copying types..." -ForegroundColor Cyan
Copy-Item -Path "$SOURCE_DIR/types/*" -Destination "$DEST_DIR/src/types" -Recurse -Force

# Copy and adapt pages
Write-Host "Copying pages..." -ForegroundColor Cyan
Copy-Item -Path "$SOURCE_DIR/app/(admin)/*" -Destination "$DEST_DIR/src/pages/admin" -Recurse -Force
Copy-Item -Path "$SOURCE_DIR/app/(auth)/*" -Destination "$DEST_DIR/src/pages/auth" -Recurse -Force
Copy-Item -Path "$SOURCE_DIR/app/(main)/*" -Destination "$DEST_DIR/src/pages/main" -Recurse -Force

# Copy styles
Write-Host "Copying styles..." -ForegroundColor Cyan
Copy-Item -Path "$SOURCE_DIR/app/globals.css" -Destination "$DEST_DIR/src/styles/globals.css" -Force

# Copy configuration files
Write-Host "Copying configuration files..." -ForegroundColor Cyan
Copy-Item -Path "$SOURCE_DIR/.env.example" -Destination "$DEST_DIR/.env" -Force
Copy-Item -Path "$SOURCE_DIR/tailwind.config.ts" -Destination "$DEST_DIR/tailwind.config.js" -Force

# Remove Next.js specific files
Write-Host "Removing Next.js specific files..." -ForegroundColor Magenta
Get-ChildItem -Path "$DEST_DIR/src/pages" -Recurse -Include "layout.tsx", "loading.tsx", "not-found.tsx" | Remove-Item -Force

# Update import statements in all TypeScript files
Write-Host "Updating imports..." -ForegroundColor Cyan
$files = Get-ChildItem -Path "$DEST_DIR/src" -Recurse -Include "*.tsx", "*.ts"
foreach ($file in $files) {
    (Get-Content $file.FullName) | 
        ForEach-Object {
            $_ -replace "next/link", "react-router-dom" `
               -replace "next/navigation", "react-router-dom" `
               -replace "next/image", "react-router-dom" `
               -replace "'use client'", "" `
               -replace '"use client"', ""
        } | Set-Content $file.FullName
}

Write-Host "Migration complete!" -ForegroundColor Green
Write-Host @"

Next steps:
1. Run 'npm install' to install dependencies
2. Check for any TypeScript errors
3. Update import paths if needed
4. Test the application with 'npm run dev'

"@ -ForegroundColor Yellow 