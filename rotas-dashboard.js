const express = require('express');
const pool = require('./db');

const router = express.Router();

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

// Data de hoje no fuso de Brasília, no formato AAAA-MM-DD
function hojeBrasil() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

function dataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(texto + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

// Filtro de período (usa o dia no fuso de Brasília)
const FILTRO_PERIODO =
  "(criado_em AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN $2::date AND $3::date";
const FILTRO_PERIODO_M =
  "(m.criado_em AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN $2::date AND $3::date";

router.get('/resumo', exigirLoginApi, async (req, res) => {
  const hoje = hojeBrasil();
  const inicio = req.query.inicio || hoje.slice(0, 8) + '01';
  const fim = req.query.fim || hoje;

  if (!dataValida(inicio) || !dataValida(fim)) {
    return res.status(400).json({ erro: 'Período inválido.' });
  }
  if (inicio > fim) {
    return res.status(400).json({ erro: 'A data inicial não pode ser maior que a data final.' });
  }

  const dias =
    (new Date(fim + 'T00:00:00Z') - new Date(inicio + 'T00:00:00Z')) / 86400000;
  if (dias > 366) {
    return res.status(400).json({ erro: 'O período não pode passar de 1 ano.' });
  }

  const empresa = [req.session.usuario.empresa_id];
  const periodo = [req.session.usuario.empresa_id, inicio, fim];

  try {
    const [totais, baixo, vendasPeriodo, entradasPeriodo, maisVendidos, ultimas, vendasPorDia, paraRepor, usuarios] =
      await Promise.all([
        // Total de produtos, unidades e valor do estoque (situação atual)
        pool.query(
          `SELECT COUNT(*)::int AS total_produtos,
                  COALESCE(SUM(quantidade), 0)::int AS total_unidades,
                  COALESCE(SUM(quantidade * preco), 0) AS valor_estoque
           FROM produtos
           WHERE empresa_id = $1`,
          empresa
        ),
        // Produtos com estoque baixo (situação atual)
        pool.query(
          `SELECT COUNT(*)::int AS total
           FROM produtos
           WHERE quantidade <= estoque_minimo
             AND empresa_id = $1`,
          empresa
        ),
        // Vendas do período
        pool.query(
          `SELECT COUNT(*)::int AS qtd_vendas,
                  COALESCE(SUM(quantidade), 0)::int AS unidades_vendidas,
                  COALESCE(SUM(valor_total), 0) AS faturamento
           FROM movimentacoes
           WHERE tipo = 'saida' AND estornada_em IS NULL
             AND empresa_id = $1
             AND ${FILTRO_PERIODO}`,
          periodo
        ),
        // Entradas do período
        pool.query(
          `SELECT COUNT(*)::int AS qtd_entradas,
                  COALESCE(SUM(quantidade), 0)::int AS unidades_entrada
           FROM movimentacoes
           WHERE tipo = 'entrada' AND estornada_em IS NULL
             AND empresa_id = $1
             AND ${FILTRO_PERIODO}`,
          periodo
        ),
        // Top 5 produtos mais vendidos no período
        pool.query(
          `SELECT p.nome, SUM(m.quantidade)::int AS vendidos
           FROM movimentacoes m
           JOIN produtos p ON p.id = m.produto_id
           WHERE m.tipo = 'saida' AND m.estornada_em IS NULL
             AND m.empresa_id = $1
             AND ${FILTRO_PERIODO_M}
           GROUP BY p.id, p.nome
           ORDER BY vendidos DESC, p.nome ASC
           LIMIT 5`,
          periodo
        ),
        // Últimas 5 movimentações (sempre as mais recentes)
        pool.query(
          `SELECT m.id, m.tipo, m.quantidade, m.criado_em, m.estornada_em, p.nome AS produto
           FROM movimentacoes m
           JOIN produtos p ON p.id = m.produto_id
           WHERE m.empresa_id = $1
           ORDER BY m.criado_em DESC, m.id DESC
           LIMIT 5`,
          empresa
        ),
        // Faturamento por dia no período (dias sem venda aparecem com zero)
        pool.query(
          `SELECT to_char(d, 'YYYY-MM-DD') AS dia,
                  COALESCE(SUM(m.valor_total), 0) AS faturamento,
                  COUNT(m.id)::int AS qtd_vendas
           FROM generate_series($2::timestamp, $3::timestamp, interval '1 day') AS d
           LEFT JOIN movimentacoes m
             ON m.tipo = 'saida' AND m.estornada_em IS NULL
            AND m.empresa_id = $1
            AND (m.criado_em AT TIME ZONE 'America/Sao_Paulo')::date = d::date
           GROUP BY d
           ORDER BY d`,
          periodo
        ),
        // Produtos que precisam de reposição, os mais críticos primeiro
        pool.query(
          `SELECT nome, quantidade, estoque_minimo, unidade_medida
           FROM produtos
           WHERE empresa_id = $1
             AND quantidade <= estoque_minimo
           ORDER BY (quantidade - estoque_minimo) ASC, nome ASC
           LIMIT 5`,
          empresa
        ),
        // Quantidade de usuários da equipe (situação atual)
        pool.query(
          `SELECT COUNT(*)::int AS total
           FROM usuarios
           WHERE empresa_id = $1`,
          empresa
        )
      ]);

    res.json({
      periodo: { inicio, fim },
      produtos: totais.rows[0],
      estoque_baixo: baixo.rows[0].total,
      total_usuarios: usuarios.rows[0].total,
      vendas_mes: vendasPeriodo.rows[0],
      entradas_mes: entradasPeriodo.rows[0],
      mais_vendidos: maisVendidos.rows,
      ultimas_movimentacoes: ultimas.rows,
      vendas_por_dia: vendasPorDia.rows,
      repor: paraRepor.rows
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;