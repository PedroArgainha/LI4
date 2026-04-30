# 🗂️ Índice Completo - Documentação do Modelo de Dados

## 📑 Documentos Disponíveis

Este projeto inclui **4 documentos principais** de referência para compreender e trabalhar com o modelo de dados.

### 1. 📊 [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) ⭐ **COMECE AQUI**
**Objetivo:** Visão geral rápida e compreensão da arquitetura
- ✅ Diagrama visual das relações
- ✅ Fluxos de negócio típicos
- ✅ Estados e transições
- ✅ Queries críticas
- ✅ Checklist de implementação
- **Tempo de leitura:** 10-15 min

---

### 2. 📋 [MAPEAMENTO_TABELAS_BD.md](MAPEAMENTO_TABELAS_BD.md)
**Objetivo:** Detalhe completo de cada tabela
- ✅ Descrição por coluna
- ✅ Tipos de dados e restrições
- ✅ Índices e relacionamentos
- ✅ Casos de uso e exemplos SQL
- ✅ Constraints de integridade
- **Tempo de leitura:** 20-30 min
- **Público:** DBAs, Developers, Arquitetos

---

### 3. 🔍 [ENUMS_E_VALIDACOES.md](ENUMS_E_VALIDACOES.md)
**Objetivo:** Reference técnica dos enumerados
- ✅ Valores de cada Enum
- ✅ Regras de negócio por Enum
- ✅ Validações por entidade
- ✅ Máquinas de estados
- ✅ ⚠️ Problemas conhecidos identificados
- **Tempo de leitura:** 15-20 min
- **Público:** Backend Developers, QA

---

### 4. 🗄️ [SCHEMA_SQL.md](SCHEMA_SQL.md)
**Objetivo:** Scripts SQL prontos para executar
- ✅ CREATE TABLE statements
- ✅ Índices otimizados
- ✅ Views úteis
- ✅ Triggers e Procedures
- ✅ Scripts de teste e backup
- **Tempo de leitura:** 15-20 min (reference)
- **Público:** DBAs, DevOps, Developers

---

## 🎯 Como Usar Esta Documentação

### 🟢 Se Você Quer...

#### Entender o projeto em 10 minutos
→ Leia: [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) (seções 1-3)

#### Implementar uma nova feature
→ Seqência:
1. [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) - Entender fluxo
2. [MAPEAMENTO_TABELAS_BD.md](MAPEAMENTO_TABELAS_BD.md) - Detalhes técnicos
3. [ENUMS_E_VALIDACOES.md](ENUMS_E_VALIDACOES.md) - Validações

#### Criar a base de dados do zero
→ Use: [SCHEMA_SQL.md](SCHEMA_SQL.md)
```bash
psql -h localhost -p 5433 -U patudos -d patudos_db < SCHEMA_SQL.md
```

#### Debugar um problema
→ Procure em:
1. [ENUMS_E_VALIDACOES.md](ENUMS_E_VALIDACOES.md) - Problemas conhecidos
2. [MAPEAMENTO_TABELAS_BD.md](MAPEAMENTO_TABELAS_BD.md) - Constraints
3. [SCHEMA_SQL.md](SCHEMA_SQL.md) - Queries úteis

#### Criar um relatório SQL
→ Consulte: [SCHEMA_SQL.md](SCHEMA_SQL.md) - Seção "Views Úteis"

---

## 🔍 Guia de Busca Rápida

| Preciso encontrar... | Aceder a | Seção |
|----------------------|----------|-------|
| Estrutura de RESERVAS | MAPEAMENTO_TABELAS_BD.md | #3-RESERVAS |
| Estados de RESERVA | RESUMO_EXECUTIVO.md | Estados e Transições |
| Validações | ENUMS_E_VALIDACOES.md | Validações por Entidade |
| Criar tabelas | SCHEMA_SQL.md | Criação de Tabelas |
| Query de espaços disponíveis | MAPEAMENTO_TABELAS_BD.md | Casos de Uso #2 |
| Fluxo check-in/check-out | RESUMO_EXECUTIVO.md | Fluxo de Negócio |
| Trigger de atualização | SCHEMA_SQL.md | Triggers |
| Campo de cada tabela | MAPEAMENTO_TABELAS_BD.md | Detalhamento |
| Problema conhecido | ENUMS_E_VALIDACOES.md | Problemas e Recomendações |
| Criar Repositório | RESUMO_EXECUTIVO.md | Checklist |

---

## 📊 Estrutura De Pastas

```
patudos-companhia/
│
├── 📄 RESUMO_EXECUTIVO.md                ← Comece aqui!
├── 📄 MAPEAMENTO_TABELAS_BD.md            ← Detalhe técnico
├── 📄 ENUMS_E_VALIDACOES.md               ← Valores e validações
├── 📄 SCHEMA_SQL.md                       ← Scripts SQL
├── 📄 INDICE_DOCUMENTACAO.md              ← Este arquivo
│
├── backend/
│   ├── src/main/java/com/patudos/
│   │   ├── entity/                        ← Entidades JPA
│   │   │   ├── Animal.java
│   │   │   ├── Utilizador.java
│   │   │   ├── Reserva.java
│   │   │   ├── Pagamento.java
│   │   │   ├── Servico.java
│   │   │   ├── EspacoAlojamento.java
│   │   │   └── ReservaServico.java
│   │   │
│   │   ├── enums/                         ← Enumerados
│   │   │   ├── Especie.java
│   │   │   ├── Porte.java
│   │   │   ├── TipoConta.java
│   │   │   ├── EstadoReserva.java
│   │   │   └── EstadoEspaco.java
│   │   │
│   │   ├── repository/                    ← Repositories (a fazer)
│   │   ├── service/                       ← Services (a fazer)
│   │   └── controller/                    ← Controllers (a fazer)
│   │
│   └── resources/
│       └── application.properties         ← Config BD (PostgreSQL)
│
└── frontend/
    ├── src/
    │   ├── types/                         ← TypeScript Interfaces
    │   │   ├── animal.ts
    │   │   ├── auth.ts
    │   │   ├── pagamento.ts
    │   │   ├── reserva.ts
    │   │   ├── servico.ts
    │   │   └── relatorio.ts
    │   │
    │   ├── api/                           ← Integração com backend
    │   ├── pages/                         ← Páginas da aplicação
    │   └── components/                    ← Componentes React
```

