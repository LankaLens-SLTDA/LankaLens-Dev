import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 users
    { duration: '30s', target: 50 }, // Sustain 50 concurrent users
    { duration: '10s', target: 0 },  // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // p95 response time must be under 500ms
    http_req_failed: ['rate<0.01'],   // http errors must be under 1%
  },
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

  // 1. Health Check Endpoint
  const resHealth = http.get(`${BASE_URL}/api/health`);
  check(resHealth, {
    'health status is 200': (r) => r.status === 200,
    'has process time header': (r) => r.headers['X-Process-Time'] !== undefined,
  });

  // 2. Destinations Endpoint
  const resDest = http.get(`${BASE_URL}/api/destinations`);
  check(resDest, {
    'destinations status is 200': (r) => r.status === 200,
    'destinations latency < 500ms': (r) => r.timings.duration < 500,
  });

  // 3. Analytics Dashboard Endpoint
  const resAnalytics = http.get(`${BASE_URL}/api/analytics/dashboard`);
  check(resAnalytics, {
    'analytics status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
