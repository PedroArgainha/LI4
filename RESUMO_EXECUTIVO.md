# 📊 Resumo Executivo - Modelo de Dados Patudos Companhia

## 🎯 Visão Geral Rápida

O sistema **Patudos Companhia** é uma plataforma de gestão de alojamento para cães e gatos. O modelo de dados é construído em torno de **7 tabelas principais** com relacionamentos bem definidos.

---

## 🔗 Estrutura Relacional Completa

```
                         ┌─────────────────────────────┐
                         │      UTILIZADORES          │
                         │  (id, email, nome, tipo)   │
                         └──────────┬──────────────────┘
                                    │
                     ┌──────────────┴──────────────────┐
                     │ 1:N (proprietário)              │
                     │                                 │
              ┌──────▼────────┐                        │
              │   ANIMAIS      │                        │
              │ (id, nome,    │                        │
              │  especie,     │                        │
              │  porte)       │                        │
              └──────┬────────┘                        │
                     │                                 │ 1:N (admin/op)
                     │ 1:N                             │
              ┌──────▼────────────────────────────┐   │
              │      RESERVAS                      │   │
              │ (id, animal_id, espacio_id,      │   │
              │  data_inicio, data_fim,           │   │
              │  preco_base, estado)              │   │
              └──────┬────────┬───────────────────┘   │
                     │        │                        │
        ┌────────────┘        │                        │
        │           N:1       │           N:1          │
        │         (espaço)   │                        │
        │                    │                        │
        │    ┌───────────────▼──────────────────┐    │
        │    │  ESPACOS_ALOJAMENTO              │    │
        │    │ (id, codigo, especie, porte,    │    │
        │    │  estado)                         │    │
        │    └──────────────────────────────────┘    │
        │                                             │
        │    ┌───────────────────────────────────┐   │
        │    │     PAGAMENTOS                     │   │
        │    │ (id, reserva_id, valor,          │   │
        │    │  metodo_pagamento,               │   │
        │    │  instante_pagamento)             │   │
        │    └───────────────────────────────────┘   │
        │                                             │
        │    ┌───────────────────────────────────┐   │
        │    │  RESERVAS_SERVICOS                │   │
        │    │ (id, reserva_id, servico_id,     │   │
        │    │  data_execucao, realizado)       │   │
        │    │         │                         │   │
        │    │         │ N:1                     │   │
        │    │         │                         │   │
        │    │    ┌────▼──────────┐              │   │
        │    │    │  SERVICOS      │              │   │
        │    │    │ (id, nome,    │              │   │
        │    │    │  preco)        │              │   │
        │    │    └───────────────┘              │   │
        │    └───────────────────────────────────┘   │
        └─────────────────────────────────────────────┘
```

---

## 📋 Tabelas e Suas Funções

| # | Tabela | Registos Típicos | Função Principal |
|---|--------|------------------|------------------|
| 1 | **UTILIZADORES** | Dezenas | Autenticação, roles (PROPRIETARIO, ADMIN, etc.) |
| 2 | **ANIMAIS** | Centenas | Cães e gatos registados no sistema |
| 3 | **ESPACOS_ALOJAMENTO** | Dezenas | Locais físicos para alojamento |
| 4 | **RESERVAS** | Centenas/Milhares | Reservas de alojamento |
| 5 | **PAGAMENTOS** | Centenas/Milhares | Registos de pagamentos |
| 6 | **SERVICOS** | Dezenas | Catálogo de serviços adicionais |
| 7 | **RESERVAS_SERVICOS** | Centenas | Associação de serviços a reservas |

---

## 🔑 Chaves Primárias e Estrangeiras

### Chaves Primárias (PK)
- Todas as tabelas usam `BIGSERIAL` (sequência auto-incremental)
- Tipo: BIGINT (para escalabilidade)

### Chaves Estrangeiras (FK) - Relacionamentos

| Origem | Destino | Cardinalidade | Ação DELETE |
|--------|---------|---------------|------------|
| ANIMAIS.proprietario_id | UTILIZADORES.id | N:1 | CASCADE |
| RESERVAS.animal_id | ANIMAIS.id | N:1 | RESTRICT |
| RESERVAS.espacio_id | ESPACOS_ALOJAMENTO.id | N:1 | SET NULL |
| PAGAMENTOS.reserva_id | RESERVAS.id | N:1 | RESTRICT |
| RESERVAS_SERVICOS.reserva_id | RESERVAS.id | N:1 | CASCADE |
| RESERVAS_SERVICOS.servico_id | SERVICOS.id | N:1 | RESTRICT |

---

## 🏃 Fluxo de Negócio Típico

### Cenário 1: Criação de Reserva

