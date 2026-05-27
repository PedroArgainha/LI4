import http from 'k6/http';
import { check, sleep, fail } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 25 },
    { duration: '1m', target: 25 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<750'],
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

  const body = res.json();
  const userId = body.utilizador ? body.utilizador.id : (body.id || body.utilizadorId || body.userId);
  return { token: body.token, userId };
}

export function setup() {
  const rececao = login('rececao@patudos.pt', 'rececao123');
  const cliente = login('cliente@patudos.pt', 'cliente123');
  return {
    rececaoToken: rececao.token,
    clienteToken: cliente.token,
    clienteId: cliente.userId,
  };
}

export default function (data) {
  const rececaoAuth = { headers: { Authorization: `Bearer ${data.rececaoToken}` } };
  const clienteAuth = { headers: { Authorization: `Bearer ${data.clienteToken}` } };

  const responses = http.batch([
    ['GET', `${BASE_URL}/api/reservas`, null, rececaoAuth],
    ['GET', `${BASE_URL}/api/reservas/ativas`, null, rececaoAuth],
    ['GET', `${BASE_URL}/api/servicos`, null, rececaoAuth],
    ['GET', `${BASE_URL}/api/servicos/disponiveis`, null, {}],
    ['GET', `${BASE_URL}/api/reservas/proprietario/${data.clienteId}`, null, clienteAuth],
    ['GET', `${BASE_URL}/api/reservas/disponibilidade?especie=CAO&porte=PEQUENO_MEDIO&dataInicio=2026-06-10&dataFim=2026-06-15`, null, {}],
  ]);

  check(responses[0], { 'GET /api/reservas com receção 200': (r) => r.status === 200 });
  check(responses[1], { 'GET /api/reservas/ativas com receção 200': (r) => r.status === 200 });
  check(responses[2], { 'GET /api/servicos com receção 200': (r) => r.status === 200 });
  check(responses[3], { 'GET /api/servicos/disponiveis 200': (r) => r.status === 200 });
  check(responses[4], { 'GET reservas do proprietário 200': (r) => r.status === 200 });
  check(responses[5], { 'GET disponibilidade 200': (r) => r.status === 200 });

  sleep(1);
}
