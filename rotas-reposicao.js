const express = require('express');
const pool = require('./db');

const router = express.Router();

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

router.get('/sugestao', exigirLoginApi, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT p.id, p.nome, p.sku, p.categoria, p.quantidade, p.estoque_minimo,
              COALESCE(SUM(m.quantidade), 0)::int AS vendido_30_dias,
              GREATEST(COALESCE(SUM(m.quantidade), 0) + p.estoque_minimo - p.quantidade, 0)::int AS sugestao
       FROM produtos p
       LEFT JOIN movimentacoes m
         ON m.produto_id = p.id
        AND m.tipo = 'saida'
        AND m.criado_em >= NOW() - INTERVAL '30 days'
       WHERE p.empresa_id = $1
       GROUP BY p.id
       HAVING GREATEST(COALESCE(SUM(m.quantidade), 0) + p.estoque_minimo - p.quantidade, 0) > 0
       ORDER BY sugestao DESC, p.nome ASC`,
      [req.session.usuario.empresa_id]
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;