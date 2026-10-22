# Especificação de Caso de Uso `EstoqueFácil`

# UC: `Selecionar Plano`

## 1. Resumo

Permite que o administrador autenticado consulte os planos de assinatura do sistema (Gratuito, Básico, Pro e Enterprise), veja o plano atual e o uso atual de produtos e usuários, e selecione o plano mais adequado ao tamanho do negócio. Os demais usuários autenticados podem consultar os planos, mas não alterá-los. Nesta versão, o pagamento não está incluído: a troca de plano é simulada.

## 2. Atores

- **Administrador** — ator primário. Representa o usuário autenticado com perfil de administrador, responsável por escolher e alterar o plano do negócio.
- **Funcionário** — ator secundário. Representa o usuário autenticado com perfil de funcionário, que pode apenas consultar os planos e o plano atual.

## 3. Precondições

O usuário deve estar autenticado no sistema (ver UC: Autenticar Usuário). Para selecionar um plano, o usuário deve ter o perfil de administrador.

## 4. Pós-condições

### 4.1 Plano atualizado

O plano escolhido pelo administrador passa a ser o plano atual do sistema, com a data da alteração registrada.

### 4.2 Plano atual destacado

A tela de planos passa a destacar o novo plano como "Plano atual" e a exibir a mensagem de sucesso da alteração.

### 4.3 Limites respeitados

O plano só é alterado quando o uso atual (quantidade de produtos e de usuários cadastrados) cabe nos limites do plano escolhido.

## 5. Pontos de Extensão

`Não aplicável a este caso de uso — não há comportamento opcional (extend) nem obrigatório (include) associado ao fluxo de seleção de plano. O pagamento do plano não faz parte desta versão e a troca é simulada.`

## 6. Fluxos de Evento

### 6.1 Fluxo Básico — Selecionar Plano

1. Administrador acessa a opção "Planos".
2. Sistema exibe o plano atual, o uso atual (quantidade de produtos e de usuários) e os planos disponíveis, cada um com preço e limites de produtos, usuários e filiais:
   - Gratuito: R$ 0, 10 produtos, 1 usuário e 1 filial;
   - Básico: R$ 29,90/mês, 50 produtos, 3 usuários e 1 filial;
   - Pro: R$ 79,90/mês, 300 produtos, 10 usuários e 5 filiais;
   - Enterprise: sob consulta, com limites definidos em contrato.
3. Administrador escolhe um plano diferente do atual e aciona a opção "Selecionar".
4. Sistema verifica que o plano escolhido existe.
5. Sistema verifica que a quantidade atual de produtos e de usuários não ultrapassa os limites do plano escolhido.
6. Sistema registra o plano escolhido como plano atual, com a data da alteração.
7. Sistema atualiza a tela, destaca o novo plano como "Plano atual" e exibe a mensagem "Plano alterado para [plano] com sucesso!".

### 6.2 Consultar Planos (Funcionário)

1. Funcionário acessa a opção "Planos".
2. Sistema exibe o plano atual, o uso atual e os planos disponíveis, sem os botões de seleção.
3. Sistema informa que apenas o administrador pode alterar o plano.

### 6.3 Uso Acima do Limite do Plano

1. No passo 5 do Fluxo Básico, o sistema identifica que a quantidade atual de produtos ou de usuários é maior que o limite do plano escolhido.
2. Sistema exibe a mensagem informando a quantidade atual e o limite do plano, por exemplo: "Você tem 4 usuários e o plano Básico permite 3.".
3. Caso de uso é encerrado sem alterar o plano.

### 6.4 Plano Inválido

1. No passo 4 do Fluxo Básico, o sistema identifica que o plano informado não existe.
2. Sistema exibe a mensagem "Plano inválido.".
3. Caso de uso é encerrado sem alterar o plano.

### 6.5 Usuário Sem Permissão

1. Um usuário com perfil de funcionário tenta alterar o plano.
2. Sistema recusa a operação e informa que apenas o administrador pode alterar o plano.
3. Caso de uso é encerrado sem alterar o plano.

### 6.6 Usuário Não Autenticado

1. Um usuário não autenticado tenta acessar a opção "Planos" ou alterar o plano.
2. Sistema direciona o usuário para a tela de login.
3. Caso de uso é encerrado sem alterar o plano.

### 6.7 Falha na Seleção

1. Em qualquer passo da seleção, ocorre um erro ao gravar ou consultar os dados.
2. Sistema exibe mensagem de erro informando que houve um problema no servidor e que o usuário deve tentar novamente.
3. Caso de uso é encerrado sem alterar o plano.

## 7. Protótipos de Interface do Caso de Uso

`A ser produzido na disciplina de Implementação e Testes.`

## 8. Diagrama de Atividades do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 9. Diagrama de Projeto do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 10. Diagrama de Sequência do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`
