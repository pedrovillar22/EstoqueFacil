const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const router = express.Router();

const MINUTOS_VALIDADE = 15;
const MAX_TENTATIVAS = 5;
const MENSAGEM_PADRAO = 'Se o e-mail estiver cadastrado, você receberá um código em instantes.';

async function enviarEmail(para, nome, codigo) {
  const resposta = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'EstoqueFácil', email: process.env.EMAIL_REMETENTE },
      to: [{ email: para, name: nome }],
      subject: 'Código para redefinir sua senha - EstoqueFácil',
      htmlContent:
        `<p>Olá, ${nome}.</p>` +
        `<p>Seu código para redefinir a senha do EstoqueFácil é:</p>` +
        `<p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${codigo}</p>` +
        `<p>Ele vale por ${MINUTOS_VALIDADE} minutos. Se você não pediu a redefinição, ignore este e-mail.</p>`,
    }),
  });
  if (!resposta.ok) {
    throw new Error('Falha ao enviar e-mail: ' + resposta.status + ' ' + (await resposta.text()));
  }
}

// Passo 1: o usuário informa o e-mail e recebe um código
router.post('/solicitar', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ erro: 'Informe o e-mail.' });
  }

  try {
    const resultado = await pool.query(
      'SELECT id, nome, codigo_recuperacao_expira_em FROM usuarios WHERE LOWER(email) = $1',
      [email]
    );
    const usuario = resultado.rows[0];

    if (usuario) {
      // evita pedir código várias vezes seguidas (espera 1 minuto)
      const expira = usuario.codigo_recuperacao_expira_em;
      const pediuHaPouco =
        expira && expira.getTime() > Date.now() + (MINUTOS_VALIDADE - 1) * 60 * 1000;

      if (!pediuHaPouco) {
        const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
        const hash = await bcrypt.hash(codigo, 10);

        await pool.query(
          `UPDATE usuarios
           SET codigo_recuperacao_hash = $1,
               codigo_recuperacao_expira_em = NOW() + ($2 || ' minutes')::interval,
               codigo_recuperacao_tentativas = 0
           WHERE id = $3`,
          [hash, String(MINUTOS_VALIDADE), usuario.id]
        );

        try {
          await enviarEmail(email, usuario.nome, codigo);
        } catch (erroEmail) {
          console.error(erroEmail);
        }
      }
    }

    // mesma resposta exista ou não o e-mail
    res.json({ mensagem: MENSAGEM_PADRAO });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

// Passo 2: o usuário informa e-mail, código e senha nova
router.post('/redefinir', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const codigo = (req.body.codigo || '').trim();
  const novaSenha = req.body.novaSenha || '';

  if (!email || !codigo || !novaSenha) {
    return res.status(400).json({ erro: 'Preencha o e-mail, o código e a nova senha.' });
  }
  if (novaSenha.length < 8) {
    return res.status(400).json({ erro: 'A senha deve conter no mínimo 8 caracteres.' });
  }

  const erroPadrao = { erro: 'Código inválido ou expirado. Solicite um novo código.' };

  try {
    const resultado = await pool.query(
      `SELECT id, codigo_recuperacao_hash, codigo_recuperacao_expira_em, codigo_recuperacao_tentativas
       FROM usuarios WHERE LOWER(email) = $1`,
      [email]
    );
    const usuario = resultado.rows[0];

    if (
      !usuario ||
      !usuario.codigo_recuperacao_hash ||
      !usuario.codigo_recuperacao_expira_em ||
      usuario.codigo_recuperacao_expira_em.getTime() < Date.now() ||
      usuario.codigo_recuperacao_tentativas >= MAX_TENTATIVAS
    ) {
      return res.status(400).json(erroPadrao);
    }

    const codigoCorreto = await bcrypt.compare(codigo, usuario.codigo_recuperacao_hash);
    if (!codigoCorreto) {
      await pool.query(
        'UPDATE usuarios SET codigo_recuperacao_tentativas = codigo_recuperacao_tentativas + 1 WHERE id = $1',
        [usuario.id]
      );
      return res.status(400).json(erroPadrao);
    }

    const novoHash = await bcrypt.hash(novaSenha, 10);
    await pool.query(
      `UPDATE usuarios
       SET senha_hash = $1,
           codigo_recuperacao_hash = NULL,
           codigo_recuperacao_expira_em = NULL,
           codigo_recuperacao_tentativas = 0
       WHERE id = $2`,
      [novoHash, usuario.id]
    );

    res.json({ mensagem: 'Senha redefinida com sucesso. Faça login com a nova senha.' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no servidor. Tente novamente.' });
  }
});

module.exports = router;