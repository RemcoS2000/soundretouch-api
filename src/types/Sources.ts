import { type SourceStatus } from './Enums'

/**
 * Normalized types.
 */
export type SourceItem = {
    source?: string | undefined
    sourceAccount?: number | undefined
    status?: SourceStatus | undefined
    isLocal?: boolean | undefined
    multiroomallowed?: boolean | undefined
    name?: string | undefined
}

export type Sources = {
    deviceID?: string | undefined
    sourceItem?: SourceItem | SourceItem[] | undefined
}

/**
 * Raw response types.
 */
export type SourceItemRawResponse = Omit<SourceItem, 'name'> & {
    '#text'?: string
}

export type SourcesRawResponse = Omit<Sources, 'sourceItem'> & {
    sourceItem?: SourceItemRawResponse | SourceItemRawResponse[] | undefined
}

/**
 * Converts a raw source item to the normalized SourceItem shape.
 */
function normalizeSourceItem(item: SourceItemRawResponse): SourceItem {
    return {
        source: item.source,
        sourceAccount: item.sourceAccount,
        status: item.status,
        isLocal: item.isLocal,
        multiroomallowed: item.multiroomallowed,
        ...(item['#text'] ? { name: item['#text'] } : {}),
    }
}

/**
 * Converts a raw XML response shape to the normalized Sources shape.
 */
export function normalizeSources(sources?: SourcesRawResponse): Sources {
    if (!sources) {
        return {}
    }

    let sourceItem: SourceItem | SourceItem[] | undefined

    if (Array.isArray(sources.sourceItem)) {
        sourceItem = sources.sourceItem.map(normalizeSourceItem)
    } else if (sources.sourceItem) {
        sourceItem = normalizeSourceItem(sources.sourceItem)
    }

    return {
        deviceID: sources.deviceID,
        sourceItem,
    }
}
