const pool = require('./db');

async function criar() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assinatura (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      plano VARCHAR(20) NOT NULL DEFAULT 'gratuito',
      alterado_em TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`INSERT INTO assinatura (id, plano) VALUES (1, 'gratuito') ON CONFLICT (id) DO NOTHING`);
  const r = await pool.query('SELECT * FROM assinatura');
  console.log(r.rows);
  await pool.end();
}

criar().catch((e) => { console.error(e); process.exit(1); });
