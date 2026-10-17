import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
    parseTagValue: true,
    // Numeric-looking identities must retain leading zeros and string semantics.
    attributeValueProcessor: (name, value) => (['deviceID', 'master', 'macAddress', 'sourceAccount'].includes(name) ? undefined : value),
    tagValueProcessor: (name, value) =>
        [
            'member',
            'macAddress',
            'name',
            'type',
            'track',
            'artist',
            'album',
            'itemName',
            'sourceItem',
            'stationName',
            'serialNumber',
            'softwareVersion',
        ].includes(name)
            ? undefined
            : value,
    trimValues: true,
})

/**
 * Parses XML into the requested type using the configured XML parser.
 *
 * @param xml Raw XML string to parse.
 * @returns Parsed XML payload typed as the requested generic type.
 */
export function parseXml<T>(xml: string): T {
    return parser.parse(xml) as T
}

/**
 * Escapes text and attribute values in outgoing XML.
 */
export function escapeXml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!)
}
