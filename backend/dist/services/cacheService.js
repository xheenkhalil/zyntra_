"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const node_cache_1 = __importDefault(require("node-cache"));
class CacheService {
    constructor() {
        this.redis = null;
        this.useRedis = false;
        this.localCache = new node_cache_1.default({ stdTTL: 600, checkperiod: 120 }); // Default TTL 10 mins
        // Only attempt to connect to Redis if a URL is provided
        if (process.env.REDIS_URL) {
            this.redis = new ioredis_1.default(process.env.REDIS_URL, {
                retryStrategy: (times) => {
                    // Retry for a bit, then give up and fallback to local cache
                    if (times > 3) {
                        console.warn('Redis connection failed too many times. Falling back to in-memory cache.');
                        this.useRedis = false;
                        return null;
                    }
                    return Math.min(times * 50, 2000);
                }
            });
            this.redis.on('connect', () => {
                console.log('✅ Connected to Redis Cache');
                this.useRedis = true;
            });
            this.redis.on('error', (err) => {
                console.error('Redis Error:', err);
                this.useRedis = false;
            });
        }
        else {
            console.log('ℹ️ No REDIS_URL found. Using in-memory cache.');
        }
    }
    /**
     * Get a value from cache
     */
    async get(key) {
        if (this.useRedis && this.redis) {
            try {
                const data = await this.redis.get(key);
                return data ? JSON.parse(data) : null;
            }
            catch (error) {
                console.error('Redis Get Error:', error);
                return this.localCache.get(key) || null;
            }
        }
        return this.localCache.get(key) || null;
    }
    /**
     * Set a value in cache
     * @param key Cache key
     * @param value Value to store
     * @param ttl Time to live in seconds (default: 600s)
     */
    async set(key, value, ttl = 600) {
        if (this.useRedis && this.redis) {
            try {
                await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
            }
            catch (error) {
                console.error('Redis Set Error:', error);
                this.localCache.set(key, value, ttl);
            }
        }
        else {
            this.localCache.set(key, value, ttl);
        }
    }
    /**
     * Delete a value from cache
     */
    async del(key) {
        if (this.useRedis && this.redis) {
            try {
                await this.redis.del(key);
            }
            catch (error) {
                console.error('Redis Del Error:', error);
                this.localCache.del(key);
            }
        }
        else {
            this.localCache.del(key);
        }
    }
    /**
     * Flush all cache (Use with caution)
     */
    async flush() {
        if (this.useRedis && this.redis) {
            try {
                await this.redis.flushall();
            }
            catch (error) {
                console.error('Redis Flush Error:', error);
                this.localCache.flushAll();
            }
        }
        else {
            this.localCache.flushAll();
        }
    }
}
exports.default = new CacheService();
