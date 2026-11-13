const express = require('express');
const pool = require('./db');
const { PLANOS, lerUso } = require('./rotas-planos');

const router = express.Router();

const UNIDADES_VALIDAS = ['un', 'kg', 'g', 'L', 'ml', 'caixa', 'pacote', 'm'];

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

function exigirAdministrador(req, res, next) {
  if (req.session.usuario.perfil !== 'administrador') {
    return res.status(403).json({ erro: 'Apenas o administrador possui permissão para editar produtos.' });
  }
  next();
}

// O administrador sempre pode cadastrar; o funcionário só se o administrador o liberou.
// A consulta ao banco garante que uma mudança de permissão valha imediatamente.
async function lerPermissaoCadastro(req) {
  const usuario = req.session.usuario;
  if (usuario.perfil === 'administrador') return true;

  const resultado = await pool.query(
    'SELECT pode_cadastrar_produtos FROM usuarios WHERE id = $1 AND empresa_id = $2',
    [usuario.id, usuario.empresa_id]
  );
  return resultado.rows.length > 0 && resultado.rows[0].pode_cadastrar_produtos === true;
}

async function exigirPermissaoCadastro(req, res, next) {
  try {
    if (await lerPermissaoCadastro(req)) return next();
    return res.status(403).json({ erro: 'Você não possui permissão para cadastrar produtos. Solicite a liberação ao administrador.' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
}

router.get('/permissao', exigirLoginApi, async (req, res) => {
  try {
    res.json({
      administrador: req.session.usuario.perfil === 'administrador',
      pode_cadastrar: await lerPermissaoCadastro(req),
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

router.get('/', exigirLoginApi, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, sku, categoria, descricao, quantidade, preco,
              estoque_minimo, unidade_medida, codigo_barras
       FROM produtos
       WHERE empresa_id = $1
       ORDER BY id DESC`,
      [req.session.usuario.empresa_id]
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

router.post('/', exigirLoginApi, exigirPermissaoCadastro, async (req, res) => {
  const { nome, sku, categoria, descricao, quantidade, preco, estoque_minimo, unidade_medida, codigo_barras } = req.body;

  const nomeLimpo = (nome || '').trim();
  const skuLimpo = (sku || '').trim();
  const categoriaLimpa = (categoria || '').trim();
  const descricaoLimpa = (descricao || '').trim();
  const codigoBarrasLimpo = (codigo_barras || '').trim() || null;
  const unidade = (unidade_medida || 'un').trim();
  const qtd = quantidade === '' || quantidade == null ? NaN : Number(quantidade);
  const valor = preco === '' || preco == null ? NaN : Number(preco);
  const minimo = estoque_minimo === '' || estoque_minimo == null ? 5 : Number(estoque_minimo);

  if (!nomeLimpo || !skuLimpo || !categoriaLimpa) {
    return res.status(400).json({ erro: 'Preencha os campos obrigatórios: nome do produto, código (SKU) e categoria.' });
  }
  if (!Number.isInteger(qtd) || qtd < 0) {
    return res.status(400).json({ erro: 'O estoque inicial deve ser um número inteiro maior ou igual a zero.' });
  }
  if (Number.isNaN(valor) || valor < 0) {
    return res.status(400).json({ erro: 'Informe um preço válido (maior ou igual a zero).' });
  }
  if (!Number.isInteger(minimo) || minimo < 0) {
    return res.status(400).json({ erro: 'O estoque mínimo deve ser um número inteiro maior ou igual a zero.' });
  }
  if (!UNIDADES_VALIDAS.includes(unidade)) {
    return res.status(400).json({ erro: 'Selecione uma unidade de medida válida.' });
  }
  if (codigoBarrasLimpo && codigoBarrasLimpo.length > 50) {
    return res.status(400).json({ erro: 'O código de barras deve ter no máximo 50 caracteres.' });
  }

  try {
    const uso = await lerUso(req.session.usuario.empresa_id);
    const plano = PLANOS[uso.planoAtual];
    if (plano.produtos !== null && uso.produtos >= plano.produtos) {
      return res.status(403).json({ erro: `Limite do plano ${plano.nome} atingido (${plano.produtos} produtos). Faça upgrade para cadastrar mais.` });
    }
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const resultado = await cliente.query(
      `INSERT INTO produtos (nome, sku, categoria, descricao, quantidade, preco, estoque_minimo, unidade_medida, codigo_barras, empresa_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, nome, sku`,
      [nomeLimpo, skuLimpo, categoriaLimpa, descricaoLimpa, qtd, valor, minimo, unidade, codigoBarrasLimpo, req.session.usuario.empresa_id]
    );

    const produto = resultado.rows[0];

    if (qtd > 0) {
      await cliente.query(
        'INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, observacao, empresa_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [produto.id, req.session.usuario.id, 'entrada', qtd, 'Estoque inicial do cadastro', req.session.usuario.empresa_id]
      );
    }

    await cliente.query('COMMIT');
    res.status(201).json(produto);
  } catch (erro) {
    await cliente.query('ROLLBACK');
    if (erro.code === '23505') {
      if (erro.constraint === 'produtos_empresa_codigo_barras_key') {
        return res.status(409).json({ erro: 'Já existe um produto cadastrado com esse código de barras.' });
      }
      return res.status(409).json({ erro: 'Já existe um produto cadastrado com esse código (SKU).' });
    }
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  } finally {
    cliente.release();
  }
});

router.put('/:id', exigirLoginApi, exigirAdministrador, async (req, res) => {
  const id = Number(req.params.id);
  const { estoque_minimo, unidade_medida, codigo_barras } = req.body;

  const unidade = (unidade_medida || '').trim();
  const codigoBarrasLimpo = (codigo_barras || '').trim() || null;
  const minimo = estoque_minimo === '' || estoque_minimo == null ? NaN : Number(estoque_minimo);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'Produto inválido.' });
  }
  if (!Number.isInteger(minimo) || minimo < 0) {
    return res.status(400).json({ erro: 'O estoque mínimo deve ser um número inteiro maior ou igual a zero.' });
  }
  if (!UNIDADES_VALIDAS.includes(unidade)) {
    return res.status(400).json({ erro: 'Selecione uma unidade de medida válida.' });
  }
  if (codigoBarrasLimpo && codigoBarrasLimpo.length > 50) {
    return res.status(400).json({ erro: 'O código de barras deve ter no máximo 50 caracteres.' });
  }

  try {
    const resultado = await pool.query(
      `UPDATE produtos
       SET estoque_minimo = $1, unidade_medida = $2, codigo_barras = $3
       WHERE id = $4 AND empresa_id = $5
       RETURNING id, nome`,
      [minimo, unidade, codigoBarrasLimpo, id, req.session.usuario.empresa_id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Já existe um produto cadastrado com esse código de barras.' });
    }
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;