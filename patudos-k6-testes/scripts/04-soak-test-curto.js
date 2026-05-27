import http from 'k6/http';
import { check, sleep, fail } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 15 },
    { duration: '10m', target: 15 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';

function login(email, password) {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, {
    [`login ${email} 200`]: (r) => r.status === 200,
    [`token ${email} existe`]: (r) => Boolean(r.json('token')),
  });

  if (res.status !== 200 || !res.json('token')) {
    fail(`Falhou login de ${email}: status=${res.status}, body=${res.body}`);
  }

  return res.json('token');
}

export function setup() {
  return { rececaoToken: login('rececao@patudos.pt', 'rececao123') };
}

export default function (data) {
  const auth = { headers: { Authorization: `Bearer ${data.rececaoToken}` } };

  const responses = http.batch([
    ['GET', `${BASE_URL}/api/reservas`, null, auth],
    ['GET', `${BASE_URL}/api/reservas/ativas`, null, auth],
    ['GET', `${BASE_URL}/api/servicos`, null, auth],
  ]);

  check(responses[0], { 'reservas 200': (res) => res.status === 200 });
  check(responses[1], { 'ativas 200': (res) => res.status === 200 });
  check(responses[2], { 'servicos 200': (res) => res.status === 200 });

  sleep(1);
}
