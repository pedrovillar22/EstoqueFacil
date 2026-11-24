const express = require('express');
const ExcelJS = require('exceljs');
const pool = require('./db');

const router = express.Router();

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
}

async function enviarPlanilha(res, nomeArquivo, nomeAba, colunas, linhas) {
  const workbook = new ExcelJS.Workbook();
  const aba = workbook.addWorksheet(nomeAba);

  aba.columns = colunas;
  aba.addRows(linhas);

  const cabecalho = aba.getRow(1);
  cabecalho.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  cabecalho.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  aba.views = [{ state: 'frozen', ySplit: 1 }];
  aba.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: colunas.length } };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
  await workbook.xlsx.write(res);
  res.end();
}

function dataArquivo() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/produtos', exigirLoginApi, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT nome, sku, categoria, descricao, unidade_medida, codigo_barras,
              quantidade, estoque_minimo, preco
       FROM produtos
       WHERE empresa_id = $1
       ORDER BY nome`,
      [req.session.usuario.empresa_id]
    );

    const linhas = resultado.rows.map((p) => ({
      nome: p.nome,
      sku: p.sku,
      categoria: p.categoria,
      descricao: p.descricao || '',
      unidade: p.unidade_medida,
      codigo_barras: p.codigo_barras || '',
      quantidade: Number(p.quantidade),
      estoque_minimo: Number(p.estoque_minimo),
      preco: Number(p.preco),
      valor_total: Number(p.quantidade) * Number(p.preco),
    }));

    const colunas = [
      { header: 'Produto', key: 'nome', width: 30 },
      { header: 'Código (SKU)', key: 'sku', width: 16 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Descrição', key: 'descricao', width: 36 },
      { header: 'Unidade', key: 'unidade', width: 10 },
      { header: 'Código de barras', key: 'codigo_barras', width: 20 },
      { header: 'Quantidade', key: 'quantidade', width: 12 },
      { header: 'Estoque mínimo', key: 'estoque_minimo', width: 16 },
      { header: 'Preço unitário', key: 'preco', width: 16, style: { numFmt: '"R$" #,##0.00' } },
      { header: 'Preço total', key: 'valor_total', width: 16, style: { numFmt: '"R$" #,##0.00' } },
    ];

    await enviarPlanilha(res, `produtos-${dataArquivo()}.xlsx`, 'Produtos', colunas, linhas);
  } catch (erro) {
    console.error(erro);
    if (!res.headersSent) {
      res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
    }
  }
});

router.get('/historico', exigirLoginApi, async (req, res) => {
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
      `SELECT m.criado_em, p.nome AS produto, p.sku, m.tipo,
              m.quantidade, m.valor_total, u.nome AS usuario, m.observacao
       FROM movimentacoes m
       JOIN produtos p ON p.id = m.produto_id
       JOIN usuarios u ON u.id = m.usuario_id
       ${filtro}
       ORDER BY m.criado_em DESC, m.id DESC`,
      parametros
    );

    const linhas = resultado.rows.map((m) => ({
      data: formatarData(m.criado_em),
      produto: m.produto,
      sku: m.sku,
      tipo: m.tipo === 'saida' ? 'Venda' : 'Entrada',
      quantidade: Number(m.quantidade),
      valor_total: m.valor_total === null ? null : Number(m.valor_total),
      usuario: m.usuario,
      observacao: m.observacao || '',
    }));

    const colunas = [
      { header: 'Data e hora', key: 'data', width: 20 },
      { header: 'Produto', key: 'produto', width: 30 },
      { header: 'Código (SKU)', key: 'sku', width: 16 },
      { header: 'Tipo', key: 'tipo', width: 10 },
      { header: 'Quantidade', key: 'quantidade', width: 12 },
      { header: 'Valor total', key: 'valor_total', width: 16, style: { numFmt: '"R$" #,##0.00' } },
      { header: 'Usuário', key: 'usuario', width: 22 },
      { header: 'Observação', key: 'observacao', width: 36 },
    ];

    await enviarPlanilha(res, `historico-${dataArquivo()}.xlsx`, 'Histórico', colunas, linhas);
  } catch (erro) {
    console.error(erro);
    if (!res.headersSent) {
      res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
    }
  }
});

module.exports = router;
