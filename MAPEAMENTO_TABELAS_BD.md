# 📊 Mapeamento das Tabelas - Base de Dados Patudos Companhia

## 🏗️ Diagrama Entidade-Relação

```
┌─────────────────────┐
│   UTILIZADORES      │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ nome                │
│ telefone            │
│ password_hash       │
│ tipo_conta  (ENUM) │
│ ativo (BOOLEAN)     │
└─────────────────────┘
         │
         │ 1:N
         ├──────────────────────┐
         │                      │
         ▼                      ▼
    ┌─────────────┐      ┌──────────────────┐
    │  ANIMAIS    │      │ RESERVAS         │
    ├─────────────┤      ├──────────────────┤
    │ id (PK)     │      │ id (PK)          │
    │ nome        │      │ animal_id (FK)   │
    │ especie     │      │ espacio_id (FK)  │
    │ porte       │      │ data_inicio      │
    │ raca        │      │ data_fim         │
    │ data_nasc   │      │ estado (ENUM)    │
    │ observacoes │      │ instante_checkin │
    │ propr_id*   │      │ instante_checkout│
    └─────────────┘      │ preco_base       │
                         └──────────────────┘
                              │
                    1:N ┌──────┴──────┐
                        │             │
                        ▼             ▼
                  ┌──────────────┐  ┌──────────────┐
                  │ PAGAMENTOS   │  │ESPACO_ALOJA  │
                  ├──────────────┤  ├──────────────┤
                  │ id (PK)      │  │ id (PK)      │
                  │ reserva_id*  │  │ codigo(UNIQ) │
                  │ valor        │  │ especie      │
                  │ metodo_pag   │  │ porte        │
                  │ instante_pag │  │ estado(ENUM) │
                  │ caminho_fat  │  │ observacoes  │
                  └──────────────┘  └──────────────┘
                                           ▲
                  ┌──────────────────────────┘
                  │
                  N:N (através de tabela de junção)
                  │
            ┌─────────────────────┐
            │RESERVAS_SERVICOS    │
            ├─────────────────────┤
            │ id (PK)             │
            │ reserva_id (FK)     │
            │ servico_id (FK)     │
            │ data_execucao       │
            │ realizado(BOOLEAN)  │
            └──────────────────┬──┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   SERVICOS          │
                    ├─────────────────────┤
                    │ id (PK)             │
                    │ nome                │
                    │ descricao           │
                    │ preco               │
                    │ capacidade_diaria   │
                    │ disponivel(BOOLEAN) │
                    └─────────────────────┘
```

---

## 📋 Detalhamento das Tabelas

### 1. **UTILIZADORES** (tabela: `utilizadores`)
**Descrição:** Armazena informações de todos os utilizadores do sistema (proprietários, funcionários, administradores).

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Email de login |
| `nome` | VARCHAR(200) | NOT NULL | Nome completo |
| `telefone` | VARCHAR(20) | NOT NULL | Número de contacto |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash BCrypt da password |
| `tipo_conta` | ENUM | NOT NULL | PROPRIETARIO, FUNC_ADMINISTRATIVO, FUNC_OPERACIONAL, DIRECAO, ADMIN |
| `ativo` | BOOLEAN | NOT NULL | Marca eliminação lógica |

**Índices:**
- `email` (UNIQUE)

**Relacionamentos:**
- 1:N com `ANIMAIS` (proprietário)
- 1:N com `RESERVAS` (implícito através de ANIMAIS)

---

### 2. **ANIMAIS** (tabela: `animais`)
**Descrição:** Informações dos animais de estimação registados no sistema.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `nome` | VARCHAR(100) | NOT NULL | Nome do animal |
| `especie` | ENUM | NOT NULL | CAO, GATO |
| `porte` | ENUM | NOT NULL | PEQUENO_MEDIO, GRANDE, NAO_APLICAVEL |
| `raca` | VARCHAR(100) | | Raça do animal |
| `data_nascimento` | DATE | | Data de nascimento |
| `observacoes` | TEXT | | Notas especiais (medicação, alergias, etc.) |
| `proprietario_id` | BIGINT | FK NOT NULL | Referência ao UTILIZADORES |

**Índices:**
- `proprietario_id` (FK)

**Relacionamentos:**
- N:1 com `UTILIZADORES` (proprietário)
- 1:N com `RESERVAS`

---

