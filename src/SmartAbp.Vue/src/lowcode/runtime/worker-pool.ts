/**
 * 通用Worker池实现
 * - 采用任务队列与空闲Worker分发
 * - 支持并发数配置与优雅关闭
 */

export interface WorkerPoolOptions {
  /** 池名称（用于日志与调试） */
  name: string;
  /** 并发Worker数量 */
  size: number;
  /** 任务执行超时（ms），0表示不超时 */
  timeoutMs?: number;
  /** 是否启用度量 */
  metricsEnabled?: boolean;
}

export interface WorkerRequest<TPayload = unknown> {
  id: number;
  action: string;
  payload: TPayload;
}

export interface WorkerResponse<TResult = unknown> {
  id: number;
  ok: boolean;
  result?: TResult;
  error?: { message: string; stack?: string };
}

interface PendingTask<TResult> {
  request: WorkerRequest;
  resolve: (value: TResult) => void;
  reject: (reason: unknown) => void;
  timeoutHandle?: ReturnType<typeof setTimeout>;
}

interface PooledWorker {
  worker: Worker;
  busy: boolean;
}

export type CreateWorkerFn = () => Worker;

export class WorkerPool {
  private readonly options: WorkerPoolOptions;
  private readonly createWorker: CreateWorkerFn;
  private readonly workers: PooledWorker[] = [];
  private readonly queue: Array<PendingTask<unknown>> = [];
  private nextTaskId = 1;
  private disposed = false;
  private metrics = {
    submitted: 0,
    completed: 0,
    failed: 0,
    inFlight: 0,
    queueMax: 0,
    durations: [] as number[],
    lastError: '' as string | undefined
  };

  constructor(options: WorkerPoolOptions, createWorker: CreateWorkerFn) {
    this.options = options;
    this.createWorker = createWorker;

    const size = Math.max(1, options.size | 0);
    for (let i = 0; i < size; i++) {
      this.workers.push(this.spawn());
    }
  }

  /**
   * 执行一个动作并返回结果
   */
  exec<TPayload, TResult>(action: string, payload: TPayload): Promise<TResult> {
    if (this.disposed) {
      return Promise.reject(new Error(`WorkerPool(${this.options.name}) 已关闭`));
    }

    const id = this.nextTaskId++;
    const request: WorkerRequest<TPayload> = { id, action, payload };

    this.metrics.submitted++;
    this.metrics.queueMax = Math.max(this.metrics.queueMax, this.queue.length + 1);

    return new Promise<TResult>((resolve, reject) => {
      const pending: PendingTask<TResult> = { request, resolve, reject };

      // 超时控制
      const timeout = this.options.timeoutMs ?? 0;
      if (timeout > 0) {
        pending.timeoutHandle = setTimeout(() => {
          pending.timeoutHandle && clearTimeout(pending.timeoutHandle);
          pending.reject(new Error(`WorkerPool(${this.options.name}) 任务超时: ${action}`));
        }, timeout);
      }

      this.queue.push(pending as unknown as PendingTask<unknown>);
      this.schedule();
    });
  }

  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    this.disposed = true;
    // 拒绝队列中未处理任务
    while (this.queue.length > 0) {
      const t = this.queue.shift()!;
      t.timeoutHandle && clearTimeout(t.timeoutHandle);
      t.reject(new Error(`WorkerPool(${this.options.name}) 已关闭，任务被取消`));
    }

    await Promise.allSettled(
      this.workers.map(w => {
        try {
          w.worker.terminate();
        } catch {}
        return Promise.resolve();
      })
    );
  }

  private spawn(): PooledWorker {
    const worker = this.createWorker();
    const pooled: PooledWorker = { worker, busy: false };

    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;
      // 在队列中查找对应的任务并完成（队列头部可能不是同一个任务，但这里只负责已发送的任务回调）
      // 为保持实现简单，这里在worker上挂载一个当前任务引用
      const current = (pooled as unknown as { __current?: PendingTask<unknown> }).__current;
      if (!current || current.request.id !== response.id) {
        // 忽略意外消息
        return;
      }
      current.timeoutHandle && clearTimeout(current.timeoutHandle);

      (pooled as unknown as { __current?: PendingTask<unknown> }).__current = undefined;
      pooled.busy = false;

      if (response.ok) {
        current.resolve(response.result as unknown);
      } else {
        current.reject(new Error(response.error?.message || 'Worker执行错误'));
        this.metrics.failed++;
      }

      // 度量
      const end = performance.now?.() ?? Date.now();
      this.metrics.completed++;
      this.metrics.inFlight = Math.max(0, this.metrics.inFlight - 1);
      const start = (current as unknown as { __start?: number }).__start;
      if (start) this.metrics.durations.push(end - start);

      // 继续调度
      this.schedule();
    };

    const handleError = (error: ErrorEvent) => {
      const current = (pooled as unknown as { __current?: PendingTask<unknown> }).__current;
      if (current) {
        current.timeoutHandle && clearTimeout(current.timeoutHandle);
        current.reject(error.error || new Error(error.message));
        this.metrics.failed++;
        this.metrics.lastError = error.message;
        (pooled as unknown as { __current?: PendingTask<unknown> }).__current = undefined;
      }
      pooled.busy = false;
      this.schedule();
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    return pooled;
  }

  private schedule(): void {
    if (this.disposed) return;
    if (this.queue.length === 0) return;

    for (const pooled of this.workers) {
      if (this.queue.length === 0) return;
      if (pooled.busy) continue;

      const nextTask = this.queue.shift()!;
      (pooled as unknown as { __current?: PendingTask<unknown> }).__current = nextTask;
      pooled.busy = true;
      this.metrics.inFlight++;
      (nextTask as unknown as { __start?: number }).__start = performance.now?.() ?? Date.now();
      pooled.worker.postMessage(nextTask.request);
    }
  }

  /** 获取度量数据快照 */
  getMetrics(): Readonly<typeof this.metrics> {
    return this.metrics;
  }
}


