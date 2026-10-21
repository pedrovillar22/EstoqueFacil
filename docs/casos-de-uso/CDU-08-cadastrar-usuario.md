# Especificação de Caso de Uso `EstoqueFácil`

# UC: `Cadastrar Usuário`

## 1. Resumo

Permite que o dono do negócio crie a conta do sistema, tornando-se o administrador, e que o administrador autenticado cadastre os funcionários do negócio, para que cada pessoa acesse o sistema com seu próprio e-mail e senha e com o perfil de acesso adequado.

## 2. Atores

- **Dono do negócio** — ator primário do fluxo de criação de conta. Representa a pessoa ainda não autenticada que deseja começar a usar o sistema e, ao criar a conta, torna-se administrador.
- **Administrador** — ator primário do fluxo de cadastro de funcionários. Representa o usuário autenticado com perfil de administrador, responsável por cadastrar e consultar os usuários do negócio.

## 3. Precondições

### 3.1 Criar conta

Nenhuma precondição: a criação de conta é pública e não exige autenticação.

### 3.2 Cadastrar funcionário

O administrador deve estar autenticado no sistema (ver UC: Autenticar Usuário) com o perfil de administrador.

## 4. Pós-condições

### 4.1 Usuário cadastrado

O usuário é cadastrado no sistema com nome, e-mail e senha, e com o perfil correspondente ao fluxo: administrador, quando criado pela opção "Criar conta", ou funcionário, quando cadastrado por um administrador.

### 4.2 Senha protegida

A senha informada não é armazenada em texto aberto: o sistema guarda apenas uma versão protegida (hash) dela.

### 4.3 Acesso imediato após criar conta

Quando o usuário é criado pela opção "Criar conta", o sistema o autentica automaticamente e o direciona para a tela de início.

### 4.4 Lista de usuários atualizada

Quando o administrador cadastra um funcionário, o novo usuário passa a aparecer na lista de usuários cadastrados.

## 5. Pontos de Extensão

`Não aplicável a este caso de uso — não há comportamento opcional (extend) nem obrigatório (include) associado ao fluxo de cadastro de usuário.`

## 6. Fluxos de Evento

### 6.1 Fluxo Básico — Criar Conta

1. Dono do negócio acessa a opção "Criar conta" na tela de login.
2. Sistema exibe o formulário com os campos nome, e-mail, senha e confirmação de senha.
3. Dono do negócio preenche os campos e confirma o cadastro.
4. Sistema verifica que as duas senhas informadas são iguais.
5. Sistema valida que nome, e-mail e senha foram preenchidos, que o e-mail tem formato válido e que a senha tem pelo menos 8 caracteres.
6. Sistema verifica que ainda não existe usuário cadastrado com o e-mail informado.
7. Sistema cadastra o usuário com o perfil de administrador, armazenando a senha de forma protegida.
8. Sistema autentica o novo administrador e o direciona para a tela de início.

### 6.2 Cadastrar Funcionário

1. Administrador acessa a opção "Usuários".
2. Sistema exibe o formulário de cadastro de funcionário e a lista de usuários cadastrados, com nome, e-mail, perfil e data de criação.
3. Administrador preenche nome, e-mail e senha do funcionário e confirma o cadastro.
4. Sistema valida os dados e verifica que o e-mail ainda não está cadastrado (passos 5 e 6 do Fluxo Básico).
5. Sistema cadastra o usuário com o perfil de funcionário, armazenando a senha de forma protegida.
6. Sistema exibe a mensagem de sucesso, limpa o formulário e atualiza a lista de usuários.

### 6.3 Senhas Diferentes

1. No passo 4 do Fluxo Básico, o sistema identifica que a senha e a confirmação de senha são diferentes.
2. Sistema exibe a mensagem "As senhas não conferem." e mantém o usuário no formulário.
3. Caso de uso é encerrado sem cadastrar o usuário.

### 6.4 Dados Inválidos

1. No passo 5 do Fluxo Básico (ou passo 4 do fluxo 6.2), o sistema identifica que algum campo obrigatório não foi preenchido, que o e-mail tem formato inválido ou que a senha tem menos de 8 caracteres.
2. Sistema exibe a mensagem de erro correspondente ao problema encontrado.
3. Caso de uso é encerrado sem cadastrar o usuário.

### 6.5 E-mail Já Cadastrado

1. No passo 6 do Fluxo Básico (ou passo 4 do fluxo 6.2), o sistema identifica que já existe um usuário com o e-mail informado.
2. Sistema exibe a mensagem "Já existe uma conta com esse e-mail.".
3. Caso de uso é encerrado sem cadastrar o usuário.

### 6.6 Usuário Sem Permissão

1. Um usuário com perfil de funcionário tenta acessar a opção "Usuários" ou cadastrar um novo usuário.
2. Sistema não exibe o formulário nem a lista de usuários e informa que apenas o administrador pode cadastrar e consultar usuários.
3. Caso de uso é encerrado sem cadastrar o usuário.

### 6.7 Falha no Cadastro

1. Em qualquer passo do cadastro, ocorre um erro ao gravar ou consultar os dados.
2. Sistema exibe mensagem de erro informando que houve um problema no servidor e que o usuário deve tentar novamente.
3. Caso de uso é encerrado sem cadastrar o usuário.

## 7. Protótipos de Interface do Caso de Uso

`A ser produzido na disciplina de Implementação e Testes.`

## 8. Diagrama de Atividades do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 9. Diagrama de Projeto do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 10. Diagrama de Sequência do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`