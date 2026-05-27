import http from 'k6/http';
import { check, fail } from 'k6';

// Este teste não é de carga: serve só para confirmar rapidamente
// se os endpoints usados pelos testes de carga estão a devolver os códigos esperados.
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 403));

export const options = {
  vus: 1,
  iterations: 1,
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';

function login(email, password) {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, {
    [`login ${email} devolve 200`]: (r) => r.status === 200,
    [`login ${email} devolve token`]: (r) => Boolean(r.json('token')),
  });

  if (res.status !== 200 || !res.json('token')) {
    fail(`Falhou login de ${email}: status=${res.status}, body=${res.body}`);
  }

  const body = res.json();
  const userId = body.utilizador ? body.utilizador.id : (body.id || body.utilizadorId || body.userId);
  return { token: body.token, userId };
}

export default function () {
  const rececao = login('rececao@patudos.pt', 'rececao123');
  const cliente = login('cliente@patudos.pt', 'cliente123');

  const rececaoAuth = { headers: { Authorization: `Bearer ${rececao.token}` } };
  const clienteAuth = { headers: { Authorization: `Bearer ${cliente.token}` } };

  const endpoints = [
    ['rececao', 'GET /api/reservas', http.get(`${BASE_URL}/api/reservas`, rececaoAuth), 200],
    ['rececao', 'GET /api/reservas/ativas', http.get(`${BASE_URL}/api/reservas/ativas`, rececaoAuth), 200],
    ['rececao', 'GET /api/servicos', http.get(`${BASE_URL}/api/servicos`, rececaoAuth), 200],
    ['publico', 'GET /api/servicos/disponiveis', http.get(`${BASE_URL}/api/servicos/disponiveis`), 200],
    ['publico', 'GET /api/reservas/disponibilidade', http.get(`${BASE_URL}/api/reservas/disponibilidade?especie=CAO&porte=PEQUENO_MEDIO&dataInicio=2026-06-10&dataFim=2026-06-15`), 200],
    ['cliente', `GET /api/reservas/proprietario/${cliente.userId}`, http.get(`${BASE_URL}/api/reservas/proprietario/${cliente.userId}`, clienteAuth), 200],
    ['cliente', 'GET /api/reservas deve ser proibido', http.get(`${BASE_URL}/api/reservas`, clienteAuth), 403],
  ];

  for (const [perfil, nome, res, esperado] of endpoints) {
    console.log(`${perfil} | ${nome} -> ${res.status}`);
    check(res, {
      [`${nome} devolve ${esperado}`]: (r) => r.status === esperado,
      [`${nome} não devolve 500`]: (r) => r.status !== 500,
    });
  }
}
