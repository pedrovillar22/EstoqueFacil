const pool = require('./db');

async function migrar() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        criado_em TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Empresa 1 = tudo que já existe hoje (contas de teste, produtos, etc.)
    await client.query(`
      INSERT INTO empresas (id, nome)
      SELECT 1, 'Empresa Demonstração'
      WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE id = 1)
    `);
    await client.query(`
      SELECT setval(pg_get_serial_sequence('empresas', 'id'),
                    GREATEST((SELECT MAX(id) FROM empresas), 1))
    `);

    // Liga usuários, produtos e movimentações a uma empresa
    for (const tabela of ['usuarios', 'produtos', 'movimentacoes']) {
      await client.query(`ALTER TABLE ${tabela} ADD COLUMN IF NOT EXISTS empresa_id INTEGER REFERENCES empresas(id)`);
      await client.query(`UPDATE ${tabela} SET empresa_id = 1 WHERE empresa_id IS NULL`);
      await client.query(`ALTER TABLE ${tabela} ALTER COLUMN empresa_id SET NOT NULL`);
    }

    // SKU passa a ser único dentro de cada empresa
    await client.query(`ALTER TABLE produtos DROP CONSTRAINT IF EXISTS produtos_sku_key`);
    await client.query(`ALTER TABLE produtos DROP CONSTRAINT IF EXISTS produtos_empresa_sku_key`);
    await client.query(`ALTER TABLE produtos ADD CONSTRAINT produtos_empresa_sku_key UNIQUE (empresa_id, sku)`);

    // Assinatura passa a ser uma por empresa
    await client.query(`ALTER TABLE assinatura ADD COLUMN IF NOT EXISTS empresa_id INTEGER REFERENCES empresas(id)`);
    await client.query(`UPDATE assinatura SET empresa_id = 1 WHERE empresa_id IS NULL`);
    await client.query(`ALTER TABLE assinatura ALTER COLUMN empresa_id SET NOT NULL`);
    await client.query(`ALTER TABLE assinatura DROP CONSTRAINT IF EXISTS assinatura_id_check`);
    await client.query(`ALTER TABLE assinatura DROP CONSTRAINT IF EXISTS assinatura_pkey`);
    await client.query(`ALTER TABLE assinatura DROP COLUMN IF EXISTS id`);
    await client.query(`ALTER TABLE assinatura ADD PRIMARY KEY (empresa_id)`);

    await client.query('COMMIT');

    const r = await client.query('SELECT * FROM empresas');
    console.log('Empresas:', r.rows);
    const a = await client.query('SELECT * FROM assinatura');
    console.log('Assinaturas:', a.rows);
    const u = await client.query('SELECT id, email, perfil, empresa_id FROM usuarios');
    console.log('Usuários:', u.rows);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Erro, nada foi alterado:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrar();