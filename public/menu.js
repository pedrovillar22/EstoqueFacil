(function () {
  const links = [
    { href: '/inicio.html', texto: 'Início' },
    { href: '/produtos.html', texto: 'Produtos' },
    { href: '/estoque.html', texto: 'Entrada de estoque' },
    { href: '/vendas.html', texto: 'Vendas' },
  ];

  const itens = links
    .map((l) => {
      const ativo = window.location.pathname === l.href ? ' class="ativo"' : '';
      return '<a href="' + l.href + '"' + ativo + '>' + l.texto + '</a>';
    })
    .join('');

  const topo = document.createElement('header');
  topo.className = 'topo';
  topo.innerHTML =
    '<span class="logo">EstoqueFácil</span>' +
    '<nav>' + itens + '</nav>' +
    '<span class="usuario" id="nome-usuario"></span>' +
    '<button class="sair" id="botao-sair">Sair</button>';
  document.body.insertBefore(topo, document.body.firstChild);

  fetch('/api/me')
    .then((r) => r.json())
    .then((usuario) => {
      document.getElementById('nome-usuario').textContent = usuario.nome;
    });

  document.getElementById('botao-sair').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });
})();