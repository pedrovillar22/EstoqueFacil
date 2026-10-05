const express = require('express');
const pool = require('./db');

const router = express.Router();

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

router.post('/', exigirLoginApi, async (req, res) => {
  const { produto_id, quantidade } = req.body;

  const idProduto = Number(produto_id);
  const qtd = quantidade === '' || quantidade == null ? NaN : Number(quantidade);

  if (!Number.isInteger(idProduto) || idProduto <= 0) {
    return res.status(400).json({ erro: 'Selecione um produto.' });
  }
  if (!Number.isInteger(qtd) || qtd <= 0) {
    return res.status(400).json({ erro: 'A quantidade deve ser um número inteiro maior que zero.' });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const produto = await cliente.query(
      'SELECT id, nome, quantidade, preco FROM produtos WHERE id = $1 FOR UPDATE',
      [idProduto]
    );

    if (produto.rows.length === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    const { nome, quantidade: disponivel, preco } = produto.rows[0];

    if (qtd > disponivel) {
      await cliente.query('ROLLBACK');
      return res.status(409).json({ erro: 'Estoque insuficiente. Quantidade disponível: ' + disponivel + '.' });
    }

    const valorTotal = Number((qtd * Number(preco)).toFixed(2));

    const atualizado = await cliente.query(
      'UPDATE produtos SET quantidade = quantidade - $1 WHERE id = $2 RETURNING quantidade',
      [qtd, idProduto]
    );

    await cliente.query(
      'INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, valor_total) VALUES ($1, $2, $3, $4, $5)',
      [idProduto, req.session.usuario.id, 'saida', qtd, valorTotal]
    );

    await cliente.query('COMMIT');
    res.status(201).json({ nome, quantidade: atualizado.rows[0].quantidade, valor_total: valorTotal });
  } catch (erro) {
    await cliente.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  } finally {
    cliente.release();
  }
});

module.exports = router;