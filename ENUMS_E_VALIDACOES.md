# 📌 Enums e Validações do Sistema

## Enumerações Definidas

### 1. **Especie**
Tipos de animais suportados pelo sistema.

| Valor | Descrição |
|-------|-----------|
| `CAO` | Cão |
| `GATO` | Gato |

**Localização:** `com.patudos.enums.Especie`

**Regras de Negócio:**
- Cada animal tem uma espécie obrigatória
- Alguns serviços podem ser espécie-específicos
- Os espaços de alojamento devem ser compatíveis com a espécie

---

### 2. **Porte**
Classificação do tamanho do animal.

| Valor | Descrição | Aplicável a |
|-------|-----------|-------------|
| `PEQUENO_MEDIO` | Pequeno ou médio porte | Cães, Gatos |
| `GRANDE` | Grande porte | Apenas Cães |
| `NAO_APLICAVEL` | Não se aplica | Apenas Gatos |

**Localização:** `com.patudos.enums.Porte`

**Regras de Negócio:**
- Cães: PEQUENO_MEDIO ou GRANDE
- Gatos: sempre NAO_APLICAVEL
- Os espaços devem ter o porte apropriado para alojar o animal
- Validação na entidade `EspacoAlojamento.isCompativel()`

---

### 3. **TipoConta**
Papéis/roles dos utilizadores no sistema.

| Valor | Descrição | Permissões |
|-------|-----------|-----------|
| `PROPRIETARIO` | Dono de animais | Ver/gerir apenas seus animais e reservas |
| `FUNC_OPERACIONAL` | Funcionário operacional | Check-in/check-out, executar serviços |
| `FUNC_ADMINISTRATIVO` | Funcionário administrativo | Gerir dados, pagamentos |
| `DIRECAO` | Membro da direção | Acesso a relatórios e análises |
| `ADMIN` | Administrador do sistema | Acesso total |

**Localização:** `com.patudos.enums.TipoConta`

**Regras de Negócio:**
- Determinado durante registo do utilizador
- Pode ser alterado por ADMIN
- Controla autorização em endpoints (via Spring Security)

---

### 4. **EstadoReserva**
Estados possíveis de uma reserva ao longo do seu ciclo de vida.

| Valor | Descrição | Transições |
|-------|-----------|-----------|
| `PENDENTE` | Reserva criada, aguardando confirmação | → CONFIRMADA, CANCELADA|
| 
| `EM_ESTADIA` | Animal está presente no estabelecimento | → CONCLUIDA, CANCELADA |
| `CONCLUIDA` | Reserva finalizada, animal partiu | (terminal) |
| `CANCELADA` | Reserva cancelada | (terminal) |

**Localização:** `com.patudos.enums.EstadoReserva`

**Dados Armazenados:**
```
PENDENTE        --→ EM_ESTADIA    ---→ CONCLUIDA
                          ↓               ↓                   ✓
           CANCELADA (em qualquer altura)
```

**Campos Associados:**
- `instanteCheckIn` (preenchido ao passar para EM_ESTADIA)
- `instanteCheckOut` (preenchido ao passar para CONCLUIDA)
- `espaco_id` (atribuído ao check-in)

---

### 5. **EstadoEspaco**
Estados possíveis de um espaço de alojamento.

| Valor | Descrição | Disponível para Reservas |
|-------|-----------|-------------------------|
| `DISPONIVEL` | Espaço pronto para receber animal | ✅ Sim |
| `OCUPADO` | Espaço tem um animal alojado | ❌ Não |
| `MANUTENCAO` | Em processo de limpeza/manutenção | ❌ Não |
| `INATIVO` | Desativado/não disponível | ❌ Não |

**Localização:** `com.patudos.enums.EstadoEspaco`

**Regras de Negócio:**
- Transições automáticas:
  - DISPONIVEL → OCUPADO (ao hacer check-in)
  - OCUPADO → DISPONIVEL (ao hacer check-out)
- Transições manuais (por ADMIN/FUNC_OPERACIONAL):
  - DISPONIVEL ↔ MANUTENCAO
  - Qualquer → INATIVO

---

## 📋 Enumerações Sem Respectivo Java Enum

### **MetodoPagamento**
Métodos de pagamento aceites (armazenado como String em `Pagamento.metodo_pagamento`).

| Valor | Descrição |
|-------|-----------|
| `MBWAY` | MB Way (telemóvel) |
| `CARTAO` | Cartão de crédito/débito |
| `TRANSFERENCIA` | Transferência bancária |
| `NUMERARIO` | Numerário (dinheiro) |

**Localização:** `com.patudos.entity.Pagamento` (String, não referenciado como Enum)

**Sugestão de Melhoria:** 
Criar classe Enum `MetodoPagamento` para type-safety e validate

```java
public enum MetodoPagamento {
    MBWAY,
    CARTAO,
    TRANSFERENCIA,
    NUMERARIO
}
```

---

## 🔍 Validações por Entidade

### UTILIZADOR
```
email: não nulo, único, válido (regex email)
nome: não nulo, 1-200 chars
telefone: não nulo
passwordHash: não nulo, hash BCrypt válido
tipoConta: não nulo, valor enum válido
ativo: não nulo, padrão true
```

### ANIMAL
```
nome: não nulo, 1-100 chars
especie: não nulo, CAO ou GATO
porte: não nulo, valor enum válido
raca: 1-100 chars (opcional)
dataNascimento: data válida (opcional)
observacoes: texto livre (opcional)
proprietario_id: não nulo, FK válido
```

