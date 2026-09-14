"""Unified Caching & Resilience Service (EPIC 24).

Provides high-performance caching backed by Redis with non-blocking,
seamless fallback to an in-memory TTL dictionary when Redis is offline.
"""

import functools
import json
import time
from collections.abc import Callable
from typing import Any

# Try importing redis optional dependency
try:
    import redis

    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


class CacheService:
    """Hybrid Redis / In-Memory TTL Cache Engine."""

    _redis_client: Any = None
    _in_memory_cache: dict[str, tuple[Any, float]] = {}
    _hits: int = 0
    _misses: int = 0
    _redis_connected: bool = False

    @classmethod
    def _init_redis(cls) -> None:
        if REDIS_AVAILABLE and cls._redis_client is None:
            try:
                client = redis.Redis(
                    host="localhost",
                    port=6379,
                    db=0,
                    socket_connect_timeout=0.5,
                    socket_timeout=0.5,
                    decode_responses=True,
                )
                client.ping()
                cls._redis_client = client
                cls._redis_connected = True
            except Exception as err:
                cls._redis_connected = False
                cls._redis_client = None
                print(
                    f"[LankaLens Cache] Redis offline, using in-memory fallback: {err}"
                )

    @classmethod
    def get(cls, key: str) -> Any | None:
        """Retrieves cached value from Redis or in-memory TTL store."""
        cls._init_redis()
        now = time.time()

        # Try Redis
        if cls._redis_connected and cls._redis_client:
            try:
                data = cls._redis_client.get(key)
                if data is not None:
                    cls._hits += 1
                    return json.loads(data)
            except Exception as err:
                print(f"[LankaLens Cache Redis error, fallback to memory] {err}")
                cls._redis_connected = False

        # In-Memory Fallback
        if key in cls._in_memory_cache:
            val, expire_at = cls._in_memory_cache[key]
            if expire_at > now:
                cls._hits += 1
                return val
            # Expired
            del cls._in_memory_cache[key]

        cls._misses += 1
        return None

    @classmethod
    def set(cls, key: str, value: Any, ttl_seconds: int = 300) -> bool:
        """Sets cached value in Redis or in-memory TTL store."""
        cls._init_redis()
        expire_at = time.time() + ttl_seconds

        # Try Redis
        if cls._redis_connected and cls._redis_client:
            try:
                serialized = json.dumps(value, default=str)
                cls._redis_client.setex(key, ttl_seconds, serialized)
                return True
            except Exception as err:
                print(f"[LankaLens Cache Redis set error] {err}")
                cls._redis_connected = False

        # In-Memory Fallback
        cls._in_memory_cache[key] = (value, expire_at)
        return True

    @classmethod
    def delete(cls, key: str) -> bool:
        """Deletes cached key from Redis and in-memory store."""
        cls._init_redis()
        if cls._redis_connected and cls._redis_client:
            try:
                cls._redis_client.delete(key)
            except Exception:
                cls._redis_connected = False
        cls._in_memory_cache.pop(key, None)
        return True

    @classmethod
    def clear(cls) -> bool:
        """Clears all cached items."""
        cls._in_memory_cache.clear()
        if cls._redis_connected and cls._redis_client:
            try:
                cls._redis_client.flushdb()
            except Exception:
                cls._redis_connected = False
        return True

    @classmethod
    def status(cls) -> dict[str, Any]:
        """Returns cache status diagnostic metadata."""
        cls._init_redis()
        now = time.time()
        # Clean expired in-memory items
        cls._in_memory_cache = {
            k: v for k, v in cls._in_memory_cache.items() if v[1] > now
        }

        mode = "connected_redis" if cls._redis_connected else "degraded_in_memory"
        total_requests = cls._hits + cls._misses
        hit_rate = (
            round((cls._hits / total_requests) * 100.0, 1)
            if total_requests > 0
            else 0.0
        )

        return {
            "mode": mode,
            "redis_connected": cls._redis_connected,
            "cached_keys_count": len(cls._in_memory_cache),
            "hits": cls._hits,
            "misses": cls._misses,
            "hit_rate_pct": hit_rate,
        }


def cache_response(ttl_seconds: int = 300) -> Callable[..., Any]:
    """Decorator for FastAPI endpoint handlers to cache JSON response results."""

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Build cache key from function module, name, args, and kwargs
            arg_str = json.dumps(
                [str(a) for a in args] + [f"{k}={v}" for k, v in sorted(kwargs.items())]
            )
            cache_key = f"cache:{func.__module__}.{func.__name__}:{arg_str}"

            cached = CacheService.get(cache_key)
            if cached is not None:
                return cached

            result = func(*args, **kwargs)
            if result is not None:
                CacheService.set(cache_key, result, ttl_seconds=ttl_seconds)
            return result

        return wrapper

    return decorator
