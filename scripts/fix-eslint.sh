#!/bin/bash

# Remove void return type annotations from function declarations
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/function \([a-zA-Z0-9_]*\): void/function \1/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/function \([a-zA-Z0-9_]*\): void (/function \1(/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/export default function \([a-zA-Z0-9_]*\): void/export default function \1/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/export function \([a-zA-Z0-9_]*\): void/export function \1/g'

# Convert all HTML entities back to regular quotes
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/&apos;/'/g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/&quot;/"/g'

# Fix import statements
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/from &apos;/from '/g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/from &quot;/from "/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/&apos;$/'/g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/&quot;$/"/g'

# Fix JSX attributes
find src -type f -name "*.tsx" | xargs sed -i "s/className=&apos;/className='/g"
find src -type f -name "*.tsx" | xargs sed -i 's/className=&quot;/className="/g'
find src -type f -name "*.tsx" | xargs sed -i "s/&apos;}/'}/"
find src -type f -name "*.tsx" | xargs sed -i 's/&quot;}/"}/'

# Run ESLint fix
npx eslint --fix "src/**/*.{ts,tsx}"

# Run Prettier
npx prettier --write "src/**/*.{ts,tsx,json,md}"