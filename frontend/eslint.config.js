import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default defineConfig([
  globalIgnores(['dist', 'ignores']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      prettier: eslintPluginPrettier
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      'prettier/prettier': [
        'warn',
        {
          arrowParens: 'always',
          semi: false,
          trailingComma: 'none',
          tabWidth: 2,
          endOfLine: 'auto',
          useTabs: false,
          singleQuote: true,
          printWidth: 100,
          jsxSingleQuote: true
        }
      ],
      'no-console': [
        'error',
        {
          //allow: ['warn', 'error', 'info'] // Cho phép một số console hợp lệ
        }
      ],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  }
])