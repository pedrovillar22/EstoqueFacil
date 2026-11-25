const express = require('express');
const pool = require('./db');

const router = express.Router();

// Cria as colunas de estorno sozinho quando o servidor liga
const colunasProntas = pool
  .query(
    `ALTER TABLE movimentacoes
       ADD COLUMN IF NOT EXISTS estornada_em TIMESTAMP,
       ADD COLUMN IF NOT EXISTS estornada_por INTEGER REFERENCES usuarios(id)`
  )
  .catch((erro) => console.error('Erro ao criar colunas de estorno:', erro));

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

router.post('/:id', exigirLoginApi, async (req, res) => {
  const id = Number(req.params.id);
  const empresa = req.session.usuario.empresa_id;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'Movimentação inválida.' });
  }

  await colunasProntas;

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const mov = await cliente.query(
      'SELECT id, produto_id, tipo, quantidade, estornada_em FROM movimentacoes WHERE id = $1 AND empresa_id = $2 FOR UPDATE',
      [id, empresa]
    );

    if (mov.rows.length === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ erro: 'Movimentação não encontrada.' });
    }

    const m = mov.rows[0];

    if (m.estornada_em) {
      await cliente.query('ROLLBACK');
      return res.status(409).json({ erro: 'Esta movimentação já foi estornada.' });
    }

    const produto = await cliente.query(
      'SELECT id, nome, quantidade FROM produtos WHERE id = $1 AND empresa_id = $2 FOR UPDATE',
      [m.produto_id, empresa]
    );

    const { nome, quantidade: atual } = produto.rows[0];

    if (m.tipo === 'entrada' && atual < m.quantidade) {
      await cliente.query('ROLLBACK');
      return res.status(409).json({
        erro: `Não é possível estornar: o estoque atual (${atual}) é menor que a quantidade desta entrada (${m.quantidade}).`,
      });
    }

    const ajuste = m.tipo === 'saida' ? m.quantidade : -m.quantidade;

    await cliente.query('UPDATE produtos SET quantidade = quantidade + $1 WHERE id = $2', [ajuste, m.produto_id]);
    await cliente.query(
      'UPDATE movimentacoes SET estornada_em = NOW(), estornada_por = $1 WHERE id = $2',
      [req.session.usuario.id, id]
    );

    await cliente.query('COMMIT');
    res.json({ produto: nome, quantidade: atual + ajuste });
  } catch (erro) {
    await cliente.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  } finally {
    cliente.release();
  }
});

module.exports = router;
