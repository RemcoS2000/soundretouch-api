// @ts-check
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'

import prettier from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
import sonarjs from 'eslint-plugin-sonarjs'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

// Production and tooling use type-aware linting. Jest/Vitest fixtures retain standard
// TypeScript linting: their deliberately replaced runtime modules do not share production types.
const typedFiles = ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', 'proxy/**/*.ts', 'scripts/**/*.ts', 'index*.ts', '*config.ts', 'tests/browser/**/*.ts']

/** @type {import('eslint').Linter.Config} */
const quality = {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { sonarjs, '@stylistic': stylistic, jsdoc },
    settings: { jsdoc: { mode: 'typescript' } },
    rules: {
        'sonarjs/cognitive-complexity': ['error', 15],
        complexity: ['warn', 10],
        'max-depth': ['error', 3],
        'max-nested-callbacks': ['warn', 3],
        'max-params': ['warn', 4],
        'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
        'no-nested-ternary': 'error',
        curly: ['error', 'all'],
        '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false }],
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
        '@stylistic/padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'always', prev: ['const', 'let'], next: '*' },
            { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
        ],
        'jsdoc/check-param-names': 'error',
        'jsdoc/check-tag-names': 'error',
        'jsdoc/require-description': 'error',
        'jsdoc/require-jsdoc': [
            'error',
            {
                require: { FunctionDeclaration: true, MethodDefinition: true },
            },
        ],
    },
}

export default tseslint.config(
    { ignores: ['node_modules/**', 'dist/**', '.expo/**', 'coverage/**', 'reports/**', 'android/**', 'ios/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended.map((config) => ({ ...config, files: ['**/*.{ts,tsx}'] })),
    ...tseslint.configs.recommendedTypeChecked.map((config) => ({ ...config, files: typedFiles })),
    {
        files: typedFiles,
        languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    },
    quality,
    { files: ['src/**/*.ts'], plugins: { 'unused-imports': unusedImports }, rules: { 'unused-imports/no-unused-imports': 'error' } },
    {
        files: ['**/*.{js,cjs,mjs}'],
        languageOptions: {
            globals: {
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                __dirname: 'readonly',
                process: 'readonly',
                console: 'readonly',
                jest: 'readonly',
                Buffer: 'readonly',
            },
        },
    },
    {
        files: ['src/**/*.ts'],
        rules: { '@typescript-eslint/explicit-module-boundary-types': 'warn' },
    },
    prettier
)
