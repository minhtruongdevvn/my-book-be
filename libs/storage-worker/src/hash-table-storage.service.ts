import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class HashTableStorageService<T extends object> {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private redisKey: string,
    private ctor: new (...args: any[]) => T,
  ) {}

  async get(key: string | number): Promise<T | undefined> {
    const data = await this.redis.hget(this.redisKey, String(key));
    if (!data) return undefined;
    return Object.assign(new this.ctor(), JSON.parse(data));
  }

  async has(key: string | number): Promise<boolean> {
    const data = await this.redis.hexists(this.redisKey, String(key));
    return data > 0;
  }

  async set(
    ...fieldValue: { key: string | number; value: T }[]
  ): Promise<boolean> {
    const result = await this.redis.hset(
      this.redisKey,
      ...fieldValue.flatMap((e) => [e.key, JSON.stringify(e.value)]),
    );
    return result > 0;
  }

  async delete(key: string | number): Promise<boolean> {
    const result = await this.redis.hdel(this.redisKey, String(key));
    return result > 0;
  }
}