### 3. **RESERVAS** (tabela: `reservas`)
**Descrição:** Reservas de alojamento para os animais.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `animal_id` | BIGINT | FK NOT NULL | Referência ao ANIMAIS |
| `espaco_id` | BIGINT | FK | Espaço atribuído (NULL até check-in) |
| `data_inicio` | DATE | NOT NULL | Data de check-in prevista |
| `data_fim` | DATE | NOT NULL | Data de check-out prevista |
| `estado` | ENUM | NOT NULL | PENDENTE, CONFIRMADA, EM_ESTADIA, CONCLUIDA, CANCELADA |
| `instante_checkin` | TIMESTAMP | | Quando o animal chegou (atualizado no check-in) |
| `instante_checkout` | TIMESTAMP | | Quando o animal saiu (atualizado no check-out) |
| `preco_base` | DECIMAL(10,2) | NOT NULL | Tarifa calculada (dias × valor diário) |

**Índices:**
- `animal_id` (FK)
- `espaco_id` (FK)
- Índice composto em `(data_inicio, data_fim)` para queries de disponibilidade

**Relacionamentos:**
- N:1 com `ANIMAIS`
- N:1 com `ESPACO_ALOJAMENTO`
- 1:N com `PAGAMENTOS`
- 1:N com `RESERVAS_SERVICOS`

---

### 4. **PAGAMENTOS** (tabela: `pagamentos`)
**Descrição:** Registo de pagamentos realizados pelas reservas.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `reserva_id` | BIGINT | FK NOT NULL | Referência a RESERVAS |
| `valor` | DECIMAL(10,2) | NOT NULL | Valor pagado |
| `metodo_pagamento` | VARCHAR(50) | NOT NULL | MBWAY, CARTAO, TRANSFERENCIA, NUMERARIO |
| `instante_pagamento` | TIMESTAMP | NOT NULL | Quando foi efetuado |
| `caminho_fatura` | VARCHAR(255) | | Caminho para PDF da fatura gerada |

**Índices:**
- `reserva_id` (FK)
- Índice em `instante_pagamento` para queries de resgate

**Relacionamentos:**
- N:1 com `RESERVAS`

---

### 5. **SERVICOS** (tabela: `servicos`)
**Descrição:** Catálogo de serviços adicionais oferecidos (banhos, passeios, adestramento, etc.).

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `nome` | VARCHAR(100) | NOT NULL | Nome do serviço |
| `descricao` | TEXT | | Descrição detalhada |
| `preco` | DECIMAL(8,2) | NOT NULL | Preço por execução |
| `capacidade_diaria` | INT | | Máximo de execuções/dia (NULL = sem limite) |
| `disponivel` | BOOLEAN | NOT NULL | Se o serviço está ativo |

**Índices:**
- Nenhum adicional (tabela pequena e estável)

**Relacionamentos:**
- 1:N com `RESERVAS_SERVICOS`

---

### 6. **ESPACOS_ALOJAMENTO** (tabela: `espacos_alojamento`)
**Descrição:** Espaços físicos onde os animais podem ficar alojados.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `codigo` | VARCHAR(20) | UNIQUE NOT NULL | Código visível (ex: "CA1", "CF3", "CG2") |
| `especie` | ENUM | NOT NULL | CAO, GATO (que espécie pode usar) |
| `porte` | ENUM | NOT NULL | PEQUENO_MEDIO, GRANDE, NAO_APLICAVEL |
| `estado` | ENUM | NOT NULL | DISPONIVEL, OCUPADO, MANUTENCAO, DESATIVADO |
| `observacoes` | TEXT | | Notas sobre o espaço |

**Índices:**
- `codigo` (UNIQUE)

**Relacionamentos:**
- 1:N com `RESERVAS` (um espaço pode ter várias reservas em diferentes períodos)

---

### 7. **RESERVAS_SERVICOS** (tabela: `reservas_servicos`)
**Descrição:** Tabela de junção N:N entre RESERVAS e SERVICOS com atributos adicionais.

*Nota: Esta é uma tabela de relacionamento com dados próprios, não uma simples tabela de junção.*

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `reserva_id` | BIGINT | FK NOT NULL | Referência a RESERVAS |
| `servico_id` | BIGINT | FK NOT NULL | Referência a SERVICOS |
| `data_execucao` | DATE | | Quando o serviço será feito |
| `realizado` | BOOLEAN | NOT NULL | Se já foi executado (default: false) |

**Índices:**
- `reserva_id` (FK)
- `servico_id` (FK)
- Índice composto em `(reserva_id, servico_id)` para evitar duplicatas e ter queries rápidas

**Relacionamentos:**
- N:1 com `RESERVAS`
- N:1 com `SERVICOS`