---

## 🔗 Relacionamentos Entre Documentos

```
START
  │
  ├──→ Quer entender rápido?
  │      └──→ RESUMO_EXECUTIVO.md
  │           └──→ MAPEAMENTO_TABELAS_BD.md (para detalhes)
  │
  ├──→ Precisa implementar?
  │      ├──→ RESUMO_EXECUTIVO.md (fluxo)
  │      ├──→ MAPEAMENTO_TABELAS_BD.md (estrutura)
  │      └──→ ENUMS_E_VALIDACOES.md (validações)
  │
  ├──→ Precisa criar a BD?
  │      └──→ SCHEMA_SQL.md
  │           └──→ MAPEAMENTO_TABELAS_BD.md (conceitual)
  │
  └──→ Debugando um problema?
         ├──→ ENUMS_E_VALIDACOES.md (problemas conhecidos)
         ├──→ SCHEMA_SQL.md (queries úteis)
         └──→ MAPEAMENTO_TABELAS_BD.md (constraints)
```

---

## 📊 Tabela de Maturidade - O Que Falta Implementar

| Componente | Status | Referência | Prioridade |
|----------|--------|-----------|-----------|
| **Entidades JPA** | ✅ Completo | backend/entity/ | - |
| **Enums** | ⚠️ Incompleto | ENUMS_E_VALIDACOES.md | 🔴 ALTO |
| **Repositories** | ❌ A fazer | RESUMO_EXECUTIVO.md#checklist | 🔴 ALTO |
| **Services** | ❌ A fazer | RESUMO_EXECUTIVO.md#checklist | 🔴 ALTO |
| **Controllers REST** | ❌ A fazer | RESUMO_EXECUTIVO.md#checklist | 🟠 MÉDIO |
| **Data Validation** | ⚠️ Parcial | ENUMS_E_VALIDACOES.md | 🟠 MÉDIO |
| **Tests Unitários** | ❌ A fazer | RESUMO_EXECUTIVO.md#checklist | 🟡 BAIXO |
| **Documentação Swagger** | ❌ A fazer | - | 🟡 BAIXO |

---

## 🚀 Próximos Passos

### 1️⃣ Corrigir Problemas Conhecidos (Imediato)
```
⚠️ Adicionar CONFIRMADA a EstadoReserva
⚠️ Criar MetodoPagamento.java Enum
→ Ver: ENUMS_E_VALIDACOES.md#problemas-e-recomendações
```

### 2️⃣ Implementar Repositories (Esta Semana)
```
Criar interfaces Spring Data JPA para:
- UtilizadorRepository
- AnimalRepository
- ReservaRepository
- PagamentoRepository
- ServicoRepository
- EspacoAlojamentoRepository
- ReservaServicoRepository
```

### 3️⃣ Implementar Services (Próxima Semana)
```
Criar camada de negócio com:
- AnimalService
- ReservaService
- PagamentoService
- EspacoService
```

### 4️⃣ Implementar Controllers (Duas Semanas)
```
Criar endpoints REST para todas as operações CRUD
→ Ver endpoints necessários em frontend/src/api/
```

---

## 📞 Como Usar Este Índice

### Opção 1: Leitura Linear
1. RESUMO_EXECUTIVO.md
2. MAPEAMENTO_TABELAS_BD.md
3. ENUMS_E_VALIDACOES.md
4. SCHEMA_SQL.md

### Opção 2: Acesso por Tópico
Use a tabela "Guia de Busca Rápida" acima

### Opção 3: Referência Técnica
Mantenha aberto:
- MAPEAMENTO_TABELAS_BD.md (durante desenvolvimento)
- SCHEMA_SQL.md (durante debugging)

---

## 🤝 Contribuindo

Se encontrar:
- ❌ Erros de tipografia
- ❌ Informação desatualizada
- ✅ Sugestões de melhorias

Atualizar o documento relevante e validar referências cruzadas.

---

## 📝 Versão e Histórico

| Versão | Data | Alterações |
|--------|------|-----------|
| 1.0 | Maio 2026 | Release inicial |
| | | - Criados 4 documentos principais |
| | | - Indice_documentacao criado |
| | | - 7 tabelas documentadas |
| | | - 5 Enums documentados |

---

## 🎓 Leitura Estimada Total

- **Rápida (Visão Geral):** 15 min → RESUMO_EXECUTIVO.md
- **Completa (Dev Backend):** 1 hora → Todos
- **Reference (Consulta):** N/A → Acesso conforme necessário

---

## ℹ️ Informação de Contacto Técnico

**Nome do Projeto:** Patudos Companhia  
**Tipo de Projeto:** Aplicação de Gestão de Alojamento  
**Stack:** Spring Boot 4.0.5 + React + PostgreSQL  
**Ambiente:** localhost:5433/patudos_db

---

**Última Atualização:** Maio 2026  
**Mantido por:** Equipa de Desenvolvimento  
**Status:** ✅ Ativo


