#!/bin/bash

# Install ESLint and core dependencies
pnpm add -D eslint@^8.38.0 @typescript-eslint/eslint-plugin@^5.59.0 @typescript-eslint/parser@^5.59.0

# Install React and import-related plugins
pnpm add -D eslint-plugin-react@^7.32.2 eslint-plugin-react-hooks@^4.6.0 
pnpm add -D eslint-plugin-import@^2.27.5 eslint-import-resolver-typescript@^3.5.5

# Install accessibility and sorting plugins
pnpm add -D eslint-plugin-jsx-a11y@^6.7.1 eslint-plugin-simple-import-sort@^10.0.0

echo "ESLint dependencies installed successfully!" 