---

## 🎯 Casos de Uso e Queries Comuns

### Caso 1: Listar animais de um proprietário com reservas futuras
```sql
SELECT a.*, r.data_inicio, r.data_fim, r.estado
FROM animais a
JOIN reservas r ON a.id = r.animal_id
WHERE a.proprietario_id = ? 
  AND r.data_fim > CURDATE()
  AND r.estado != 'CANCELADA'
ORDER BY r.data_inicio;
```

### Caso 2: Encontrar espaços disponíveis para uma espécie/porte num período
```sql
SELECT e.id, e.codigo
FROM espacos_alojamento e
WHERE e.especie = ? 
  AND e.porte = ?
  AND e.estado = 'DISPONIVEL'
  AND e.id NOT IN (
    SELECT DISTINCT r.espaco_id 
    FROM reservas r
    WHERE r.estado IN ('CONFIRMADA', 'EM_ESTADIA')
      AND NOT (r.data_fim < ? OR r.data_inicio > ?)
  );
```

### Caso 3: Calcular receita total num período
```sql
SELECT SUM(p.valor) as receita_total
FROM pagamentos p
WHERE p.instante_pagamento BETWEEN ? AND ?;
```

### Caso 4: Listar serviços adicionados a uma reserva
```sql
SELECT s.*, rs.data_execucao, rs.realizado
FROM servicos s
JOIN reservas_servicos rs ON s.id = rs.servico_id
WHERE rs.reserva_id = ?
ORDER BY rs.data_execucao;
```

---

## 🔐 Constraints de Integridade

| Constraint | Tabelas | Descrição |
|-----------|---------|-----------|
| FK | `animais.proprietario_id` → `utilizadores.id` | Um animal pertence a um proprietário |
| FK | `reservas.animal_id` → `animais.id` | Uma reserva é para um animal |
| FK | `reservas.espaco_id` → `espacos_alojamento.id` | Uma reserva usa um espaço |
| FK | `pagamentos.reserva_id` → `reservas.id` | Um pagamento é de uma reserva |
| FK | `reservas_servicos.reserva_id` → `reservas.id` | Serviço está associado a uma reserva |
| FK | `reservas_servicos.servico_id` → `servicos.id` | Serviço existe no catálogo |
| UNIQUE | `utilizadores.email` | Cada utilizador tem email único |
| UNIQUE | `espacos_alojamento.codigo` | Cada espaço tem código único |

---

## 🛠️ Configurações Hibernate/JPA

As entidades estão configuradas com:

- **Strategy de ID:** `GenerationType.IDENTITY` (auto-increment no PostgreSQL)
- **Fetch Strategy:** `FetchType.LAZY` (carregamento sob demanda para relações)
- **Cascade:** `CascadeType.ALL` em relações 1:N (ex: propagação de delete)
- **DDL Auto:** `update` (Hibernate atualiza schema conforme necessário)

---

## 📝 Notas Importantes

1. **UTILIZADORES.tipo_conta:** Determina o papel e permissões no sistema
   - PROPRIETARIO: Apenas acede aos seus animais e reservas
   - FUNC_OPERACIONAL: Realiza check-ins, check-outs, serviços
   - FUNC_ADMINISTRATIVO: Gestão de dados, pagamentos
   - DIRECAO: Acesso a relatórios financeiros
   - ADMIN: Acesso total ao sistema

2. **RESERVAS.preco_base:** Calculado aquando da criação (dias × tarifa diária por espécie/porte)

3. **PAGAMENTOS.metodo_pagamento:** Pode ser expandido com mais opções

4. **ESPACOS_ALOJAMENTO:** O estado `OCUPADO` é atualizado automaticamente quando uma reserva entra em `EM_ESTADIA`

5. **RESERVAS_SERVICOS.realizado:** Flag para marcar serviços já executados durante a estadia

6. **Soft Delete em UTILIZADORES:** Campo `ativo` implementa eliminação lógica para manter integridade referencial

7. **Relacionamentos lazy:** Reduzem N+1 queries, mas requerem sessionFactory ativa ou fetch explícito

---

## 🚀 Próximos Passos Sugeridos

- [ ] Criar triggers para atualizar estado de ESPACOS_ALOJAMENTO quando RESERVAS mudam
- [ ] Implementar índices em `RESERVAS(data_inicio, data_fim)` para queries de disponibilidade
- [ ] Adicionar auditoria com `created_at`, `updated_at` em tabelas críticas
- [ ] Implementar soft delete com `deleted_at` em `RESERVAS` se necessário


