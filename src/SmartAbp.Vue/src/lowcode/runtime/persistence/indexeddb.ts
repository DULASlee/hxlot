/**
 * IndexedDB 持久化适配器（通用KV+元数据）
 * 仅在浏览器环境生效；Node 环境自动跳过。
 */

export interface PersistRecord<TMeta = unknown> {
  key: string
  value: Uint8Array
  meta?: TMeta
}

export class IndexedDbStore<TMeta = unknown> {
  private constructor(
    private db: IDBDatabase,
    private readonly storeName: string,
  ) {}

  static async open<TMeta = unknown>(
    dbName: string,
    storeName: string,
  ): Promise<IndexedDbStore<TMeta>> {
    if (typeof indexedDB === "undefined") {
      throw new Error("IndexedDB is not available in this environment")
    }

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, 1)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "key" })
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"))
    })

    return new IndexedDbStore<TMeta>(db, storeName)
  }

  async put(key: string, value: Uint8Array, meta?: TMeta): Promise<void> {
    await this.withStore("readwrite", (store) => store.put({ key, value, meta }))
  }

  async delete(key: string): Promise<void> {
    await this.withStore("readwrite", (store) => store.delete(key))
  }

  async clear(): Promise<void> {
    await this.withStore("readwrite", (store) => store.clear())
  }

  async get(key: string): Promise<PersistRecord<TMeta> | undefined> {
    const result = await this.withStore("readonly", (store) => store.get(key))
    return (result as PersistRecord<TMeta>) || undefined
  }

  async *iter(): AsyncGenerator<PersistRecord<TMeta>, void, void> {
    const db = this.db
    const storeName = this.storeName
    const tx = db.transaction(storeName, "readonly")
    const store = tx.objectStore(storeName)

    const cursorRequest = store.openCursor()
    const cursorPromise = () =>
      new Promise<IDBCursorWithValue | null>((resolve, reject) => {
        cursorRequest.onsuccess = () => resolve(cursorRequest.result)
        cursorRequest.onerror = () => reject(cursorRequest.error)
      })

    let cursor = await cursorPromise()
    while (cursor) {
      const value = cursor.value as PersistRecord<TMeta>
      yield value
      cursor.continue()
      cursor = await cursorPromise()
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  }

  private withStore<T>(
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => IDBRequest,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, mode)
      const store = tx.objectStore(this.storeName)
      const request = fn(store)

      request.onsuccess = () => resolve(request.result as T)
      request.onerror = () => reject(request.error || new Error("IndexedDB request failed"))

      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction error"))
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"))
    })
  }
}
