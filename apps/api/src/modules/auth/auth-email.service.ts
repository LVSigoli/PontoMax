import { sendMail } from '../../common/email/mail.service.js';

interface SendInviteEmailParams {
  to: string;
  fullName: string;
  passwordSetupUrl: string;
}

interface SendResetEmailParams {
  to: string;
  fullName: string;
  passwordSetupUrl: string;
}

export async function sendInviteEmail(params: SendInviteEmailParams) {
  const { to, fullName, passwordSetupUrl } = params;

  return sendMail({
    to,
    subject: 'Ative sua conta no PontoMax',
    text: [
      `Ola, ${fullName}.`,
      '',
      'Sua conta no PontoMax foi criada com acesso protegido.',
      '',
      'Use o link abaixo para definir sua senha e ativar seu acesso:',
      passwordSetupUrl,
      '',
      'Se voce nao esperava este convite, ignore este e-mail.',
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
