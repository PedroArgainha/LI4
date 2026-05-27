import http from 'k6/http';
import { check, fail } from 'k6';

// Teste de regressão de segurança: aqui 403 é uma resposta esperada,
// por isso é marcado como expected_response para não contaminar http_req_failed.
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 401, 403));

export const options = {
  vus: 1,
  iterations: 3,
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

  if (res.status !== 200 || !res.json('token')) {
    fail(`Falhou login de ${email}: status=${res.status}, body=${res.body}`);
  }

  return res.json('token');
}

export default function () {
  const tokenCliente = login('cliente@patudos.pt', 'cliente123');
  const clienteAuth = { headers: { Authorization: `Bearer ${tokenCliente}` } };

  const semToken = http.get(`${BASE_URL}/api/reservas`);
  const clienteEmBackoffice = http.get(`${BASE_URL}/api/reservas`, clienteAuth);

  check(semToken, {
    'sem token não acede a /api/reservas': (r) => r.status === 401 || r.status === 403,
    'sem token não dá 500': (r) => r.status !== 500,
  });

  check(clienteEmBackoffice, {
    'cliente autenticado sem permissão recebe 403': (r) => r.status === 403,
    'cliente autenticado sem permissão não recebe 500': (r) => r.status !== 500,
  });
}
