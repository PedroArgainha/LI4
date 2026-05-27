import http from 'k6/http';
import { check, sleep, fail } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '1m', target: 25 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.15'],
    http_req_duration: ['p(95)<2000'],
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

  const r1 = http.get(`${BASE_URL}/api/reservas`, rececaoAuth);
  const r2 = http.get(`${BASE_URL}/api/reservas/ativas`, rececaoAuth);
  const r3 = http.get(`${BASE_URL}/api/servicos`, rececaoAuth);
  const r4 = http.get(`${BASE_URL}/api/reservas/proprietario/${data.clienteId}`, clienteAuth);
  const r5 = http.get(`${BASE_URL}/api/reservas/disponibilidade?especie=GATO&porte=NAO_APLICAVEL&dataInicio=2026-06-12&dataFim=2026-06-18`);

  check(r1, { 'reservas backoffice 200': (r) => r.status === 200 });
  check(r2, { 'reservas ativas 200': (r) => r.status === 200 });
  check(r3, { 'serviços 200': (r) => r.status === 200 });
  check(r4, { 'reservas proprietário 200': (r) => r.status === 200 });
  check(r5, { 'disponibilidade 200': (r) => r.status === 200 });

  sleep(0.5);
}
