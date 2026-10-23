const express = require('express');
const pool = require('./db');

const router = express.Router();

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

router.post('/entrada', exigirLoginApi, async (req, res) => {
  const { produto_id, quantidade, observacao } = req.body;

  const idProduto = Number(produto_id);
  const qtd = quantidade === '' || quantidade == null ? NaN : Number(quantidade);
  const obs = (observacao || '').trim() || null;

  if (!Number.isInteger(idProduto) || idProduto <= 0) {
    return res.status(400).json({ erro: 'Selecione um produto.' });
  }
  if (!Number.isInteger(qtd) || qtd <= 0) {
    return res.status(400).json({ erro: 'A quantidade deve ser um número inteiro maior que zero.' });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

     const atualizado = await cliente.query(
      'UPDATE produtos SET quantidade = quantidade + $1 WHERE id = $2 AND empresa_id = $3 RETURNING id, nome, quantidade',
      [qtd, idProduto, req.session.usuario.empresa_id]
    );

    if (atualizado.rows.length === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    await cliente.query(
      'INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, observacao, empresa_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [idProduto, req.session.usuario.id, 'entrada', qtd, obs, req.session.usuario.empresa_id]
    );
    
    await cliente.query('COMMIT');
    res.status(201).json(atualizado.rows[0]);
  } catch (erro) {
    await cliente.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  } finally {
    cliente.release();
  }
});

module.exports = router;