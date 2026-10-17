import assert from 'node:assert/strict'
import { resolve } from 'node:path'

import { ESLint } from 'eslint'

// Lint deliberately invalid source without executing it or changing production files.
// This catches accidentally disabled rules and configuration files that no longer apply.
const eslint = new ESLint()
const app = process.argv.includes('--app')
const filePath = resolve(app ? 'src/features/speakers/identity.ts' : 'src/client/http.ts')
const branches = Array.from({ length: 18 }, (_, index) => `if (value === ${index}) { value += 1 }`).join('\n')
const cases = [
    {
        rule: 'sonarjs/cognitive-complexity',
        code: `/** Exercises the configured complexity limit. */\nexport function branching(value: number): number { ${branches}\nreturn value }`,
    },
    {
        rule: '@typescript-eslint/no-floating-promises',
        code: '/** Exercises detached rejection detection. */\nexport function detached(): void { Promise.reject(new Error("unchecked")) }',
    },
]

if (app) {
    cases.push({
        rule: 'no-restricted-imports',
        code: 'import { SoundTouchDevice } from "@soundretouch/api/device"\n/** Exercises the provider ownership boundary. */\nexport const device = new SoundTouchDevice("unused.invalid")',
    })
}

for (const example of cases) {
    const [result] = await eslint.lintText(example.code, { filePath })
    assert.ok(
        result?.messages.some((message) => message.ruleId === example.rule),
        `Expected ${example.rule} to reject its regression fixture`
    )
}

console.log(`${cases.length} quality-rule regression checks passed; fixture code was never executed.`)
