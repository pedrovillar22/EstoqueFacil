# Especificação de Caso de Uso `EstoqueFácil`

# UC: `Consultar Histórico de Movimentações`

## 1. Resumo

Permite que o usuário autenticado consulte o histórico de movimentações de estoque (entradas e saídas), da mais recente para a mais antiga, podendo filtrar a lista por tipo de movimentação.

## 2. Atores

- **Usuário** — ator primário. Representa qualquer pessoa autenticada no sistema (administrador ou funcionário) responsável por acompanhar as movimentações do estoque.

## 3. Precondições

### 3.1 Usuário autenticado

O usuário deve estar autenticado no sistema (ver UC: Autenticar Usuário) para acessar o histórico de movimentações.

### 3.2 Movimentações registradas

As movimentações consultadas são geradas pelos casos de uso Registrar Entrada de Estoque e Registrar Venda. Caso ainda não exista nenhuma, o sistema informa que não há movimentações registradas.

## 4. Pós-condições

### 4.1 Histórico exibido

O sistema exibe ao usuário as 100 movimentações mais recentes, com data e hora, produto, SKU, tipo (entrada ou saída), quantidade, valor total (apenas nas saídas), usuário responsável e observação.

### 4.2 Dados preservados

Por se tratar de uma consulta, nenhum dado do sistema é alterado.

## 5. Pontos de Extensão

`Não aplicável a este caso de uso — não há comportamento opcional (extend) nem obrigatório (include) associado ao fluxo de consulta do histórico de movimentações.`

## 6. Fluxos de Evento

### 6.1 Fluxo Básico

1. Usuário acessa a opção "Histórico".
2. Sistema consulta as movimentações de estoque registradas.
3. Sistema ordena as movimentações da mais recente para a mais antiga, limitando a lista às 100 mais recentes.
4. Sistema exibe a lista com data e hora, produto, SKU, tipo, quantidade, valor total, usuário e observação.

### 6.2 Filtrar por Tipo

1. Após o passo 4 do Fluxo Básico, o usuário seleciona o filtro por tipo de movimentação (Entradas, Saídas ou Todas).
2. Sistema consulta apenas as movimentações do tipo selecionado.
3. Sistema atualiza a lista exibida, mantendo a ordenação da mais recente para a mais antiga.
4. Fluxo retorna ao passo 4 do Fluxo Básico.

### 6.3 Nenhuma Movimentação Registrada

1. No passo 2 do Fluxo Básico, o sistema identifica que não há movimentações registradas.
2. Sistema exibe a mensagem "Nenhuma movimentação registrada."
3. Caso de uso é encerrado sem alterar o estoque.

### 6.4 Falha na Consulta

1. No passo 2 do Fluxo Básico, ocorre um erro ao consultar as movimentações.
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
