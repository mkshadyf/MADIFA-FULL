import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import * as tseslint from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import sonarjs from 'eslint-plugin-sonarjs'
import importPlugin from 'eslint-plugin-import'

export default [
  js.configs.recommended,
  {
    ignores: ['dist', 'coverage', 'node_modules', '.git', '*.config.js']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
      'react': reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'sonarjs': sonarjs,
      'import': importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        React: true,
        JSX: true
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 20],
      'import/no-cycle': 'error',
      'react/jsx-no-leaked-render': 'warn',
    }
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'react/jsx-no-leaked-render': 'off'
    }
  }
]
