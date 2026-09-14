import concurrent.futures
import json
import os
import time

from fastapi.testclient import TestClient

from app.main import app
from app.middleware.security import validate_uploaded_file
from app.services.cache_service import CacheService

client = TestClient(app)


def test_performance_and_security_suite():
    print("\n================================================ catalog ===")
    print("  LankaLens EPIC 24 — Performance, Security & Reliability Test Suite  ")
    print("============================================================")

    # 1. Performance SLA Test (Target p95 <= 500ms)
    print("\n1. Testing Endpoint Performance SLA (Target p95 <= 500ms under load)...")

    # Pre-warm response cache
    client.get("/api/destinations")

    def fetch_destination():
        start = time.perf_counter()
        res = client.get("/api/destinations")
        dur_ms = (time.perf_counter() - start) * 1000.0
        assert res.status_code == 200
        assert "X-Process-Time" in res.headers
        return dur_ms

    durations = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(fetch_destination) for _ in range(50)]
        for f in concurrent.futures.as_completed(futures):
            durations.append(f.result())

    durations.sort()
    p95_index = int(len(durations) * 0.95)
    p95_latency = round(durations[p95_index], 2)
    avg_latency = round(sum(durations) / len(durations), 2)

    print("   50 Concurrent Requests Sampled:")
    print(f"   - Average Latency: {avg_latency} ms")
    print(f"   - p95 Latency: {p95_latency} ms (Target <= 500.0 ms)")
    assert (
        p95_latency <= 500.0
    ), f"p95 Latency of {p95_latency}ms exceeded target SLA of 500ms!"

    # 2. Hybrid Caching & Non-Blocking Fallback Test
    print("\n2. Testing Hybrid Caching & Non-Blocking Fallback Engine...")
    CacheService.set("test_key_1", {"data": "lankalens_cache_val"}, ttl_seconds=60)
    cached_val = CacheService.get("test_key_1")
    assert cached_val == {"data": "lankalens_cache_val"}

    cache_diag = CacheService.status()
    print(f"   Cache Mode: {cache_diag['mode']}")
    print(
        f"   Hits: {cache_diag['hits']}, Misses: {cache_diag['misses']}, Hit Rate: {cache_diag['hit_rate_pct']}%"
    )

    # 3. Security Headers Verification
    print("\n3. Testing Security Headers Injection...")
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    headers = health_res.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    print(
        "   Verified X-Content-Type-Options, X-Frame-Options, and X-XSS-Protection headers."
    )

    # 4. Security Rate Limiting Verification (HTTP 429)
    print("\n4. Testing Rate Limiter & HTTP 429 Quota Enforcement...")
    # Send requests to AI assistant endpoint until limit is reached
    ai_status_codes = []
    for _ in range(25):
        r = client.post("/api/ai-assistant/chat", json={"message": "recommend beaches"})
        ai_status_codes.append(r.status_code)

    assert (
        429 in ai_status_codes
    ), "Rate limiter did NOT trigger HTTP 429 on request surge!"
    print(
        "   Successfully enforced HTTP 429 Too Many Requests on AI endpoint request burst."
    )

    # 5. Secure File Upload Magic Bytes Validation
    print("\n5. Testing Secure File Upload Magic Bytes & Payload Validation...")
    valid_jpeg_payload = b"\xff\xd8\xff\xe0\x00\x10JFIF"
    invalid_script_payload = b"<?php echo 'malicious code'; ?>"

    assert validate_uploaded_file("photo.jpg", valid_jpeg_payload) is True

    try:
        validate_uploaded_file("script.png", invalid_script_payload)
        raise AssertionError(
            "File validator failed to reject malicious non-image payload!"
        )
    except Exception as exc:
        assert exc.status_code == 400
        print(
            "   Successfully blocked non-image file payload with invalid magic bytes."
        )

    # 6. Enhanced Health Check Diagnostics Verification
    print("\n6. Testing Enhanced System Diagnostics (GET /api/health)...")
    health_json = health_res.json()
    assert health_json["status"] == "online"
    assert "uptime_seconds" in health_json
    assert "database" in health_json
    assert "redis_cache" in health_json
    assert "security" in health_json
    print(
        f"   Health Diagnostics Output: Status={health_json['status']}, Uptime={health_json['uptime_seconds']}s, CacheMode={health_json['redis_cache']['mode']}"
    )

    # 7. Export Updated OpenAPI Specification
    print("\n7. Exporting Updated OpenAPI Specification...")
    openapi_spec = app.openapi()
    openapi_path = os.path.join(os.path.dirname(__file__), "..", "openapi.json")
    with open(openapi_path, "w", encoding="utf-8") as f:
        json.dump(openapi_spec, f, indent=2)
    print(f"   OpenAPI specification updated at '{openapi_path}'")

    print("\n============================================================")
    print("   ALL EPIC 24 PERFORMANCE, SECURITY & RELIABILITY TESTS PASSED!")
    print("============================================================\n")


if __name__ == "__main__":
    test_performance_and_security_suite()
