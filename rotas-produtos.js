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
      'SELECT id, nome, sku, categoria, quantidade, preco FROM produtos ORDER BY id DESC'
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

  try {
    const resultado = await pool.query(
      'INSERT INTO produtos (nome, sku, categoria, quantidade, preco) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, sku',
      [nomeLimpo, skuLimpo, categoriaLimpa, qtd, valor]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Já existe um produto com esse código (SKU).' });
    }
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;