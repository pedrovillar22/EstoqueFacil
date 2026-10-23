const express = require('express');
const pool = require('./db');

const router = express.Router();

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}
function exigirAdministrador(req, res, next) {
  if (req.session.usuario.perfil !== 'administrador') {
    return res.status(403).json({ erro: 'Apenas o administrador pode cadastrar produtos.' });
  }
  next();
}

router.get('/', exigirLoginApi, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nome, sku, categoria, quantidade, preco FROM produtos WHERE empresa_id = $1 ORDER BY id DESC',
      [req.session.usuario.empresa_id]
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

router.post('/', exigirLoginApi, exigirAdministrador, async (req, res) => {
  const { nome, sku, categoria, quantidade, preco } = req.body;

  const nomeLimpo = (nome || '').trim();
  const skuLimpo = (sku || '').trim();
  const categoriaLimpa = (categoria || '').trim();
  const qtd = quantidade === '' || quantidade == null ? NaN : Number(quantidade);
  const valor = preco === '' || preco == null ? NaN : Number(preco);

  if (!nomeLimpo || !skuLimpo || !categoriaLimpa) {
    return res.status(400).json({ erro: 'Preencha nome, código (SKU) e categoria.' });
  }
  if (!Number.isInteger(qtd) || qtd < 0) {
    return res.status(400).json({ erro: 'A quantidade inicial deve ser um número inteiro maior ou igual a zero.' });
  }
  if (Number.isNaN(valor) || valor < 0) {
    return res.status(400).json({ erro: 'Informe um preço válido (maior ou igual a zero).' });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const resultado = await cliente.query(
      'INSERT INTO produtos (nome, sku, categoria, quantidade, preco, empresa_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nome, sku',
      [nomeLimpo, skuLimpo, categoriaLimpa, qtd, valor, req.session.usuario.empresa_id]
    );

    const produto = resultado.rows[0];

    if (qtd > 0) {
           await cliente.query(
        'INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, observacao, empresa_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [produto.id, req.session.usuario.id, 'entrada', qtd, 'Quantidade inicial do cadastro', req.session.usuario.empresa_id]
      );
    }

    await cliente.query('COMMIT');
    res.status(201).json(produto);
  } catch (erro) {
    await cliente.query('ROLLBACK');
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Já existe um produto com esse código (SKU).' });
    }
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  } finally {
    cliente.release();
  }
});

module.exports = router;