### RESERVA
```
animal_id: não nulo, FK válido
espacio_id: FK válido (opcional até check-in)
dataInicio: não nulo, data válida
dataFim: não nulo, data > dataInicio
estado: não nulo, valor enum válido
precoBase: não nulo, ≥ 0, 10.2 precision
instanteCheckIn: timestamp (opcional)
instanteCheckOut: timestamp (opcional)

Validação de negócio:
- dataFim deve estar depois de dataInicio
- dataInicio pode ser hoje ou futuro
```

### ESPACO_ALOJAMENTO
```
codigo: não nulo, único, 1-20 chars (ex: "CA1", "CF3")
especie: não nulo, valor enum válido
porte: não nulo, valor enum válido
estado: não nulo, valor enum válido
observacoes: texto livre (opcional)

Validação de compatibilidade:
- Se especie = CAO: porte = PEQUENO_MEDIO ou GRANDE
- Se especie = GATO: porte = NAO_APLICAVEL
```

### SERVICO
```
nome: não nulo, 1-100 chars
descricao: texto livre (opcional)
preco: não nulo, > 0, 8.2 precision
capacidadeDiaria: int (opcional, NULL = sem limite)
disponivel: não nulo, padrão true
```

### PAGAMENTO
```
reserva_id: não nulo, FK válido
valor: não nulo, > 0, 10.2 precision
metodoPagamento: não nulo, valor válido (MBWAY, CARTAO, TRANSFERENCIA, NUMERARIO)
instantePagamento: não nulo, timestamp
caminhoFatura: path válido (opcional)

Validação de negócio:
- valor ≤ total da reserva
- instantePagamento ≤ agora
```

### RESERVA_SERVICO
```
reserva_id: não nulo, FK válido
servico_id: não nulo, FK válido
dataExecucao: data válida (opcional)
realizado: não nulo, padrão false

Validação de negócio:
- dataExecucao deve estar entre dataInicio e dataFim da reserva
- não permitir duplicatas (reserva_id, servico_id)
```

---

## 🚨 Problemas e Recomendações

### ⚠️ 1. EstadoReserva Desincronizado
**Problema:** Frontend espera `CONFIRMADA`, backend só tem 4 estados
**Solução:** 
```java
public enum EstadoReserva {
    PENDENTE,
    CONFIRMADA,      // ← ADICIONAR
    EM_ESTADIA,
    CONCLUIDA,
    CANCELADA
}
```

### ⚠️ 2. MetodoPagamento não é Enum
**Problema:** Armazenado como String sem validação
**Solução:** Criar Enum e usar em JPA
```java
@Enumerated(EnumType.STRING)
private MetodoPagamento metodoPagamento;
```

### ⚠️ 3. EstadoEspaco.INATIVO vs DESATIVADO
**Problema:** Backend usa `INATIVO`, mas há feedback que poderia ser `DESATIVADO`
**Solução:** Manter `INATIVO` (mais comum em português técnico)

### ✅ 4. Validações de Porte/Espécie
**Status:** Bem implementado em `EspacoAlojamento.isCompativel()`
**Localização:** `backend/src/main/java/com/patudos/entity/EspacoAlojamento.java:65-69`

---

## 🔄 Transições de Estado - Máquina de Estados

### Máquina: EstadoReserva
```
┌─────────────┐
│  PENDENTE   │ ← Estado inicial após criar reserva
└──────┬──────┘
       │
       ├─→ CONFIRMADA (ao confirmar e receber pagamento)
       │       │
       │       └─→ EM_ESTADIA (no check-in)
       │               │
       │               └─→ CONCLUIDA (no check-out) ✓
       │
       └─→ CANCELADA (cancelamento) ✗
```

### Máquina: EstadoEspaco
```
          ┌── MANUTENCAO ──┐
          ↓                ↓
    ┌──────────────┐   INATIVO
    │ DISPONIVEL   │     ↑
    └──────────────┘     │
          ↑               │
          └─→ OCUPADO ────┘
                 ↓
           (check-out) → DISPONIVEL
```

---

## 📊 Tabela de Referência Rápida

| Entidade | Enum | Valores | Cardinalidade |
|----------|------|---------|---------------|
| Animal | Especie | CAO, GATO | 2 |
| Animal | Porte | PEQUENO_MEDIO, GRANDE, NAO_APLICAVEL | 3 |
| Utilizador | TipoConta | 5 valores | 5 |
| Reserva | EstadoReserva | 5 valores | 5 |
| EspacoAlojamento | Porte | 3 valores | 3 |
| EspacoAlojamento | Especie | 2 valores | 2 |
| EspacoAlojamento | EstadoEspaco | 4 valores | 4 |
| Pagamento | MetodoPagamento | 4 valores (String!) | 4 |

---

## 🛠️ Exemplo: Criar Enum para MetodoPagamento

```java
package com.patudos.enums;

public enum MetodoPagamento {
    MBWAY("MB Way", "Aplicação móvel"),
    CARTAO("Cartão", "Crédito/Débito"),
    TRANSFERENCIA("Transferência", "Bancária"),
    NUMERARIO("Numerário", "Dinheiro");

    private final String descricao;
    private final String detalhe;

    MetodoPagamento(String descricao, String detalhe) {
        this.descricao = descricao;
        this.detalhe = detalhe;
    }

    public String getDescricao() { return descricao; }
    public String getDetalhe() { return detalhe; }
}
```

E atualizar Pagamento.java:
```java
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 50)
private MetodoPagamento metodoPagamento;
```


