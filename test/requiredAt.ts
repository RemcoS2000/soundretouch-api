/**
 * Reads a required fixture entry and fails clearly if the test setup omitted it.
 */
export function requiredAt<T>(items: readonly T[], index: number): T {
    const value = items[index]

    if (value === undefined) {
        throw new Error(`Fixture entry ${index} is missing`)
    }

    return value
}
