const express = require('express');
const pool = require('./db');

const router = express.Router();

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

router.get('/baixo', exigirLoginApi, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, sku, categoria, quantidade, estoque_minimo,
              (estoque_minimo - quantidade) AS faltam
       FROM produtos
       WHERE quantidade <= estoque_minimo AND empresa_id = $1
       ORDER BY quantidade ASC, nome ASC`,
      [req.session.usuario.empresa_id]
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;