# Especificação de Caso de Uso `EstoqueFácil`

# UC: `Registrar Venda`

## 1. Resumo

Permite que o usuário autenticado registre a venda de um produto cadastrado, reduzindo a quantidade disponível em estoque e registrando a movimentação para consulta posterior.

## 2. Atores

- **Usuário** — ator primário. Representa qualquer pessoa autenticada no sistema (administrador ou funcionário) responsável por registrar as vendas realizadas.

## 3. Precondições

### 3.1 Usuário autenticado

O usuário deve estar autenticado no sistema (ver UC: Autenticar Usuário) para acessar a funcionalidade de registro de venda.

### 3.2 Produto cadastrado com estoque disponível

O produto vendido deve estar previamente cadastrado no sistema (ver UC: Cadastrar Produto) e possuir quantidade em estoque suficiente para a venda.

## 4. Pós-condições

### 4.1 Estoque atualizado

A quantidade em estoque do produto é reduzida pela quantidade vendida.

### 4.2 Movimentação registrada

A venda fica registrada como uma movimentação de saída de estoque, com produto, quantidade, valor total, usuário responsável e data e hora, ficando disponível para o histórico de movimentações.

## 5. Pontos de Extensão

`Não aplicável a este caso de uso — não há comportamento opcional (extend) nem obrigatório (include) associado ao fluxo de registro de venda.`

## 6. Fluxos de Evento

### 6.1 Fluxo Básico

1. Usuário acessa a opção "Registrar Venda".
2. Sistema exibe o formulário com a lista de produtos cadastrados e suas quantidades disponíveis.
3. Usuário seleciona o produto e informa a quantidade vendida.
4. Usuário confirma o registro.
5. Sistema valida os dados informados.
6. Sistema verifica se há estoque suficiente para a quantidade vendida.
7. Sistema subtrai a quantidade vendida do estoque do produto.
8. Sistema registra a movimentação de saída (produto, quantidade, valor total, usuário, data e hora).
9. Sistema confirma o registro ao usuário, exibindo o valor total da venda e a nova quantidade em estoque.

### 6.2 Cancelar Registro

1. Em qualquer momento do preenchimento do formulário (passo 3 do Fluxo Básico), o usuário opta por cancelar a operação.
2. Sistema descarta os dados informados.
3. Sistema retorna à tela anterior sem alterar o estoque.

### 6.3 Dados Inválidos

1. No passo 5 do Fluxo Básico, o sistema identifica que nenhum produto foi selecionado ou que a quantidade está vazia, não é um número inteiro ou não é maior que zero.
2. Sistema exibe mensagem de erro específica indicando o problema encontrado.
3. Sistema mantém os dados já preenchidos no formulário.
4. Fluxo retorna ao passo 3 do Fluxo Básico para correção.

### 6.4 Estoque Insuficiente

1. No passo 6 do Fluxo Básico, o sistema identifica que a quantidade vendida é maior que a quantidade disponível em estoque.
2. Sistema exibe mensagem de erro informando a quantidade disponível do produto.
3. Sistema mantém os dados já preenchidos no formulário e não altera o estoque.
4. Fluxo retorna ao passo 3 do Fluxo Básico para correção.

### 6.5 Nenhum Produto Cadastrado

1. No passo 2 do Fluxo Básico, o sistema identifica que não há produtos cadastrados.
2. Sistema informa que é necessário cadastrar um produto antes de registrar uma venda.
3. Caso de uso é encerrado sem alterar o estoque.

## 7. Protótipos de Interface do Caso de Uso

`A ser produzido na disciplina de Implementação e Testes.`

## 8. Diagrama de Atividades do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 9. Diagrama de Projeto do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 10. Diagrama de Sequência do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`
