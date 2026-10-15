# Especificação de Caso de Uso `EstoqueFácil`

# UC: `Consultar Sugestão de Reposição`

## 1. Resumo

Permite que o usuário autenticado consulte a quantidade sugerida de reposição para cada produto, calculada a partir das vendas dos últimos 30 dias e do estoque mínimo, para que possa planejar a compra de mercadorias.

## 2. Atores

- **Usuário** — ator primário. Representa qualquer pessoa autenticada no sistema (administrador ou funcionário) responsável por planejar a reposição do estoque.

## 3. Precondições

### 3.1 Usuário autenticado

O usuário deve estar autenticado no sistema (ver UC: Autenticar Usuário) para acessar a funcionalidade de sugestão de reposição.

### 3.2 Produtos cadastrados e movimentações registradas

Os produtos devem estar previamente cadastrados no sistema (ver UC: Cadastrar Produto), cada um com seu estoque mínimo, cujo valor padrão é 5 unidades. As vendas realizadas (ver UC: Registrar Venda) são consideradas no cálculo.

## 4. Pós-condições

### 4.1 Lista de sugestões exibida

O sistema exibe ao usuário a lista de produtos que precisam de reposição, ordenada da maior para a menor sugestão, com nome, SKU, categoria, quantidade atual, estoque mínimo, quantidade vendida nos últimos 30 dias e quantidade sugerida para reposição.

### 4.2 Dados preservados

Por se tratar de uma consulta, nenhum dado do sistema é alterado.

## 5. Pontos de Extensão

`Não aplicável a este caso de uso — não há comportamento opcional (extend) nem obrigatório (include) associado ao fluxo de consulta de sugestão de reposição.`

## 6. Fluxos de Evento

### 6.1 Fluxo Básico

1. Usuário acessa a opção "Reposição".
2. Sistema soma, para cada produto, a quantidade vendida nos últimos 30 dias.
3. Sistema calcula a sugestão de reposição de cada produto: quantidade vendida nos últimos 30 dias + estoque mínimo - quantidade atual em estoque.
4. Sistema mantém apenas os produtos cuja sugestão é maior que zero e os ordena da maior para a menor sugestão.
5. Sistema exibe a lista com nome, SKU, categoria, quantidade atual, estoque mínimo, quantidade vendida nos últimos 30 dias e sugestão de reposição.
6. Sistema informa a quantidade de produtos com sugestão de reposição e orienta o usuário a registrar uma entrada de estoque para repor.

### 6.2 Nenhum Produto Precisa de Reposição

1. No passo 4 do Fluxo Básico, o sistema identifica que nenhum produto possui sugestão maior que zero.
2. Sistema exibe a mensagem "Nenhum produto precisa de reposição no momento."
3. Caso de uso é encerrado sem alterar o estoque.

### 6.3 Falha na Consulta

1. No passo 2 do Fluxo Básico, ocorre um erro ao consultar os produtos.
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