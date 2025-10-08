/**
 * SmartAbp Low-Code Designer - Main Export
 * 
 * Centralized export for all designer functionality
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */

// Export components
export * from './components'

// Export core functionality
export * from './core'

// Export designer functionality
export * from './designer'

// Export runtime
export * from './runtime'

// Export types
export * from './types'

// Export utils
export * from './utils'

// Export views
export * from './views'

/**
 * Designer platform initialization
 */
export function initializeDesigner(): void {
  console.log('[SmartAbp] Designer initialized')
}

// Default export for plugin usage
export default {
  initializeDesigner
}