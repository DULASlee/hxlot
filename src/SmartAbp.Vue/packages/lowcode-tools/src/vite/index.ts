/**
 * SmartAbp Low-Code - Vite Plugin (MVP)
 * - Auto log component resolve results
 * - Expose hook to clear component path cache between HMR
 */
import type { Plugin } from 'vite'

export function vitePluginLowCode(): Plugin {
    return {
        name: 'smartabp-lowcode-plugin',
        apply: 'serve',
        configureServer(server) {
            server.ws.on('smartabp:clear-cache', () => {
                // runtime hook; avoid cross-package imports per architecture rules
                try {
                    const clear = (globalThis as any)?.__smartabp_clearComponentPathCache
                    if (typeof clear === 'function') {
                        clear()
                    }
                    console.log('[vitePluginLowCode] clear-cache signal processed')
                } catch (e) {
                    // no-op
                }
            })
        }
    }
}

export default vitePluginLowCode


