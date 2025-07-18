# Location Caching Implementation

## Overview
This document describes the Redis-based caching strategy implemented for location-based post searches in the social media application.

## Architecture

### Cache Layers
1. **Proximity Search Results Cache** - Caches search results by geohash + radius
2. **Spatial Index Cache** - Redis GEO structure for fast spatial queries  
3. **User Location Cache** - Temporary session-based user location storage

### Key Components

#### CacheService (`backend/src/services/cacheService.ts`)
- **Search Results Caching**: Uses geohash-based keys with 5-minute TTL
- **Spatial Indexing**: Redis GEO commands for post locations
- **Cache Invalidation**: Event-driven invalidation on post create/update/delete
- **User Location Caching**: 30-minute TTL for user locations

#### PostService Integration
- **createPost**: Adds to spatial index + invalidates affected search cache
- **deletePost**: Removes from spatial index + invalidates affected search cache  
- **updatePost**: Updates spatial index + invalidates old/new location caches
- **getPostsInRadius**: Checks cache first, falls back to database, caches results

## Cache Keys Structure

```
search:{geohash}:{radius}     # Proximity search results
posts:geo                     # Redis GEO spatial index
user:location:{userId}        # User location cache
```

## Performance Benefits

### Before Caching
- Every proximity search fetched ALL posts from database
- In-memory distance calculations for every request
- No spatial indexing optimization

### After Caching  
- Cache hit: ~1-5ms response time
- Cache miss: Database query + cache population
- Spatial index enables future Redis-only queries
- Event-driven invalidation maintains consistency

## Configuration

### TTL Settings
- Search results: 300 seconds (5 minutes)
- User locations: 1800 seconds (30 minutes)

### Redis Connection
- Default: `redis://localhost:6379`
- Environment variable: `REDIS_URL`

## Usage Examples

```typescript
// Cache proximity search
await cacheService.cacheSearchResults(lat, lng, radius, posts);

// Get cached results
const cached = await cacheService.getCachedSearchResults(lat, lng, radius);

// Add post to spatial index
await cacheService.addPostToGeoIndex(postId, lat, lng);

// Invalidate affected cache regions
await cacheService.invalidateSearchCache(lat, lng);
```

## Monitoring & Maintenance

### Cache Metrics to Monitor
- Cache hit rate (target: >80%)
- Memory usage
- Redis connection health
- Cache invalidation frequency

### Maintenance Operations
```typescript
// Clear all cache (for testing)
await cacheService.clearAllCache();

// Check Redis connection
redisClient.isConnected();
```

## Future Optimizations

1. **Database Spatial Queries**: Replace in-memory filtering with PostGIS
2. **Cache Warming**: Pre-populate cache for popular locations
3. **Distributed Caching**: Redis clustering for scale
4. **Smart Invalidation**: More precise geohash-based invalidation
