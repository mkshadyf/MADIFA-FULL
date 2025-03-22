#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting dependency update process..."

# Core Dependencies
echo "📦 Updating core dependencies..."
pnpm add react@^18.2.0 react-dom@^18.2.0 react-router-dom@^6.20.0 @tanstack/react-query@^5.8.4

# UI Dependencies
echo "🎨 Updating UI dependencies..."
pnpm add @radix-ui/react-icons@^1.3.0 @radix-ui/react-slot@^1.0.2 class-variance-authority@^0.7.0 clsx@^2.0.0 tailwindcss@^3.3.5 tailwindcss-animate@^1.0.7 postcss@^8.4.31 autoprefixer@^10.4.16

# Form Handling
echo "📝 Updating form handling dependencies..."
pnpm add react-hook-form@^7.48.2 zod@^3.22.4 @hookform/resolvers@^3.3.2

# API/Data Dependencies
echo "🔄 Updating API and data dependencies..."
pnpm add @vimeo/player@^2.20.1 swr@^2.2.4 axios@^1.6.2

# Utility Libraries
echo "🔧 Updating utility libraries..."
pnpm add date-fns@^2.30.0 lodash@^4.17.21 uuid@^9.0.1

# TypeScript
echo "📘 Updating TypeScript..."
pnpm add -D typescript@^5.2.2 @types/node@^20.9.4 @types/react@^18.2.38 @types/react-dom@^18.2.17 @types/vimeo__player@^2.18.3 @types/lodash@^4.14.202 @types/uuid@^9.0.7

# Vite and Build Tools
echo "🛠️ Updating Vite and build tools..."
pnpm add -D vite@^5.0.2 @vitejs/plugin-react@^4.2.0 vite-plugin-pwa@^0.17.2 vite-tsconfig-paths@^4.2.1 terser@^5.24.0

# ESLint and Code Quality
echo "🔍 Updating ESLint and code quality tools..."
pnpm add -D eslint@^8.54.0 @typescript-eslint/eslint-plugin@^6.12.0 @typescript-eslint/parser@^6.12.0 eslint-plugin-react@^7.33.2 eslint-plugin-react-hooks@^4.6.0 eslint-plugin-import@^2.29.0 eslint-import-resolver-typescript@^3.6.1 eslint-plugin-jsx-a11y@^6.8.0 eslint-plugin-simple-import-sort@^10.0.0

# Prettier
echo "✨ Setting up Prettier..."
pnpm add -D prettier@^3.1.0 eslint-config-prettier@^9.0.0 eslint-plugin-prettier@^5.0.1 prettier-plugin-tailwindcss@^0.5.7

# Testing Libraries
echo "🧪 Setting up testing tools..."
pnpm add -D vitest@^0.34.6 @vitest/coverage-v8@^0.34.6 @testing-library/react@^14.1.2 @testing-library/jest-dom@^6.1.4 @testing-library/user-event@^14.5.1 @testing-library/react-hooks@^8.0.1 jsdom@^23.0.0 msw@^2.0.9

# Development Utilities
echo "🧰 Adding development utilities..."
pnpm add -D npm-run-all@^4.1.5 cross-env@^7.0.3 rimraf@^5.0.5 husky@^8.0.3 lint-staged@^15.1.0 @commitlint/cli@^18.4.3 @commitlint/config-conventional@^18.4.3

# Setup Husky and lint-staged
echo "🐶 Setting up Husky and lint-staged..."
pnpm husky install || true
mkdir -p .husky

# Create pre-commit hook
cat > .husky/pre-commit << 'EOL'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
EOL
chmod +x .husky/pre-commit

# Create commit-msg hook
cat > .husky/commit-msg << 'EOL'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
EOL
chmod +x .husky/commit-msg

# Create .prettierrc
cat > .prettierrc << 'EOL'
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "avoid",
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOL

# Create .eslintignore
cat > .eslintignore << 'EOL'
node_modules
dist
coverage
public
.husky
.github
pnpm-lock.yaml
EOL

# Create commitlint.config.js
cat > commitlint.config.js << 'EOL'
module.exports = {
  extends: ['@commitlint/config-conventional']
};
EOL

# Create lint-staged.config.js
cat > lint-staged.config.js << 'EOL'
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{json,css,scss,md}': [
    'prettier --write'
  ]
};
EOL

# Update package.json scripts
# Note: This is a simplistic approach - ideally we would parse and modify the JSON directly
echo "📝 Adding useful scripts to package.json..."
if [ -f "package.json" ]; then
  TEMP_FILE=$(mktemp)
  jq '.scripts = {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "prepare": "husky install"
  }' package.json > "$TEMP_FILE" && mv "$TEMP_FILE" package.json || echo "Failed to update package.json scripts. Please update them manually."
else
  echo "package.json not found. Cannot update scripts."
fi

echo "✅ Dependency update complete! Your project now has the latest compatible dependencies and development tools." 