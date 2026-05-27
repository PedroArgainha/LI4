# Testes k6 corrigidos — Patudos & Companhia

Estes scripts substituem os testes antigos. A correção principal é a separação dos perfis:

- `rececao@patudos.pt / rececao123` é usado para endpoints de backoffice, como `/api/reservas` e `/api/reservas/ativas`.
- `cliente@patudos.pt / cliente123` é usado para endpoints do portal do proprietário, como `/api/reservas/proprietario/{id}`.
- Endpoints públicos, como `/api/reservas/disponibilidade`, são chamados sem token.

## 1. Ver rapidamente o que os scripts estão a usar

Dentro da pasta dos testes:

```bash
grep -R "rececao@patudos\|cliente@patudos\|/api/reservas" -n scripts
```

Isto mostra-te que contas e endpoints aparecem nos scripts.

## 2. Verificar endpoints antes dos testes de carga

Com backend e BD ligados:

```bash
./verificar-endpoints.sh
```

Resultado esperado:

```text
OK   rececao /api/reservas -> 200
OK   rececao /api/reservas/ativas -> 200
OK   cliente /api/reservas/proprietario/<id> -> 200
OK   cliente bloqueado em /api/reservas -> 403
```

Também podes fazer o diagnóstico com k6:

```bash
sudo docker run --rm -i --network host grafana/k6 run - < scripts/00-diagnostico-rotas.js
```

## 3. Correr os testes principais

Smoke test:

```bash
sudo docker run --rm -i --network host grafana/k6 run - < scripts/00-smoke.js
```

Teste de carga:

```bash
sudo docker run --rm -i --network host grafana/k6 run - < scripts/01-load-test.js
```

Teste de stress:

```bash
sudo docker run --rm -i --network host grafana/k6 run - < scripts/02-stress-test.js
```

Teste de pico:

```bash
sudo docker run --rm -i --network host grafana/k6 run - < scripts/03-spike-test.js
```

Teste de duração moderada:

```bash
sudo docker run --rm -i --network host grafana/k6 run - < scripts/04-soak-test-curto.js
```

Teste de regressão de segurança:

```bash
sudo docker run --rm -i --network host grafana/k6 run - < scripts/05-security-regression.js
```

## 4. Guardar resultados para relatório

```bash
mkdir -p results

sudo docker run --rm -i --network host \
  -v "$PWD/results:/results" \
  grafana/k6 run --summary-export=/results/load-summary.json - < scripts/01-load-test.js

sudo docker run --rm -i --network host \
  -v "$PWD/results:/results" \
  grafana/k6 run --summary-export=/results/stress-summary.json - < scripts/02-stress-test.js

sudo docker run --rm -i --network host \
  -v "$PWD/results:/results" \
  grafana/k6 run --summary-export=/results/spike-summary.json - < scripts/03-spike-test.js
```

## 5. O que deves procurar nos resultados

As métricas mais importantes são:

- `http_req_failed`: deve ficar perto de `0.00%` nos testes normais.
- `http_req_duration p(95)`: tempo abaixo do qual ficaram 95% dos pedidos.
- `http_reqs`: número total de pedidos e pedidos por segundo.
- `checks_succeeded`: percentagem de checks bem-sucedidos.

Se `http_req_failed` voltar a ser alto, corre:

```bash
sudo docker run --rm -i --network host grafana/k6 run --http-debug=full - < scripts/00-diagnostico-rotas.js
```

Isto mostra os pedidos e respostas em detalhe.
