// global.d.ts
interface Window {
  requestIdleCallback: (
    _callback: IdleRequestCallback,
    _options?: IdleRequestOptions
  ) => IdleCallbackHandle;
  cancelIdleCallback: (_handle: IdleCallbackHandle) => void;
}

type IdleCallbackHandle = any; // Fallback if the global type is not available
type IdleRequestCallback = (_deadline: IdleDeadline) => void;

interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): DOMHighResTimeStamp;
}

interface IdleRequestOptions {
  timeout?: number;
}