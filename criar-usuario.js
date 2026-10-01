const bcrypt = require('bcryptjs');
const pool = require('./db');

const [nome, email, senha, perfil = 'administrador'] = process.argv.slice(2);

if (!nome || !email || !senha) {
  console.log('Uso: node criar-usuario.js "Nome" email senha [perfil]');
  process.exit(1);
}

bcrypt.hash(senha, 10)
  .then((hash) =>
    pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4)',
      [nome, email, hash, perfil]
    )
  )
  .then(() => {
    console.log('Usuário criado:', email);
    process.exit();
  })
  .catch((e) => {
    console.error('Erro:', e.message);
    process.exit(1);
  });