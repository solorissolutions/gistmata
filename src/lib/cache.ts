type CacheValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

interface CacheBackend {
  get(key: string): Promise<CacheValue | undefined>;
  set(key: string, value: CacheValue, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

class InMemoryBackend implements CacheBackend {
  private store = new Map<string, { value: CacheValue; expiresAt: number }>();

  async get(key: string): Promise<CacheValue | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async set(key: string, value: CacheValue, ttlMs = 300_000): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

class RedisBackend implements CacheBackend {
  private client: any = null;
  private ready = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // @ts-expect-error - optional dependency
      const mod = await import("@upstash/redis");
      this.client = mod.Redis.fromEnv();
      this.ready = true;
    } catch {
      // Redis not configured, fall through
    }
  }

  private async ensure() {
    if (!this.ready) await this.init();
    return this.ready;
  }

  async get(key: string): Promise<CacheValue | undefined> {
    if (!(await this.ensure())) return undefined;
    try {
      return (await this.client.get(key)) as CacheValue | undefined;
    } catch {
      return undefined;
    }
  }

  async set(key: string, value: CacheValue, ttlMs = 300_000): Promise<void> {
    if (!(await this.ensure())) return;
    try {
      await this.client.set(key, value, { ex: Math.ceil(ttlMs / 1000) });
    } catch {
      // silent
    }
  }

  async delete(key: string): Promise<void> {
    if (!(await this.ensure())) return;
    try {
      await this.client.del(key);
    } catch {
      // silent
    }
  }
}

let backend: CacheBackend;

function getBackend(): CacheBackend {
  if (!backend) {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      backend = new RedisBackend();
    } else {
      backend = new InMemoryBackend();
    }
  }
  return backend;
}

export async function cacheGet<T extends CacheValue>(
  key: string
): Promise<T | undefined> {
  return (await getBackend().get(key)) as T | undefined;
}

export async function cacheSet(
  key: string,
  value: CacheValue,
  ttlMs = 300_000
): Promise<void> {
  await getBackend().set(key, value, ttlMs);
}

export async function cacheDelete(key: string): Promise<void> {
  await getBackend().delete(key);
}

export function cacheKey(...parts: string[]): string {
  return `gistmata:${parts.join(":")}`;
}
