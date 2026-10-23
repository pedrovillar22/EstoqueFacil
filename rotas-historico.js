const express = require('express');
const pool = require('./db');

const router = express.Router();

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

router.get('/', exigirLoginApi, async (req, res) => {
  const tipo = (req.query.tipo || '').trim();

  if (tipo !== '' && tipo !== 'entrada' && tipo !== 'saida') {
    return res.status(400).json({ erro: 'Tipo de movimentação inválido.' });
  }

  try {
    const parametros = [req.session.usuario.empresa_id];
    let filtro = 'WHERE m.empresa_id = $1';
    if (tipo !== '') {
      parametros.push(tipo);
      filtro += ' AND m.tipo = $2';
    }

    const resultado = await pool.query(
      `SELECT m.id, m.criado_em, p.nome AS produto, p.sku, m.tipo,
              m.quantidade, m.valor_total, u.nome AS usuario, m.observacao
       FROM movimentacoes m
       JOIN produtos p ON p.id = m.produto_id
       JOIN usuarios u ON u.id = m.usuario_id
       ${filtro}
       ORDER BY m.criado_em DESC, m.id DESC
       LIMIT 100`,
      parametros
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;
