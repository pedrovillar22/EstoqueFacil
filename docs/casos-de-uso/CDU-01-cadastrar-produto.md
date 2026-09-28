# Especificação de Caso de Uso `EstoqueFácil`

# UC: `Cadastrar Produto`

## 1. Resumo

Permite que o usuário autenticado registre um novo produto no sistema, informando os dados necessários para o controle de estoque (nome, código, quantidade inicial, preço e categoria).

## 2. Atores

- **Usuário** — ator primário. Representa qualquer pessoa autenticada no sistema (gestor ou operador da loja) responsável por manter o catálogo de produtos.

## 3. Precondições

### 3.1 Usuário autenticado

O usuário deve estar autenticado no sistema (ver UC: Autenticar Usuário) para acessar a funcionalidade de cadastro de produtos.

## 4. Pós-condições

### 4.1 Produto cadastrado

O produto é registrado na base de dados do sistema, ficando disponível para consulta, movimentação de estoque e demais funcionalidades.

## 5. Pontos de Extensão

`Não aplicável a este caso de uso — não há comportamento opcional (extend) nem obrigatório (include) associado ao fluxo de cadastro.`

## 6. Fluxos de Evento

### 6.1 Fluxo Básico

1. Usuário acessa a opção "Cadastrar Produto".
2. Sistema exibe o formulário de cadastro.
3. Usuário informa os dados do produto (nome, código/SKU, categoria, quantidade inicial, preço).
4. Usuário confirma o cadastro.
5. Sistema valida os dados informados.
6. Sistema registra o produto na base de dados.
7. Sistema confirma o cadastro ao usuário.

### 6.2 Cancelar Cadastro

1. Em qualquer momento do preenchimento do formulário (passo 3 do Fluxo Básico), o usuário opta por cancelar a operação.
2. Sistema descarta os dados informados.
3. Sistema retorna à tela anterior sem registrar o produto.

### 6.3 Dados Inválidos ou Produto Duplicado

1. No passo 5 do Fluxo Básico, o sistema identifica um dado obrigatório não preenchido, um formato inválido, ou um código/SKU já existente.
2. Sistema exibe mensagem de erro específica indicando o campo ou problema encontrado.
3. Sistema mantém os dados já preenchidos no formulário.
4. Fluxo retorna ao passo 3 do Fluxo Básico para correção.

## 7. Protótipos de Interface do Caso de Uso

`A ser produzido na disciplina de Implementação e Testes.`

## 8. Diagrama de Atividades do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 9. Diagrama de Projeto do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 10. Diagrama de Sequência do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`
