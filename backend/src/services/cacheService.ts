import { redisClient } from '../config/redis';
import { RedisClientType } from 'redis';
import crypto from 'crypto';

export class CacheService {
  private client: RedisClientType;
  private readonly POSTS_GEO_KEY = 'posts:geo';
  private readonly SEARCH_CACHE_PREFIX = 'search:';
  private readonly USER_LOCATION_PREFIX = 'user:location:';
  private readonly DEFAULT_TTL = 300; // 5 minutes
  private readonly USER_LOCATION_TTL = 1800; // 30 minutes

  constructor() {
    this.client = redisClient.getClient();
  }

  // Generate cache key for proximity searches
  private generateSearchKey(lat: number, lng: number, radius: number): string {
    const geohash = this.simpleGeohash(lat, lng, 6); // 6 character precision
    return `${this.SEARCH_CACHE_PREFIX}${geohash}:${radius}`;
  }

  // Simple geohash implementation for cache keys
  private simpleGeohash(lat: number, lng: number, precision: number): string {
    const hash = crypto.createHash('md5').update(`${lat.toFixed(4)},${lng.toFixed(4)}`).digest('hex');
    return hash.substring(0, precision);
  }

  // Cache proximity search results
  async cacheSearchResults(userLat: number, userLng: number, radius: number, posts: any[]): Promise<void> {
    try {
      const key = this.generateSearchKey(userLat, userLng, radius);
      await this.client.setEx(key, this.DEFAULT_TTL, JSON.stringify(posts));
      console.log(`Cached search results for key: ${key}`);
    } catch (error) {
      console.error('Error caching search results:', error);
      throw error;
    }
  }

  // Get cached proximity search results
  async getCachedSearchResults(userLat: number, userLng: number, radius: number): Promise<any[] | null> {
    try {
      const key = this.generateSearchKey(userLat, userLng, radius);
      const cached = await this.client.get(key);
      if (cached) {
        console.log(`Cache hit for key: ${key}`);
        return JSON.parse(cached);
      }
      console.log(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      console.error('Error getting cached search results:', error);
      throw error;
    }
  }

  // Add post to spatial index
  async addPostToGeoIndex(postId: number, lat: number, lng: number): Promise<void> {
    try {
      await this.client.geoAdd(this.POSTS_GEO_KEY, {
        longitude: lng,
        latitude: lat,
        member: postId.toString()
      });
      console.log(`Added post ${postId} to geo index at (${lat}, ${lng})`);
    } catch (error) {
      console.error('Error adding post to geo index:', error);
      throw error;
    }
  }

  // Remove post from spatial index
  async removePostFromGeoIndex(postId: number): Promise<void> {
    try {
      await this.client.zRem(this.POSTS_GEO_KEY, postId.toString());
      console.log(`Removed post ${postId} from geo index`);
    } catch (error) {
      console.error('Error removing post from geo index:', error);
      throw error;
    }
  }

  // Get posts within radius using Redis GEO
  async getPostsInRadius(lat: number, lng: number, radius: number): Promise<string[]> {
    try {
      // Using GEORADIUS which is well-supported in Redis v4 client
      const results = await this.client.sendCommand([
        'GEORADIUS',
        this.POSTS_GEO_KEY,
        lng.toString(),
        lat.toString(),
        radius.toString(),
        'km',
        'WITHDIST'
      ]) as unknown[];

      // Process the raw results (alternating member and distance)
      const members: string[] = [];
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          // Each even-indexed element is the member (postId)
          if (i % 2 === 0) {
            members.push(results[i] as string);
          }
        }
      }
      return members;
    } catch (error) {
      console.error('Error getting posts in radius from Redis geo index:', error);
      throw error;
    }
  }

  // Cache user location temporarily
  async cacheUserLocation(userId: number, lat: number, lng: number): Promise<void> {
    try {
      const key = `${this.USER_LOCATION_PREFIX}${userId}`;
      const location = { lat, lng, timestamp: Date.now() };
      await this.client.setEx(key, this.USER_LOCATION_TTL, JSON.stringify(location));
      console.log(`Cached location for user ${userId}`);
    } catch (error) {
      console.error('Error caching user location:', error);
      throw error;
    }
  }

  // Get cached user location
  async getCachedUserLocation(userId: number): Promise<{ lat: number; lng: number } | null> {
    try {
      const key = `${this.USER_LOCATION_PREFIX}${userId}`;
      const cached = await this.client.get(key);
      if (cached) {
        const location = JSON.parse(cached);
        return { lat: location.lat, lng: location.lng };
      }
      return null;
    } catch (error) {
      console.error('Error getting cached user location:', error);
      throw error;
    }
  }

  // Invalidate search cache for affected regions
  async invalidateSearchCache(lat: number, lng: number): Promise<void> {
    try {
      // Invalidate multiple geohash precisions to cover affected areas
      const precisions = [4, 5, 6];
      const patterns = precisions.map(p => 
        `${this.SEARCH_CACHE_PREFIX}${this.simpleGeohash(lat, lng, p)}*`
      );

      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
          console.log(`Invalidated ${keys.length} cache entries for pattern: ${pattern}`);
        }
      }
    } catch (error) {
      console.error('Error invalidating search cache:', error);
      throw error;
    }
  }

  // Clear all cache (for testing/maintenance)
  async clearAllCache(): Promise<void> {
    try {
      await this.client.flushAll();
      console.log('Cleared all cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }
}

export const cacheService = new CacheService();