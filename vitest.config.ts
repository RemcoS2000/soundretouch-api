import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        coverage: {
            provider: 'v8',
            thresholds: { lines: 81, statements: 81, functions: 80, branches: 80 },
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.d.ts'],
            reporter: ['text', 'json-summary', 'lcov'],
        },
    },
})
