const PLANOS_PAGOS = ['basico', 'pro'];

function desenharQR(texto) {
  let h = 0;
  for (const c of texto) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  const n = 25, t = 8;
  let s = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const canto = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
      if (canto) continue;
      h = (Math.imul(h, 1103515245) + 12345) >>> 0;
      if ((h >> 16) & 1) s += `<rect x="${x * t}" y="${y * t}" width="${t}" height="${t}"/>`;
    }
  }
  const marca = (x, y) =>
    `<rect x="${x * t}" y="${y * t}" width="${7 * t}" height="${7 * t}"/>` +
    `<rect x="${(x + 1) * t}" y="${(y + 1) * t}" width="${5 * t}" height="${5 * t}" fill="#fff"/>` +
    `<rect x="${(x + 2) * t}" y="${(y + 2) * t}" width="${3 * t}" height="${3 * t}"/>`;
  const lado = n * t;
  return `<svg viewBox="0 0 ${lado} ${lado}" width="200" height="200" style="background:#fff;border:8px solid #fff;border-radius:4px;">` +
    s + marca(0, 0) + marca(n - 7, 0) + marca(0, n - 7) + '</svg>';
}

async function abrirPagamento(chave) {
  mostrar('', '');
  const resposta = await fetch('/api/planos/pagamento/iniciar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plano: chave }),
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
  const area = document.getElementById('pagamento');
  area.innerHTML =
    `<h2>Pagamento do plano ${dados.nome}</h2>` +
    `<p>Valor: <strong>${dados.valor}</strong></p>` +
    desenharQR(dados.qr) +
    `<p><small>Código: ${dados.codigo} (pagamento simulado, nenhuma cobrança real)</small></p>` +
    '<button type="button" class="primario" id="btn-pagar">Simular pagamento</button> ' +
    '<button type="button" id="btn-cancelar-pag">Cancelar</button>';
  area.style.display = 'block';
  document.getElementById('btn-pagar').addEventListener('click', () => confirmarPagamento(chave, dados.codigo));
  document.getElementById('btn-cancelar-pag').addEventListener('click', () => { area.style.display = 'none'; });
}

async function confirmarPagamento(chave, codigo) {
  const resposta = await fetch('/api/planos/pagamento/confirmar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo: codigo }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrar(dados.erro, 'erro');
    return;
  }
  document.getElementById('pagamento').style.display = 'none';
  await selecionar(chave);
}
