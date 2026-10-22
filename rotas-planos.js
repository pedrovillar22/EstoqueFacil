const express = require('express');
const pool = require('./db');

const router = express.Router();

const PLANOS = {
  gratuito:   { nome: 'Gratuito',   preco: 'R$ 0',         produtos: 10,   usuarios: 1,    filiais: 1 },
  basico:     { nome: 'Básico',     preco: 'R$ 29,90/mês', produtos: 50,   usuarios: 3,    filiais: 1 },
  pro:        { nome: 'Pro',        preco: 'R$ 79,90/mês', produtos: 300,  usuarios: 10,   filiais: 5 },
  enterprise: { nome: 'Enterprise', preco: 'Sob consulta', produtos: null, usuarios: null, filiais: null },
};

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

function exigirAdministrador(req, res, next) {
  if (req.session.usuario.perfil !== 'administrador') {
    return res.status(403).json({ erro: 'Apenas o administrador pode alterar o plano.' });
  }
  next();
}

async function lerUso() {
  const p = await pool.query('SELECT COUNT(*)::int AS total FROM produtos');
  const u = await pool.query('SELECT COUNT(*)::int AS total FROM usuarios');
  const a = await pool.query('SELECT plano FROM assinatura WHERE id = 1');
  return {
    planoAtual: a.rows.length ? a.rows[0].plano : 'gratuito',
    produtos: p.rows[0].total,
    usuarios: u.rows[0].total,
  };
}

// Lista os planos, o plano atual e o uso atual
router.get('/', exigirLoginApi, async (req, res) => {
  try {
    const uso = await lerUso();
    res.json({
      planos: PLANOS,
      planoAtual: uso.planoAtual,
      uso: { produtos: uso.produtos, usuarios: uso.usuarios },
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

// Seleciona um plano (somente administrador)
router.post('/selecionar', exigirLoginApi, exigirAdministrador, async (req, res) => {
  const escolhido = req.body.plano;
  const plano = PLANOS[escolhido];
  if (!plano) {
    return res.status(400).json({ erro: 'Plano inválido.' });
  }
  try {
    const uso = await lerUso();
    if (plano.produtos !== null && uso.produtos > plano.produtos) {
      return res.status(409).json({ erro: `Você tem ${uso.produtos} produtos e o plano ${plano.nome} permite ${plano.produtos}.` });
    }
    if (plano.usuarios !== null && uso.usuarios > plano.usuarios) {
      return res.status(409).json({ erro: `Você tem ${uso.usuarios} usuários e o plano ${plano.nome} permite ${plano.usuarios}.` });
    }
    await pool.query(
      `INSERT INTO assinatura (id, plano, alterado_em) VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET plano = $1, alterado_em = NOW()`,
      [escolhido]
    );
    res.json({ plano: escolhido, nome: plano.nome });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;