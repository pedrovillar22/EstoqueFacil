# Especificação de Caso de Uso `EstoqueFácil`

# UC: `Visualizar Dashboard`

## 1. Resumo

Permite que o usuário autenticado visualize, em uma única tela, um resumo da situação do estoque e das vendas, com indicadores gerais, os produtos mais vendidos e as últimas movimentações, para que possa acompanhar o negócio e tomar decisões rapidamente.

## 2. Atores

- **Usuário** — ator primário. Representa qualquer pessoa autenticada no sistema (administrador ou funcionário) que deseja acompanhar a situação geral do estoque e das vendas.

## 3. Precondições

### 3.1 Usuário autenticado

O usuário deve estar autenticado no sistema (ver UC: Autenticar Usuário) para acessar o dashboard.

### 3.2 Produtos cadastrados e movimentações registradas

Os produtos devem estar previamente cadastrados no sistema (ver UC: Cadastrar Produto). As entradas de estoque (ver UC: Registrar Entrada de Estoque) e as vendas (ver UC: Registrar Venda) registradas são consideradas nos indicadores.

## 4. Pós-condições

### 4.1 Dashboard exibido

O sistema exibe ao usuário os seguintes indicadores: total de produtos cadastrados, total de unidades em estoque, valor total do estoque, quantidade de produtos com estoque baixo, quantidade de vendas, faturamento e quantidade de entradas de estoque no mês atual, os 5 produtos mais vendidos nos últimos 30 dias e as 5 últimas movimentações.

### 4.2 Dados preservados

Por se tratar de uma consulta, nenhum dado do sistema é alterado.

## 5. Pontos de Extensão

`Não aplicável a este caso de uso — não há comportamento opcional (extend) nem obrigatório (include) associado ao fluxo de visualização do dashboard.`

## 6. Fluxos de Evento

### 6.1 Fluxo Básico

1. Usuário acessa a opção "Dashboard".
2. Sistema calcula o total de produtos cadastrados, o total de unidades em estoque e o valor total do estoque (quantidade multiplicada pelo preço de cada produto).
3. Sistema conta os produtos com estoque baixo, ou seja, com quantidade menor ou igual ao estoque mínimo.
4. Sistema calcula, para o mês atual, a quantidade de vendas, o faturamento e a quantidade de entradas de estoque.
5. Sistema identifica os 5 produtos mais vendidos nos últimos 30 dias, ordenados da maior para a menor quantidade vendida.
6. Sistema obtém as 5 últimas movimentações (entradas e vendas), da mais recente para a mais antiga.
7. Sistema exibe os indicadores em cartões e apresenta os produtos mais vendidos e as últimas movimentações em tabelas.

### 6.2 Sem Movimentações Registradas

1. Nos passos 5 e 6 do Fluxo Básico, o sistema identifica que não há vendas nos últimos 30 dias ou que não há movimentações registradas.
2. Sistema exibe a mensagem "Nenhum registro ainda." na tabela correspondente e mantém os demais indicadores.
3. Caso de uso é encerrado sem alterar o estoque.

### 6.3 Falha na Consulta

1. Em qualquer passo do cálculo dos indicadores (passos 2 a 6 do Fluxo Básico), ocorre um erro ao consultar os dados.
2. Sistema exibe mensagem de erro informando que houve um problema no servidor e que o usuário deve tentar novamente.
3. Caso de uso é encerrado sem alterar o estoque.

## 7. Protótipos de Interface do Caso de Uso

`A ser produzido na disciplina de Implementação e Testes.`

## 8. Diagrama de Atividades do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 9. Diagrama de Projeto do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 10. Diagrama de Sequência do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`