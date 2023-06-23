import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class ObjectStorageService<T extends object> {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private ctor: new (...args: any[]) => T,
  ) {}

  async get(key: string | number): Promise<T | undefined> {
    const data = await this.redis.get(String(key));
    if (!data) return undefined;
    return Object.assign(new this.ctor(), JSON.parse(data));
  }

  async set(key: string | number, value: T): Promise<boolean> {
    const result = await this.redis.set(String(key), JSON.stringify(value));
    return result === 'OK';
  }

  async delete(key: string | number): Promise<boolean> {
    const result = await this.redis.del(String(key));
    return result > 0;
  }
}
