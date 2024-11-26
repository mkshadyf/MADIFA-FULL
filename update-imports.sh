#!/bin/bash

# Update imports in all TypeScript files
find src -type f -name "*.tsx" -exec sed -i '' \
  -e 's/next\/link/react-router-dom/g' \
  -e 's/next\/navigation/react-router-dom/g' \
  -e 's/next\/image/react-router-dom/g' \
  -e 's/use client//g' {} + 