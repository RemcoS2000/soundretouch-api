import { Bonjour } from 'bonjour-service'
import createDebug from 'debug'

import { SoundTouchDevice } from '../device/SoundTouchDevice'

/**
 * Handle for controlling the discovery process.
 */
export type DiscoveryHandle = {
    stop: () => void
}

/**
 * Starts mDNS discovery for SoundTouch devices and invokes the callback on first sight of each host.
 *
 * @param onDeviceFound Callback invoked when a new SoundTouch device is found.
 * @returns A handle that stops discovery when it is no longer needed.
 */
export class SoundTouchDiscovery {
    private static readonly log = createDebug('soundretouch:discovery')

    /**
     * Starts discovery and returns the cleanup handle for its Bonjour browser.
     */
    static start(onDeviceFound: (device: SoundTouchDevice) => void): DiscoveryHandle {
        this.log('🔍 Starting SoundTouch discovery...')

        const instance = new Bonjour()
        const seen = new Set<string>()
        const browser = instance.find({ type: 'soundtouch', protocol: 'tcp' }, (service) => {
            const host = service.addresses?.[0]

            if (!host) {
                this.log('⚠️ Service without address, skipping: %O', service)

                return
            }

            if (seen.has(host)) {
                this.log('🔁 Duplicate host %s ignored', host)

                return
            }

            seen.add(host)
            this.log('✅ Discovered SoundTouch host %s', host)
            onDeviceFound(new SoundTouchDevice(host))
        })

        browser.on('error', (error) => {
            this.log('❌ Bonjour discovery error: %O', error)
        })

        return {
            stop: () => {
                this.log('🛑 Stopping SoundTouch discovery...')
                browser.stop()
                instance.destroy()
            },
        }
    }
}
