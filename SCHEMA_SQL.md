# 🗄️ Schema SQL - Criação de Tabelas

## 📋 Índice
1. [Variáveis de Ambiente](#variáveis-de-ambiente)
2. [Drop Tables (Limpeza)](#drop-tables--limpeza)
3. [Criação de Tabelas](#criação-de-tabelas)
4. [Views Úteis](#views-úteis)
5. [Índices Adicionais](#índices-adicionais)
6. [Procedures e Triggers](#procedures-e-triggers)

---

## Variáveis de Ambiente

**Banco de Dados:** PostgreSQL  
**Host:** localhost  
**Porta:** 5433  
**Base de Dados:** patudos_db  
**Utilizador:** patudos  
**Password:** patudos  

---

## Drop Tables – Limpeza

```sql
-- ⚠️ CUIDADO: Isto elimina todas as tabelas e dados!
-- Executar em ordem inversa de dependências (foreign keys)

DROP TABLE IF EXISTS reservas_servicos CASCADE;
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS servicos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS espacos_alojamento CASCADE;
DROP TABLE IF EXISTS animais CASCADE;
DROP TABLE IF EXISTS utilizadores CASCADE;
```

---

## Criação de Tabelas

### 1. UTILIZADORES

```sql
CREATE TABLE utilizadores (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tipo_conta VARCHAR(50) NOT NULL CHECK (tipo_conta IN (
        'PROPRIETARIO', 
        'FUNC_ADMINISTRATIVO', 
        'FUNC_OPERACIONAL', 
        'DIRECAO', 
        'ADMIN'
    )),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_utilizadores_email ON utilizadores(email);
CREATE INDEX idx_utilizadores_tipo_conta ON utilizadores(tipo_conta);
CREATE INDEX idx_utilizadores_ativo ON utilizadores(ativo);
```

---

### 2. ANIMAIS

```sql
CREATE TABLE animais (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL CHECK (especie IN ('CAO', 'GATO')),
    porte VARCHAR(50) NOT NULL CHECK (porte IN ('PEQUENO_MEDIO', 'GRANDE', 'NAO_APLICAVEL')),
    raca VARCHAR(100),
    data_nascimento DATE,
    observacoes TEXT,
    proprietario_id BIGINT NOT NULL REFERENCES utilizadores(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_animais_proprietario_id ON animais(proprietario_id);
CREATE INDEX idx_animais_especie ON animais(especie);
CREATE INDEX idx_animais_porte ON animais(porte);
```

---

### 3. ESPACOS_ALOJAMENTO

```sql
CREATE TABLE espacos_alojamento (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    especie VARCHAR(50) NOT NULL CHECK (especie IN ('CAO', 'GATO')),
    porte VARCHAR(50) NOT NULL CHECK (porte IN ('PEQUENO_MEDIO', 'GRANDE', 'NAO_APLICAVEL')),
    estado VARCHAR(50) NOT NULL DEFAULT 'DISPONIVEL' CHECK (estado IN (
        'DISPONIVEL', 
        'OCUPADO', 
        'MANUTENCAO', 
        'INATIVO'
    )),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_espacos_codigo ON espacos_alojamento(codigo);
CREATE INDEX idx_espacos_especie_porte ON espacos_alojamento(especie, porte);
CREATE INDEX idx_espacos_estado ON espacos_alojamento(estado);
```

---

### 4. SERVICOS

```sql
CREATE TABLE servicos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(8, 2) NOT NULL CHECK (preco > 0),
    capacidade_diaria INTEGER,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_servicos_nome ON servicos(nome);
CREATE INDEX idx_servicos_disponivel ON servicos(disponivel);
```

---

### 5. RESERVAS

```sql
CREATE TABLE reservas (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL REFERENCES animais(id) ON DELETE RESTRICT,
    espacio_id BIGINT REFERENCES espacos_alojamento(id) ON DELETE SET NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDENTE' CHECK (estado IN (
        'PENDENTE', 
        'CONFIRMADA',
        'EM_ESTADIA', 
        'CONCLUIDA', 
        'CANCELADA'
    )),
    instante_checkin TIMESTAMP,
    instante_checkout TIMESTAMP,
    preco_base NUMERIC(10, 2) NOT NULL CHECK (preco_base >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: data_fim deve ser depois de data_inicio
    CONSTRAINT chk_datas_reserva CHECK (data_fim > data_inicio)
);

-- Índices
CREATE INDEX idx_reservas_animal_id ON reservas(animal_id);
CREATE INDEX idx_reservas_espacio_id ON reservas(espacio_id);
CREATE INDEX idx_reservas_data_inicio ON reservas(data_inicio);
CREATE INDEX idx_reservas_data_fim ON reservas(data_fim);
CREATE INDEX idx_reservas_estado ON reservas(estado);

-- Índice composto para queries de disponibilidade
CREATE INDEX idx_reservas_periodo ON reservas(data_inicio, data_fim, estado) 
WHERE estado IN ('CONFIRMADA', 'EM_ESTADIA');
```

---

### 6. PAGAMENTOS

```sql
CREATE TABLE pagamentos (
    id BIGSERIAL PRIMARY KEY,
    reserva_id BIGINT NOT NULL REFERENCES reservas(id) ON DELETE RESTRICT,
    valor NUMERIC(10, 2) NOT NULL CHECK (valor > 0),
    metodo_pagamento VARCHAR(50) NOT NULL CHECK (metodo_pagamento IN (
        'MBWAY', 
        'CARTAO', 
        'TRANSFERENCIA', 
        'NUMERARIO'
    )),
    instante_pagamento TIMESTAMP NOT NULL,
    caminho_fatura VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_pagamentos_reserva_id ON pagamentos(reserva_id);
CREATE INDEX idx_pagamentos_metodo_pagamento ON pagamentos(metodo_pagamento);
CREATE INDEX idx_pagamentos_instante_pagamento ON pagamentos(instante_pagamento);
```

---

### 7. RESERVAS_SERVICOS

```sql
CREATE TABLE reservas_servicos (
    id BIGSERIAL PRIMARY KEY,
    reserva_id BIGINT NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    servico_id BIGINT NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
    data_execucao DATE,
    realizado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Evitar duplicatas
    UNIQUE(reserva_id, servico_id)
);

-- Índices
CREATE INDEX idx_reservas_servicos_reserva_id ON reservas_servicos(reserva_id);
CREATE INDEX idx_reservas_servicos_servico_id ON reservas_servicos(servico_id);
CREATE INDEX idx_reservas_servicos_data_execucao ON reservas_servicos(data_execucao);
CREATE INDEX idx_reservas_servicos_realizado ON reservas_servicos(realizado);
```

---

## Views Úteis

### VIEW 1: Reservas com Dados Completos

```sql
CREATE OR REPLACE VIEW v_reservas_completas AS
SELECT 
    r.id,
    r.animal_id,
    a.nome AS animal_nome,
    a.especie,
    a.porte,
    r.proprietario_id,
    u.nome AS proprietario_nome,
    u.email AS proprietario_email,
    r.espacio_id,
    e.codigo AS espacio_codigo,
    r.data_inicio,
    r.data_fim,
    r.estado,
    r.preco_base,
    COALESCE(SUM(s.preco), 0) AS total_servicos,
    r.preco_base + COALESCE(SUM(s.preco), 0) AS total_reserva,
    r.instante_checkin,
    r.instante_checkout
FROM reservas r
LEFT JOIN animais a ON r.animal_id = a.id
LEFT JOIN utilizadores u ON a.proprietario_id = u.id
LEFT JOIN espacos_alojamento e ON r.espacio_id = e.id
LEFT JOIN reservas_servicos rs ON r.id = rs.reserva_id
LEFT JOIN servicos s ON rs.servico_id = s.id
GROUP BY r.id, a.id, u.id, e.id;
```

### VIEW 2: Espaços com Status de Ocupação

```sql
CREATE OR REPLACE VIEW v_espacos_ocupacao AS
SELECT 
    e.id,
    e.codigo,
    e.especie,
    e.porte,
    e.estado,
    CASE 
        WHEN e.estado = 'OCUPADO' THEN r.id
        ELSE NULL
    END AS reserva_ativa_id,
    CASE 
        WHEN e.estado = 'OCUPADO' THEN a.nome
        ELSE NULL
    END AS animal_presente,
    CASE 
        WHEN e.estado = 'OCUPADO' THEN r.data_fim
        ELSE NULL
    END AS previsto_checkout
FROM espacos_alojamento e
LEFT JOIN reservas r ON e.id = r.espacio_id AND r.estado = 'EM_ESTADIA'
LEFT JOIN animais a ON r.animal_id = a.id;
```

### VIEW 3: Relatório de Receitas por Período

```sql
CREATE OR REPLACE VIEW v_receitas_por_dia AS
SELECT 
    DATE(p.instante_pagamento) AS data_pagamento,
    COUNT(DISTINCT p.id) AS num_pagamentos,
    SUM(p.valor) AS total_dia,
    COUNT(DISTINCT p.metodo_pagamento) AS metodos_utilizados
FROM pagamentos p
GROUP BY DATE(p.instante_pagamento)
ORDER BY data_pagamento DESC;
```

### VIEW 4: Utilizadores com Contagem de Animais

```sql
CREATE OR REPLACE VIEW v_proprietarios_animais AS
SELECT 
    u.id,
    u.email,
    u.nome,
    u.telefone,
    COUNT(DISTINCT a.id) AS num_animais,
    COUNT(DISTINCT r.id) AS num_reservas,
    MAX(r.data_fim) AS ultima_reserva
FROM utilizadores u
LEFT JOIN animais a ON u.id = a.proprietario_id
LEFT JOIN reservas r ON a.id = r.animal_id
WHERE u.tipo_conta = 'PROPRIETARIO'
GROUP BY u.id;
```

---

## Índices Adicionais

### Para Otimizar Queries Comuns

```sql
-- Índice para encontrar reservas de um animal num período
CREATE INDEX idx_reservas_animal_periodo ON reservas(animal_id, data_inicio, data_fim);

-- Índice para encontrar pagamentos pendentes (sem pagamento completo)
CREATE INDEX idx_pagamentos_nao_processados ON pagamentos(reserva_id, metodo_pagamento);

-- Índice para relatórios por data
CREATE INDEX idx_pagamentos_data ON pagamentos(DATE(instante_pagamento));

-- Índice para buscar animais por espécie/porte (queries de compatibilidade)
CREATE INDEX idx_animais_especie_porte ON animais(especie, porte);

-- Índice para encontrar espaços disponíveis
CREATE INDEX idx_espacos_disponibilidade ON espacos_alojamento(estado, especie, porte) 
WHERE estado = 'DISPONIVEL';
```

---

## Procedures e Triggers

### Trigger 1: Atualizar updated_at em UTILIZADORES

```sql
CREATE OR REPLACE FUNCTION trigger_update_utilizadores()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_utilizadores_updated
BEFORE UPDATE ON utilizadores
FOR EACH ROW
EXECUTE FUNCTION trigger_update_utilizadores();
```

### Trigger 2: Validar Compatibilidade Espaço-Animal no Check-in

```sql
CREATE OR REPLACE FUNCTION trigger_validar_checkin()
RETURNS TRIGGER AS $$
DECLARE
    v_especie VARCHAR;
    v_porte VARCHAR;
    v_espacio_especie VARCHAR;
    v_espacio_porte VARCHAR;
BEGIN
    IF NEW.instante_checkin IS NOT NULL AND OLD.instante_checkin IS NULL THEN
        -- Check-in acontecendo agora
        SELECT a.especie, a.porte INTO v_especie, v_porte
        FROM animais a WHERE a.id = NEW.animal_id;
        
        SELECT e.especie, e.porte INTO v_espacio_especie, v_espacio_porte
        FROM espacos_alojamento e WHERE e.id = NEW.espacio_id;
        
        -- Validar compatibilidade
        IF v_especie != v_espacio_especie THEN
            RAISE EXCEPTION 'Incompatibilidade: Animal é % mas espaço é %', v_especie, v_espacio_especie;
        END IF;
        
        IF v_especie = 'CAO' AND v_porte != v_espacio_porte THEN
            RAISE EXCEPTION 'Incompatibilidade: Porte animal % != porte espaço %', v_porte, v_espacio_porte;
        END IF;
        
        -- Atualizar espaço para OCUPADO
        UPDATE espacos_alojamento SET estado = 'OCUPADO' WHERE id = NEW.espacio_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_validar_checkin
BEFORE UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION trigger_validar_checkin();
```

### Trigger 3: Atualizar Espaço no Check-out

```sql
CREATE OR REPLACE FUNCTION trigger_checkout()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.instante_checkout IS NOT NULL AND OLD.instante_checkout IS NULL THEN
        -- Check-out acontecendo agora - espaço volta a DISPONIVEL
        UPDATE espacos_alojamento SET estado = 'DISPONIVEL' WHERE id = NEW.espacio_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_checkout
BEFORE UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION trigger_checkout();
```

### Procedure: Calcular Receita num Período

```sql
CREATE OR REPLACE FUNCTION calcular_receita_periodo(
    p_data_inicio DATE,
    p_data_fim DATE
) RETURNS TABLE (
    total_receitas NUMERIC,
    num_pagamentos BIGINT,
    valor_medio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(p.valor) AS total_receitas,
        COUNT(p.id) AS num_pagamentos,
        AVG(p.valor) AS valor_medio
    FROM pagamentos p
    WHERE DATE(p.instante_pagamento) BETWEEN p_data_inicio AND p_data_fim;
END;
$$ LANGUAGE plpgsql;

-- Utilização:
-- SELECT * FROM calcular_receita_periodo('2024-01-01', '2024-01-31');
```

### Procedure: Encontrar Espaços Disponíveis

```sql
CREATE OR REPLACE FUNCTION encontrar_espacos_disponiveis(
    p_especie VARCHAR,
    p_porte VARCHAR,
    p_data_inicio DATE,
    p_data_fim DATE
) RETURNS TABLE (
    id BIGINT,
    codigo VARCHAR,
    estado VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.codigo, e.estado
    FROM espacos_alojamento e
    WHERE e.especie = p_especie
      AND e.porte = p_porte
      AND e.estado = 'DISPONIVEL'
      AND e.id NOT IN (
          SELECT DISTINCT r.espacio_id 
          FROM reservas r
          WHERE r.estado IN ('CONFIRMADA', 'EM_ESTADIA')
            AND NOT (r.data_fim < p_data_inicio OR r.data_inicio > p_data_fim)
      );
END;
$$ LANGUAGE plpgsql;

-- Utilização:
-- SELECT * FROM encontrar_espacos_disponiveis('CAO', 'PEQUENO_MEDIO', '2024-05-01', '2024-05-05');
```

---

## Um-Liners Úteis para Testes

```sql
-- Contar registos em cada tabela
SELECT 'utilizadores' AS tabela, COUNT(*) FROM utilizadores
UNION ALL
SELECT 'animais', COUNT(*) FROM animais
UNION ALL
SELECT 'espacos_alojamento', COUNT(*) FROM espacos_alojamento
UNION ALL
SELECT 'servicos', COUNT(*) FROM servicos
UNION ALL
SELECT 'reservas', COUNT(*) FROM reservas
UNION ALL
SELECT 'pagamentos', COUNT(*) FROM pagamentos
UNION ALL
SELECT 'reservas_servicos', COUNT(*) FROM reservas_servicos;

-- Listar espaços com problemas de compatibilidade
SELECT DISTINCT e.codigo, e.especie, e.porte, COUNT(DISTINCT a.id) AS num_animais_incompativeis
FROM espacos_alojamento e
CROSS JOIN animais a
WHERE (e.especie != a.especie) 
   OR (e.especie = 'CAO' AND e.porte != a.porte)
GROUP BY e.id, e.codigo, e.especie, e.porte;

-- Receita acumulada por mês
SELECT 
    DATE_TRUNC('month', p.instante_pagamento)::DATE AS mes,
    SUM(p.valor) AS receita_mes
FROM pagamentos p
GROUP BY DATE_TRUNC('month', p.instante_pagamento)
ORDER BY mes DESC;
```

---

## 🔐 Segurança

### Backup
```bash
pg_dump -h localhost -p 5433 -U patudos -d patudos_db > patudos_db_backup.sql
```

### Restore
```bash
psql -h localhost -p 5433 -U patudos -d patudos_db < patudos_db_backup.sql
```

### Permissões (Exemplo)
```sql
-- Criar utilizador read-only para relatórios
CREATE ROLE relatorio_user WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE patudos_db TO relatorio_user;
GRANT USAGE ON SCHEMA public TO relatorio_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO relatorio_user;
```