```
1. Proprietário (UTILIZADOR) registra animal (ANIMAL)
   └─ animal_id gerado
   
2. Proprietário cria reserva (RESERVA)
   ├─ Estado: PENDENTE
   ├─ Pré-calcula preço_base (dias × tarifa)
   ├─ animal_id referenciado
   └─ espacio_id: NULL (atribuído no check-in)
   
3. Sistema confirma (muda para CONFIRMADA)
   └─ Requer pagamento validado
   
4. Funcionário faz check-in (passa para EM_ESTADIA)
   ├─ Atualiza espacio_id
   ├─ Atualiza estado ESPACO para OCUPADO
   └─ Registra instante_checkin
   
5. Podem ser adicionados serviços (RESERVAS_SERVICOS)
   └─ Com datas de execução durante a estadia
   
6. Funcionário faz check-out (passa para CONCLUIDA)
   ├─ Registra instante_checkout
   ├─ Atualiza estado ESPACO para DISPONIVEL
   └─ Calcula total final (preco_base + servicos)
   
7. Proprietário realiza pagamento (PAGAMENTO)
   └─ Metodo: MBWAY/CARTAO/TRANSFERENCIA/NUMERARIO
```

### Cenário 2: Cancelamento

```
PENDENTE ──► CANCELADA
  ou
CONFIRMADA ──► CANCELADA
  ou
EM_ESTADIA ──► CANCELADA (com penalidade?)

Estado terminal: Sem reversão possível
```

---

## 📊 Cardinalidades Importantes

```
UTILIZADOR : ANIMAL = 1:N (um proprietário tem vários animais)

ANIMAL : RESERVA = 1:N (um animal tem múltiplas reservas no tempo)

ESPACIO_ALOJAMENTO : RESERVA = 1:N (um espaço tem múltiplas reservas em períodos diferentes)

RESERVA : PAGAMENTO = 1:N (uma reserva pode ter múltiplos pagamentos parciais)

RESERVA : SERVICO = N:M (via tabela RESERVAS_SERVICOS)
  → Uma reserva tem múltiplos serviços
  → Um serviço é usado em múltiplas reservas
```

---

## 🎯 Estados e Transições

### Estados de RESERVA

```plaintext
PENDENTE
  ├─ Aguardando confirmação
  ├─ Sem pagamento obrigatório ainda
  └─ Pode: → CONFIRMADA (confirmar), → CANCELADA (cancelar)

CONFIRMADA
  ├─ Confirmada e com pagamento recebido
  ├─ Espaço ainda não atribuído
  └─ Pode: → EM_ESTADIA (check-in), → CANCELADA (cancelar)

EM_ESTADIA
  ├─ Animal presente no estabelecimento
  ├─ Espaço já está OCUPADO
  ├─ Podem ser acrescidos serviços
  └─ Pode: → CONCLUIDA (check-out), → CANCELADA (cancelar com penalidade)

CONCLUIDA ✓
  ├─ Animal já partiu
  ├─ Espaço libertado
  └─ Estado terminal (sem reversão)

CANCELADA ✗
  ├─ Cancelada a qualquer hora
  ├─ Espaço libertado se estava OCUPADO
  └─ Estado terminal (sem reversão)
```

---

## 🔐 Tipos de Conta

| Tipo | Acesso | Permissões |
|------|--------|-----------|
| **PROPRIETARIO** | Limitado | Ver/gerir seus animais e reservas |
| **FUNC_OPERACIONAL** | Operações | Check-in/out, executar serviços |
| **FUNC_ADMINISTRATIVO** | Administrativo | Gestão de dados, pagamentos, faturação |
| **DIRECAO** | Análise | Relatórios, análises financeiras |
| **ADMIN** | Total | Acesso completo ao sistema |

---

## 💰 Modelo de Preços

### Preço Base (calculado na criação da reserva)
```
preco_base = num_dias × tarifa_diaria_especie_porte
```

Exemplo:
- Cão grande: 50€/dia
- 5 dias: 250€ preco_base

### Serviços Adicionais
- Acrescidos durante a estadia
- Cada serviço têm seu preço fixo
- Armazenados em RESERVAS_SERVICOS

### Total da Reserva
```
total = preco_base + SUM(servicos)
```

### Pagamentos
- Podem ser parciais ou totais
- Razões por método (MBWAY, CARTAO, TRANSFERENCIA, NUMERARIO)
- Múltiplos pagamentos por reserva permitidos

---

## 🚀 Queries Críticas de Performance

### 1. Encontrar Espaços Disponíveis
```sql
SELECT * FROM espacos_alojamento
WHERE especie = ? AND porte = ? AND estado = 'DISPONIVEL'
  AND id NOT IN (
    SELECT DISTINCT espacio_id FROM reservas
    WHERE estado IN ('CONFIRMADA', 'EM_ESTADIA')
      AND NOT (data_fim < ? OR data_inicio > ?)
  );
```
**Índice Recomendado:** `(especie, porte, estado)` + `(espacio_id, data_inicio, data_fim)`

### 2. Listar Reservas de um Proprietário
```sql
SELECT r.* FROM reservas r
JOIN animais a ON r.animal_id = a.id
WHERE a.proprietario_id = ?
  AND r.data_fim > CURDATE()
ORDER BY r.data_inicio;
```
**Índice Recomendado:** `animais(proprietario_id)` + `reservas(animal_id, data_fim)`

