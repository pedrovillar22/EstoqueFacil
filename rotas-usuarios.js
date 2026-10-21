const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const router = express.Router();

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

function exigirAdministrador(req, res, next) {
  if (req.session.usuario.perfil !== 'administrador') {
    return res.status(403).json({ erro: 'Apenas o administrador pode cadastrar usuários.' });
  }
  next();
}

function validarDados(corpo) {
  const nome = (corpo.nome || '').trim();
  const email = (corpo.email || '').trim().toLowerCase();
  const senha = corpo.senha || '';

  if (!nome || !email || !senha) {
    return { erro: 'Preencha nome, e-mail e senha.' };
  }
  if (!EMAIL_VALIDO.test(email)) {
    return { erro: 'Informe um e-mail válido.' };
  }
  if (senha.length < 8) {
    return { erro: 'A senha deve ter pelo menos 8 caracteres.' };
  }
  return { nome, email, senha };
}

async function criarUsuario(nome, email, senha, perfil) {
  const existente = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = $1', [email]);
  if (existente.rows.length > 0) {
    return { conflito: true };
  }
  const hash = await bcrypt.hash(senha, 10);
  const resultado = await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil',
    [nome, email, hash, perfil]
  );
  return { usuario: resultado.rows[0] };
}

// Criar conta (pública): o dono do negócio vira administrador e já entra no sistema
router.post('/cadastro', async (req, res) => {
  const dados = validarDados(req.body);
  if (dados.erro) {
    return res.status(400).json({ erro: dados.erro });
  }
  try {
    const criado = await criarUsuario(dados.nome, dados.email, dados.senha, 'administrador');
    if (criado.conflito) {
      return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
    }
    req.session.usuario = {
      id: criado.usuario.id,
      nome: criado.usuario.nome,
      perfil: criado.usuario.perfil,
    };
    res.status(201).json({ nome: criado.usuario.nome });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

// Lista de usuários (somente administrador)
router.get('/', exigirLoginApi, exigirAdministrador, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nome, email, perfil, criado_em FROM usuarios ORDER BY id DESC'
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

// Cadastrar funcionário (somente administrador)
router.post('/', exigirLoginApi, exigirAdministrador, async (req, res) => {
  const dados = validarDados(req.body);
  if (dados.erro) {
    return res.status(400).json({ erro: dados.erro });
  }
  try {
    const criado = await criarUsuario(dados.nome, dados.email, dados.senha, 'funcionario');
    if (criado.conflito) {
      return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
    }
    res.status(201).json(criado.usuario);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;