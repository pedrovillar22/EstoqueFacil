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

// Criar conta (pública): cria uma empresa nova e o dono vira administrador dela
router.post('/cadastro', async (req, res) => {
  const dados = validarDados(req.body);
  if (dados.erro) {
    return res.status(400).json({ erro: dados.erro });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const existente = await cliente.query(
      'SELECT id FROM usuarios WHERE LOWER(email) = $1',
      [dados.email]
    );
    if (existente.rows.length > 0) {
      await cliente.query('ROLLBACK');
      return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
    }

    const empresa = await cliente.query(
      'INSERT INTO empresas (nome) VALUES ($1) RETURNING id',
      ['Empresa de ' + dados.nome]
    );
    const empresaId = empresa.rows[0].id;

    await cliente.query(
      "INSERT INTO assinatura (empresa_id, plano) VALUES ($1, 'gratuito')",
      [empresaId]
    );

    const hash = await bcrypt.hash(dados.senha, 10);
    const usuario = await cliente.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil, empresa_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, perfil, empresa_id',
      [dados.nome, dados.email, hash, 'administrador', empresaId]
    );

    await cliente.query('COMMIT');

    const criado = usuario.rows[0];
    req.session.usuario = {
      id: criado.id,
      nome: criado.nome,
      perfil: criado.perfil,
      empresa_id: criado.empresa_id,
    };
    res.status(201).json({ nome: criado.nome });
  } catch (erro) {
    await cliente.query('ROLLBACK');
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
    }
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  } finally {
    cliente.release();
  }
});

// Lista de usuários da própria empresa (somente administrador)
router.get('/', exigirLoginApi, exigirAdministrador, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nome, email, perfil, criado_em FROM usuarios WHERE empresa_id = $1 ORDER BY id DESC',
      [req.session.usuario.empresa_id]
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

// Cadastrar funcionário na própria empresa (somente administrador)
router.post('/', exigirLoginApi, exigirAdministrador, async (req, res) => {
  const dados = validarDados(req.body);
  if (dados.erro) {
    return res.status(400).json({ erro: dados.erro });
  }
  try {
    const existente = await pool.query(
      'SELECT id FROM usuarios WHERE LOWER(email) = $1',
      [dados.email]
    );
    if (existente.rows.length > 0) {
      return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
    }
    const hash = await bcrypt.hash(dados.senha, 10);
    const resultado = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil, empresa_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, perfil',
      [dados.nome, dados.email, hash, 'funcionario', req.session.usuario.empresa_id]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
    }
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;