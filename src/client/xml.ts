import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
    parseTagValue: true,
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
