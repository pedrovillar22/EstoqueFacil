const fs = require('fs');
const path = require('path');
const pool = require('./db');

const sql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Tabelas criadas');
    process.exit();
  })
  .catch((e) => {
    console.error('Erro:', e.message);
    process.exit(1);
  });