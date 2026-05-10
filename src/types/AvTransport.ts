export type AvTransportBody = {
    SetAVTransportURIResponse?: Record<string, unknown>
    PlayResponse?: Record<string, unknown>
    Fault?: Record<string, unknown>
}

export type AvTransportResponse = {
    Envelope?: {
        Body?: AvTransportBody
    }
}
