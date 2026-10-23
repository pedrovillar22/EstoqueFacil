const express = require('express');
const pool = require('./db');

const router = express.Router();

function exigirLoginApi(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  next();
}

router.get('/resumo', exigirLoginApi, async (req, res) => {
  const empresa = [req.session.usuario.empresa_id];
  try {
    const [totais, baixo, vendasMes, entradasMes, maisVendidos, ultimas] =
      await Promise.all([
        // Total de produtos, unidades e valor do estoque
        pool.query(
          `SELECT COUNT(*)::int AS total_produtos,
                  COALESCE(SUM(quantidade), 0)::int AS total_unidades,
                  COALESCE(SUM(quantidade * preco), 0) AS valor_estoque
           FROM produtos
           WHERE empresa_id = $1`,
          empresa
        ),
        // Produtos com estoque baixo (mesma regra do alerta)
        pool.query(
          `SELECT COUNT(*)::int AS total
           FROM produtos
           WHERE quantidade <= estoque_minimo
             AND empresa_id = $1`,
          empresa
        ),
        // Vendas do mês atual
        pool.query(
          `SELECT COUNT(*)::int AS qtd_vendas,
                  COALESCE(SUM(quantidade), 0)::int AS unidades_vendidas,
                  COALESCE(SUM(valor_total), 0) AS faturamento
           FROM movimentacoes
           WHERE tipo = 'saida'
             AND empresa_id = $1
             AND criado_em >= date_trunc('month', NOW())`,
          empresa
        ),
        // Entradas do mês atual
        pool.query(
          `SELECT COUNT(*)::int AS qtd_entradas,
                  COALESCE(SUM(quantidade), 0)::int AS unidades_entrada
           FROM movimentacoes
           WHERE tipo = 'entrada'
             AND empresa_id = $1
             AND criado_em >= date_trunc('month', NOW())`,
          empresa
        ),
        // Top 5 produtos mais vendidos (últimos 30 dias)
        pool.query(
          `SELECT p.nome, SUM(m.quantidade)::int AS vendidos
           FROM movimentacoes m
           JOIN produtos p ON p.id = m.produto_id
           WHERE m.tipo = 'saida'
             AND m.empresa_id = $1
             AND m.criado_em >= NOW() - INTERVAL '30 days'
           GROUP BY p.id, p.nome
           ORDER BY vendidos DESC, p.nome ASC
           LIMIT 5`,
          empresa
        ),
        // Últimas 5 movimentações
        pool.query(
          `SELECT m.id, m.tipo, m.quantidade, m.criado_em, p.nome AS produto
           FROM movimentacoes m
           JOIN produtos p ON p.id = m.produto_id
           WHERE m.empresa_id = $1
           ORDER BY m.criado_em DESC, m.id DESC
           LIMIT 5`,
          empresa
        )
      ]);

    res.json({
      produtos: totais.rows[0],
      estoque_baixo: baixo.rows[0].total,
      vendas_mes: vendasMes.rows[0],
      entradas_mes: entradasMes.rows[0],
      mais_vendidos: maisVendidos.rows,
      ultimas_movimentacoes: ultimas.rows
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;