const pool = require('./db');

async function criar() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS empresas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      criado_em TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    INSERT INTO empresas (id, nome)
    SELECT 1, 'Empresa Demonstração'
    WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE id = 1)
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assinatura (
      empresa_id INTEGER PRIMARY KEY REFERENCES empresas(id),
      plano VARCHAR(20) NOT NULL DEFAULT 'gratuito',
      alterado_em TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    INSERT INTO assinatura (empresa_id, plano) VALUES (1, 'gratuito')
    ON CONFLICT (empresa_id) DO NOTHING
  `);
  const r = await pool.query('SELECT * FROM assinatura');
  console.log(r.rows);
  await pool.end();
}

criar().catch((e) => { console.error(e); process.exit(1); });