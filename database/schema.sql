CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL DEFAULT 'funcionario',
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  categoria VARCHAR(100) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  observacao VARCHAR(255),
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);