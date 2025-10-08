/**
 * SmartAbp Low-Code Core - Runtime Exports
 * 
 * Runtime functionality for low-code platform
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */

// Export component sandbox system (named + default)
export type { TabConfig } from '../stores/entityModeling'
export * from './ComponentSandbox'
export { default as ComponentSandbox } from './ComponentSandbox'

/**
 * Runtime system initialization
 */
export function initializeRuntime(): void {
  console.log('[SmartAbp] Runtime system initialized')
}

export default {
  initializeRuntime
}