### 3. Receita Total num Período
```sql
SELECT SUM(valor) FROM pagamentos
WHERE DATE(instante_pagamento) BETWEEN ? AND ?;
```
**Índice Recomendado:** `pagamentos(instante_pagamento)`

### 4. Serviços de uma Reserva
```sql
SELECT s.* FROM servicos s
JOIN reservas_servicos rs ON s.id = rs.servico_id
WHERE rs.reserva_id = ?
ORDER BY rs.data_execucao;
```
**Índice Recomendado:** `reservas_servicos(reserva_id, servico_id)`

---

## 🔍 Integridade de Dados

### Constraints CHECK
- `UTILIZADOR.tipo_conta` tem valores limitados
- `RESERVA.data_fim > data_inicio`
- `ESPACIO.estado` em conjunto valid
- `PAGAMENTO.valor > 0`

### Validações de Compatibilidade
- Cão + porte grande → Espaço com porte GRANDE
- Cão + porte pequeno/médio → Espaço com porte PEQUENO_MEDIO
- Gato → Espaço com porte NAO_APLICAVEL

### Soft Delete
- UTILIZADOR.ativo (false = eliminado logicamente)
- Permite manter integridade referencial

---

## 📈 Crescimento Esperado

| Tabela | Ano 1 | Ano 3 | Índices Críticos |
|--------|-------|-------|-----------------|
| UTILIZADORES | 100 | 500 | email, tipo_conta |
| ANIMAIS | 500 | 3000 | proprietario_id |
| ESPACOS | 50 | 50 | codigo, estado |
| SERVICOS | 10 | 20 | nome, disponivel |
| RESERVAS | 2000 | 20000 | animal_id, data_periodo |
| PAGAMENTOS | 2000 | 20000 | reserva_id, data_pag |
| RESERVAS_SERVICOS | 1000 | 15000 | reserva_id |

---

## 🛠️ Manutenção Recomendada

### Backup
- Diário para produação
- Esquema: `patudos_db_YYYY-MM-DD.sql`
- Localização: `/backups/`

### Limpeza de Dados
- Arquivar RESERVAS CANCELADA com > 1 ano
- Limpar ficheiros de fatura de PAGAMENTO com > 2 anos

### Monitoramento
- N° de RESERVAS em estado PENDENTE (> 7 dias = notificação)
- Espaços em MANUTENCAO (> 30 dias = alertar)
- Taxa de pagamento (calcular atrasos)

---

## ✅ Checklist de Implementação

- [x] **Entidades JPA Criadas**
  - ✅ Animal.java
  - ✅ Utilizador.java
  - ✅ Reserva.java
  - ✅ Pagamento.java
  - ✅ Servico.java
  - ✅ EspacoAlojamento.java
  - ✅ ReservaServico.java

- [x] **Enums Definidos**
  - ✅ Especie.java
  - ✅ Porte.java
  - ✅ TipoConta.java
  - ✅ EstadoReserva.java (⚠️ Falta CONFIRMADA)
  - ✅ EstadoEspaco.java

- [ ] **Repositories (Spring Data JPA)**
  - [ ] UtilizadorRepository
  - [ ] AnimalRepository
  - [ ] ReservaRepository
  - [ ] PagamentoRepository
  - [ ] ServicoRepository
  - [ ] EspacoAlojamentoRepository
  - [ ] ReservaServicoRepository

- [ ] **Services**
  - [ ] AnimalService
  - [ ] ReservaService
  - [ ] PagamentoService
  - [ ] EspacoService

- [ ] **Controllers REST**
  - [ ] AnimalController
  - [ ] ReservaController
  - [ ] PagamentoController
  - [ ] EspacoController

- [ ] **Testes Unitários**
  - [ ] Testes de validação
  - [ ] Testes de compatibilidade espaço-animal

---

## 🐛 Problemas Conhecidos

### 1. ⚠️ EstadoReserva Incompleto
- **Problema:** Backend tem 4 estados, frontend espera 5 (CONFIRMADA)
- **Impacto:** Validação de estado falha
- **Solução:** Adicionar `CONFIRMADA` ao enum

### 2. ⚠️ MetodoPagamento não é Enum
- **Problema:** Armazenado como String
- **Impacto:** Sem type-checking
- **Solução:** Criar `MetodoPagamento.java` Enum

### 3. 📝 Falta Auditoria
- **Problema:** Sem `created_at`, `updated_at` na maioria das tabelas
- **Impacto:** Rastreabilidade limitada
- **Solução:** Adicionar MappedSuperclass com campos de auditoria

---

## 📚 Documentação Relacionada

- **MAPEAMENTO_TABELAS_BD.md** - Detalhe de cada tabela
- **ENUMS_E_VALIDACOES.md** - Enum values e regras
- **SCHEMA_SQL.md** - Scripts DDL para PostgreSQL
- **README.md** (projeto) - Arquitetura geral

---

**Última Atualização:** Maio 2026  
**Versão:** 1.0  
**Status:** ✅ Completo


