const planoEscolhido = new URLSearchParams(window.location.search).get('plano');
const mensagem = document.getElementById('mensagem');
const botaoPagar = document.getElementById('btn-pagar');

function mostrar(texto, classe) {
  mensagem.textContent = texto;
  mensagem.className = classe;
}

async function iniciarPagamento() {
  if (!['basico', 'pro'].includes(planoEscolhido)) {
    window.location.href = '/planos.html';
    return;
  }

  const resposta = await fetch('/api/planos/pagamento/iniciar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plano: planoEscolhido }),
  });
  if (resposta.status === 401) {
    window.location.href = '/login.html';
    return;
  }

  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrar(dados.erro, 'erro');
    return;
  }

  document.getElementById('plano-nome').textContent = dados.nome;
  document.getElementById('plano-valor').textContent = dados.valor;
  document.getElementById('codigo').textContent = dados.codigo;
  document.getElementById('qr').src = dados.qr_imagem;
  document.getElementById('area-pagamento').style.display = 'block';

  botaoPagar.addEventListener('click', () => confirmarPagamento(dados.codigo));
}

async function confirmarPagamento(codigo) {
  botaoPagar.disabled = true;
  botaoPagar.textContent = 'Processando pagamento...';
  mostrar('', '');

  const resposta = await fetch('/api/planos/pagamento/confirmar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo: codigo }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrar(dados.erro, 'erro');
    botaoPagar.disabled = false;
    botaoPagar.textContent = 'Simular pagamento';
    return;
  }

  // Pagamento confirmado: ativa o plano e vai para a tela de confirmação
  const ativacao = await fetch('/api/planos/selecionar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plano: planoEscolhido }),
  });
  const plano = await ativacao.json();
  if (!ativacao.ok) {
    mostrar(plano.erro, 'erro');
    botaoPagar.disabled = false;
    botaoPagar.textContent = 'Simular pagamento';
    return;
  }

  window.location.href = '/pagamento-confirmado.html';
}

iniciarPagamento();