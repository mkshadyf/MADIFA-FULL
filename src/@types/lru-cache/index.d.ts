declare module 'lru-cache' {
  export interface Options<K = any, V = any> {
    max?: number
    maxAge?: number
    length?: (value: V, key: K) => number
    dispose?: (key: K, value: V) => void
    stale?: boolean
    noDisposeOnSet?: boolean
    updateAgeOnGet?: boolean
  }

  export default class LRUCache<K = any, V = any> {
    constructor(options?: number | Options<K, V>)
    set(key: K, value: V, maxAge?: number): boolean
    get(key: K): V | undefined
    peek(key: K): V | undefined
    del(key: K): void
    reset(): void
    has(key: K): boolean
    forEach(fn: (value: V, key: K, cache: this) => void, thisp?: any): void
    keys(): K[]
    values(): V[]
    length: number
    itemCount: number
    dump(): Array<{ k: K; v: V; e?: number }>
    load(cacheEntries: Array<{ k: K; v: V; e?: number }>): void
    prune(): void
  }
}
