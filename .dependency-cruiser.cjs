module.exports = {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'error',
            comment: 'Circular dependencies obscure ownership and initialization order.',
            from: {},
            to: {
                circular: true,
            },
        },
        {
            name: 'api-is-framework-independent',
            severity: 'error',
            from: {
                path: '^src/',
            },
            to: {
                path: '(^|node_modules/)(react|react-native|expo|@tanstack)(/|$)',
            },
        },
    ],
    options: {
        doNotFollow: {
            path: 'node_modules',
        },
        exclude: {
            path: '(^|/)(dist|coverage|reports)/',
        },
        tsConfig: {
            fileName: 'tsconfig.json',
        },
        tsPreCompilationDeps: true,
        enhancedResolveOptions: {
            extensions: ['.native.tsx', '.native.ts', '.tsx', '.ts', '.js', '.cjs', '.json'],
            conditionNames: ['react-native', 'import', 'require', 'default'],
        },
        reporterOptions: {
            dot: {
                collapsePattern: 'node_modules/[^/]+',
            },
        },
    },
}
