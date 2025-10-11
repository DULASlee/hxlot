/**
 * 错误重试处理器
 */

export interface RetryOptions {
    maxRetries?: number;
    retryDelay?: number;
    exponentialBackoff?: boolean;
}

export class RetryHandler {
    /**
     * 重试执行函数
     */
    static async retry<T>(
        fn: () => Promise<T>,
        options: RetryOptions = {}
    ): Promise<T> {
        const {
            maxRetries = 3,
            retryDelay = 1000,
            exponentialBackoff = true
        } = options;

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt === maxRetries) {
                    break;
                }

                const delay = exponentialBackoff
                    ? retryDelay * Math.pow(2, attempt)
                    : retryDelay;

                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    /**
     * 睡眠
     */
    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

