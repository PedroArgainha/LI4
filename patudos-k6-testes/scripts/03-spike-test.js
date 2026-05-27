import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '10s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '10s', target: 5 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.20'],
    http_req_duration: ['p(95)<2500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';

export default function () {
  const r = http.get(`${BASE_URL}/api/reservas/disponibilidade?especie=CAO&porte=GRANDE&dataInicio=2026-07-01&dataFim=2026-07-10`);

  check(r, {
    'disponibilidade 200': (res) => res.status === 200,
    'disponibilidade não devolve 5xx': (res) => res.status < 500,
  });

  sleep(0.2);
}
