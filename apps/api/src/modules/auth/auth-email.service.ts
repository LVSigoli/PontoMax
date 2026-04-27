import { sendMail } from '../../common/email/mail.service.js';

interface SendInviteEmailParams {
  to: string;
  fullName: string;
  temporaryPassword: string;
  passwordSetupUrl: string;
}

interface SendResetEmailParams {
  to: string;
  fullName: string;
  passwordSetupUrl: string;
}

export async function sendInviteEmail(params: SendInviteEmailParams) {
  const { to, fullName, temporaryPassword, passwordSetupUrl } = params;

  return sendMail({
    to,
    subject: 'Sua conta no PontoMax foi criada',
    text: [
      `Ola, ${fullName}.`,
      '',
      'Sua conta no PontoMax foi criada com uma senha temporaria.',
      `Senha temporaria: ${temporaryPassword}`,
      '',
      'Antes de acessar o sistema, defina sua senha final no link abaixo:',
      passwordSetupUrl,
      '',
      'Se voce preferir, tambem pode tentar entrar com a senha temporaria e o sistema vai pedir a troca imediatamente.',
    ].join('\n'),
  });
}

export async function sendPasswordResetEmail(params: SendResetEmailParams) {
  const { to, fullName, passwordSetupUrl } = params;

  return sendMail({
    to,
    subject: 'Redefinicao de senha do PontoMax',
    text: [
      `Ola, ${fullName}.`,
      '',
      'Recebemos uma solicitacao para redefinir sua senha.',
      'Use o link abaixo para cadastrar uma nova senha:',
      passwordSetupUrl,
      '',
      'Se voce nao solicitou esta redefinicao, ignore este e-mail.',
    ].join('\n'),
  });
}
