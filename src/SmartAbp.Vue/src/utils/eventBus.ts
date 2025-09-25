import mitt from 'mitt'

// Define the types for the events
export type LowCodeEvents = {
  'module:change': string;
  'entity:created': any;
  'page:saved': any;
  'theme:updated': any;
  'notification:show': {
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    duration?: number;
  };
  // Add missing event types
  'business-rule:status-changed': any;
  'business-rule:saved': any;
  'permission:role-status-changed': any;
  'permission:role-saved': any;
  'workflow:deployed': any;
};

// Create and export the event bus instance
export const eventBus = mitt<LowCodeEvents>()
