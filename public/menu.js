(function () {
  const links = [
    { href: '/inicio.html', texto: 'Início' },
    { href: '/dashboard.html', texto: 'Dashboard' },
    { href: '/produtos.html', texto: 'Produtos' },
    { href: '/estoque.html', texto: 'Entrada de estoque' },
    { href: '/vendas.html', texto: 'Vendas' },
    { href: '/alertas.html', texto: 'Alertas' },
    { href: '/reposicao.html', texto: 'Reposição' },
    { href: '/historico.html', texto: 'Histórico' },
  ];

  function montarLink(l) {
    const ativo = window.location.pathname === l.href ? ' class="ativo"' : '';
    return '<a href="' + l.href + '"' + ativo + '>' + l.texto + '</a>';
  }

  const itens = links.map(montarLink).join('');

  const topo = document.createElement('header');
  topo.className = 'topo';
  topo.innerHTML =
    '<span class="logo">EstoqueFácil</span>' +
    '<nav id="menu-principal">' + itens + '</nav>' +
    '<span class="usuario" id="nome-usuario"></span>' +
    '<button class="sair" id="botao-sair">Sair</button>';
  document.body.insertBefore(topo, document.body.firstChild);

  fetch('/api/me')
    .then((r) => r.json())
    .then((usuario) => {
      document.getElementById('nome-usuario').textContent = usuario.nome;
      if (usuario.perfil === 'administrador') {
        document
          .getElementById('menu-principal')
          .insertAdjacentHTML('beforeend', montarLink({ href: '/usuarios.html', texto: 'Usuários' }));
      }
    });

  document.getElementById('botao-sair').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });
})();