import { Bonjour } from 'bonjour-service';

export type DiscoveryOptions = {
    timeoutMs?: number;
};

export type DiscoveryResult = {
    host: string;
    port?: number;
};

export async function discoverSoundTouchDevices(options: DiscoveryOptions = {}): Promise<DiscoveryResult[]> {
    const timeoutMs = options.timeoutMs ?? 120000;
    console.log('Starting SoundTouch discovery...');

    const instance = new Bonjour();
    const results = new Map<string, DiscoveryResult>();
    const browser = instance.find({ type: 'soundtouch', protocol: 'tcp' }, (service) => {
        console.log(`Discovered SoundTouch service: ${service.name}, host: ${service.addresses}, port: ${service.port}`);

        const host = service.addresses?.[0];
        if (!host) {
            return;
        }

        const key = service.port ? `${host}:${service.port}` : host;
        if (!results.has(key)) {
            results.set(key, { host, port: service.port });
        }
    });

    browser.on('error', (error) => {
        console.error('Bonjour discovery error', error);
    });

    await new Promise<void>((resolve) => {
        setTimeout(() => {
            browser.stop();
            instance.destroy();
            resolve();
        }, timeoutMs);
    });

    return Array.from(results.values());
}
