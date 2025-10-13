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
                // runtime hook; packagesResolver has an exported clear method
                try {
                    // dynamic import to avoid hard dep

                    const mod = require('@/utils/vite/packagesResolver')
                    mod?.clearComponentPathCache?.()

                    console.log('[vitePluginLowCode] cleared component path cache')
                } catch { }
            })
        }
    }
}

export default vitePluginLowCode


