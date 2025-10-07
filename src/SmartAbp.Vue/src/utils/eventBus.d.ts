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
    'business-rule:status-changed': any;
    'business-rule:saved': any;
    'permission:role-status-changed': any;
    'permission:role-saved': any;
    'workflow:deployed': any;
};
export declare const eventBus: import("mitt").Emitter<LowCodeEvents>;
//# sourceMappingURL=eventBus.d.ts.map
