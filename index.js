require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'segredo-de-desenvolvimento',
    resave: false,
    saveUninitialized: false,
  })
);

function exigirLogin(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/login.html');
  }
  next();
}

app.get('/', (req, res) => {
  res.redirect(req.session.usuario ? '/inicio.html' : '/login.html');
});

app.get('/inicio.html', exigirLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }
  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE LOWER(email) = $1',
      [email.trim().toLowerCase()]
    );
    const usuario = resultado.rows[0];
    const senhaCorreta = usuario && (await bcrypt.compare(senha, usuario.senha_hash));
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }
    req.session.usuario = { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil };
    res.json({ nome: usuario.nome });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Não autenticado.' });
  }
  res.json(req.session.usuario);
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});