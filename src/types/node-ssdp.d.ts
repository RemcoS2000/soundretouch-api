declare module 'node-ssdp' {
    export interface SsdpHeaders {
        [key: string]: string | string[] | undefined;
    }

    export interface RemoteInfo {
        address: string;
        port: number;
        family: string;
    }

    export class Client {
        constructor(options?: Record<string, unknown>);
        on(event: 'response', listener: (headers: SsdpHeaders, statusCode: number, rinfo: RemoteInfo) => void): this;
        on(event: 'error', listener: (error: Error) => void): this;
        on(event: string, listener: (...args: unknown[]) => void): this;
        search(serviceType: string): void;
        stop(): void;
    }

    const ssdp: {
        Client: typeof Client;
    };

    export default ssdp;
}
