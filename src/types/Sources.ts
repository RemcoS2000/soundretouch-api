import { SourceStatus } from './Enums'

/**
 * Normalized types.
 */
export type SourceItem = {
    source?: string
    sourceAccount?: number
    status?: SourceStatus
    isLocal?: boolean
    multiroomallowed?: boolean
    name?: string
}

export type Sources = {
    deviceID?: string
    sourceItem?: SourceItem | SourceItem[]
}

/**
 * Raw response types.
 */
export type SourceItemRawResponse = Omit<SourceItem, 'name'> & {
    '#text'?: string
}

export type SourcesRawResponse = Omit<Sources, 'sourceItem'> & {
    sourceItem?: SourceItemRawResponse | SourceItemRawResponse[]
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
 * Converts the raw XML response shape to the normalized Sources shape.
 */
export function normalizeSources(sources?: SourcesRawResponse): Sources {
    if (!sources) return {}

    const sourceItem = Array.isArray(sources.sourceItem)
        ? sources.sourceItem.map((item) => normalizeSourceItem(item))
        : sources.sourceItem
          ? normalizeSourceItem(sources.sourceItem)
          : undefined

    return {
        deviceID: sources.deviceID,
        sourceItem,
    }
}
