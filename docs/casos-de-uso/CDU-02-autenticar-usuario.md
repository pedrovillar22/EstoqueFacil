# Especificação de Caso de Uso `EstoqueFácil`

# UC: `Autenticar Usuário`

## 1. Resumo

Permite que um usuário com conta previamente cadastrada acesse o sistema informando suas credenciais, iniciando uma sessão autenticada.

## 2. Atores

- **Usuário** — ator primário. Qualquer pessoa com conta cadastrada no sistema (gestor ou operador da loja) que precise acessar suas funcionalidades.

## 3. Precondições

### 3.1 Conta cadastrada

O usuário deve possuir uma conta previamente cadastrada no sistema.

## 4. Pós-condições

### 4.1 Sessão iniciada

O usuário passa a ter uma sessão ativa no sistema, com acesso liberado às funcionalidades permitidas ao seu perfil.

## 5. Pontos de Extensão

`Não aplicável a este caso de uso.`

## 6. Fluxos de Evento

### 6.1 Fluxo Básico

1. Usuário acessa a tela de login.
2. Usuário informa e-mail e senha.
3. Usuário confirma o acesso.
4. Sistema valida as credenciais informadas.
5. Sistema inicia a sessão do usuário.
6. Sistema redireciona o usuário para a tela inicial.

### 6.2 Recuperar Senha

1. Na tela de login (passo 1 do Fluxo Básico), o usuário opta por "Esqueci minha senha".
2. Sistema solicita o e-mail cadastrado.
3. Sistema envia instruções de redefinição de senha para o e-mail informado.
4. Usuário redefine a senha seguindo as instruções.
5. Fluxo retorna ao passo 1 do Fluxo Básico.

### 6.3 Credenciais Inválidas

1. No passo 4 do Fluxo Básico, o sistema identifica e-mail ou senha incorretos.
2. Sistema exibe mensagem de erro informando que as credenciais são inválidas.
3. Fluxo retorna ao passo 2 do Fluxo Básico para nova tentativa.

## 7. Protótipos de Interface do Caso de Uso

`A ser produzido na disciplina de Implementação e Testes.`

## 8. Diagrama de Atividades do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 9. Diagrama de Projeto do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`

## 10. Diagrama de Sequência do Caso de Uso

`A ser produzido na disciplina de Análise e Projeto.`
