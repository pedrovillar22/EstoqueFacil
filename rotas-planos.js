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

async function lerUso(empresaId) {
  const p = await pool.query('SELECT COUNT(*)::int AS total FROM produtos WHERE empresa_id = $1', [empresaId]);
  const u = await pool.query('SELECT COUNT(*)::int AS total FROM usuarios WHERE empresa_id = $1', [empresaId]);
  const a = await pool.query('SELECT plano FROM assinatura WHERE empresa_id = $1', [empresaId]);
  return {
    planoAtual: a.rows.length ? a.rows[0].plano : 'gratuito',
    produtos: p.rows[0].total,
    usuarios: u.rows[0].total,
  };
}

// Lista os planos, o plano atual e o uso atual da empresa
router.get('/', exigirLoginApi, async (req, res) => {
  try {
    const uso = await lerUso(req.session.usuario.empresa_id);
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

const PLANOS_PAGOS = ['basico', 'pro'];

// Pagamento simulado (API fake): nenhuma cobrança real é feita
router.post('/pagamento/iniciar', exigirLoginApi, exigirAdministrador, async (req, res) => {
  const escolhido = req.body.plano;
  if (!PLANOS_PAGOS.includes(escolhido)) {
    return res.status(400).json({ erro: 'Este plano não exige pagamento.' });
  }
  try {
    const uso = await lerUso(req.session.usuario.empresa_id);
    const plano = PLANOS[escolhido];
    if (plano.produtos !== null && uso.produtos > plano.produtos) {
      return res.status(409).json({ erro: `Você tem ${uso.produtos} produtos e o plano ${plano.nome} permite ${plano.produtos}.` });
    }
    if (plano.usuarios !== null && uso.usuarios > plano.usuarios) {
      return res.status(409).json({ erro: `Você tem ${uso.usuarios} usuários e o plano ${plano.nome} permite ${plano.usuarios}.` });
    }
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
  const codigo = 'SIM' + Date.now().toString(36).toUpperCase();
  req.session.pagamento = { plano: escolhido, codigo: codigo, confirmado: false };
  res.json({
    codigo: codigo,
    plano: escolhido,
    nome: PLANOS[escolhido].nome,
    valor: PLANOS[escolhido].preco,
    qr: 'ESTOQUEFACIL-PAGAMENTO-SIMULADO-' + codigo,
  });
});

router.post('/pagamento/confirmar', exigirLoginApi, exigirAdministrador, (req, res) => {
  const pag = req.session.pagamento;
  if (!pag || pag.codigo !== req.body.codigo) {
    return res.status(400).json({ erro: 'Pagamento não encontrado. Inicie novamente.' });
  }
  pag.confirmado = true;
  req.session.pagamento = pag;
  res.json({ confirmado: true });
});

// Seleciona um plano para a empresa (somente administrador)
router.post('/selecionar', exigirLoginApi, exigirAdministrador, async (req, res) => {
  const escolhido = req.body.plano;
  const plano = PLANOS[escolhido];
  if (!plano) {
    return res.status(400).json({ erro: 'Plano inválido.' });
  }
  try {
    const uso = await lerUso(req.session.usuario.empresa_id);
    if (plano.produtos !== null && uso.produtos > plano.produtos) {
      return res.status(409).json({ erro: `Você tem ${uso.produtos} produtos e o plano ${plano.nome} permite ${plano.produtos}.` });
    }
    if (plano.usuarios !== null && uso.usuarios > plano.usuarios) {
      return res.status(409).json({ erro: `Você tem ${uso.usuarios} usuários e o plano ${plano.nome} permite ${plano.usuarios}.` });
    }
    if (PLANOS_PAGOS.includes(escolhido)) {
      const pag = req.session.pagamento;
      if (!pag || pag.plano !== escolhido || !pag.confirmado) {
        return res.status(402).json({ erro: 'Pagamento não confirmado para este plano.' });
      }
    }
    await pool.query(
      `INSERT INTO assinatura (empresa_id, plano, alterado_em) VALUES ($2, $1, NOW())
       ON CONFLICT (empresa_id) DO UPDATE SET plano = $1, alterado_em = NOW()`,
      [escolhido, req.session.usuario.empresa_id]
    );
    delete req.session.pagamento;
    res.json({ plano: escolhido, nome: plano.nome });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

router.PLANOS = PLANOS;
router.lerUso = lerUso;

module.exports = router;