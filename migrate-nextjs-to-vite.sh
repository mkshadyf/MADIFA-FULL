#!/bin/bash

# Create directories
mkdir -p src/{components,lib,pages,types}/{admin,auth,main}

# Copy components
cp -r ../public_html/components/* src/components/

# Copy lib files
cp -r ../public_html/lib/* src/lib/

# Copy types
cp -r ../public_html/types/* src/types/

# Copy and adapt pages
for dir in admin auth main; do
  cp -r "../public_html/app/($dir)"/* "src/pages/$dir/"
done

# Remove Next.js specific files
rm -rf src/pages/**/layout.tsx
rm -rf src/pages/**/loading.tsx
rm -rf src/pages/**/not-found.tsx

# Copy and adapt configuration files
cp ../public_html/.env.example .env
cp ../public_html/tailwind.config.ts tailwind.config.js
cp ../public_html/tsconfig.json tsconfig.base.json 