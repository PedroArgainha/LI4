import http from 'k6/http';
import { check, sleep, fail } from 'k6';

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_failed: ['rate<0.01'],
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

  const disponibilidade = http.get(`${BASE_URL}/api/reservas/disponibilidade?especie=CAO&porte=PEQUENO_MEDIO&dataInicio=2026-06-10&dataFim=2026-06-15`);
  const reservas = http.get(`${BASE_URL}/api/reservas`, rececaoAuth);
  const minhasReservas = http.get(`${BASE_URL}/api/reservas/proprietario/${data.clienteId}`, clienteAuth);

  check(disponibilidade, { 'disponibilidade 200': (r) => r.status === 200 });
  check(reservas, { 'reservas backoffice 200': (r) => r.status === 200 });
  check(minhasReservas, { 'reservas do proprietário 200': (r) => r.status === 200 });

  sleep(1);
}
