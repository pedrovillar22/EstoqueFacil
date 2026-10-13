# Especificação de Caso de Uso `EstoqueFácil`

# UC: `Consultar Alerta de Estoque Baixo`

## 1. Resumo

Permite que o usuário autenticado consulte a lista de produtos cuja quantidade em estoque está igual ou abaixo do estoque mínimo definido, para que possa identificar quais produtos precisam de reposição.

## 2. Atores

- **Usuário** — ator primário. Representa qualquer pessoa autenticada no sistema (administrador ou funcionário) responsável por acompanhar os níveis de estoque.

## 3. Precondições

### 3.1 Usuário autenticado

O usuário deve estar autenticado no sistema (ver UC: Autenticar Usuário) para acessar a funcionalidade de alerta de estoque baixo.

### 3.2 Produtos cadastrados com estoque mínimo definido

Os produtos devem estar previamente cadastrados no sistema (ver UC: Cadastrar Produto). Cada produto possui um estoque mínimo, cujo valor padrão é 5 unidades.

## 4. Pós-condições

### 4.1 Lista de alertas exibida

O sistema exibe ao usuário a lista de produtos com estoque baixo, ordenada do menor para o maior estoque, com nome, SKU, categoria, quantidade atual, estoque mínimo e quantidade que falta para atingir o mínimo.

### 4.2 Dados preservados

Por se tratar de uma consulta, nenhum dado do sistema é alterado.

## 5. Pontos de Extensão

`Não aplicável a este caso de uso — não há comportamento opcional (extend) nem obrigatório (include) associado ao fluxo de consulta de alerta de estoque baixo.`

## 6. Fluxos de Evento

### 6.1 Fluxo Básico

1. Usuário acessa a opção "Alertas".
2. Sistema consulta os produtos cuja quantidade em estoque é menor ou igual ao estoque mínimo.
3. Sistema ordena os produtos do menor para o maior estoque.
4. Sistema exibe a lista com nome, SKU, categoria, quantidade atual, estoque mínimo e quantidade que falta para atingir o mínimo.
5. Sistema informa a quantidade de produtos com estoque baixo e orienta o usuário a registrar uma entrada de estoque para repor.

### 6.2 Nenhum Produto com Estoque Baixo

1. No passo 2 do Fluxo Básico, o sistema identifica que nenhum produto está com quantidade igual ou abaixo do estoque mínimo.
2. Sistema exibe a mensagem "Nenhum produto com estoque baixo no momento."
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
