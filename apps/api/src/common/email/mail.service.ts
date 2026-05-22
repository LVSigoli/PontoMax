import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from '../../config/env.js';
import { createSmtpTransport, isSmtpConfigured } from './smtp.client.js';

interface SendMailParams {
  to: string;
  subject: string;
  text: string;
}

export interface MailDeliveryResult {
  channel: 'smtp' | 'file';
  previewPath?: string;
}

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const workspaceRoot = path.resolve(currentDirectoryPath, '../../../../..');
const outboxDirectoryPath = path.join(workspaceRoot, '.tmp', 'mail-outbox');

export async function sendMail(params: SendMailParams): Promise<MailDeliveryResult> {
  if (isSmtpConfigured()) {
    await sendWithSmtp(params);
    return {
      channel: 'smtp',
    };
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('Missing SMTP configuration for production e-mail delivery.');
  }

  return writeMailToOutbox(params);
}

async function sendWithSmtp(params: SendMailParams) {
  const transporter = createSmtpTransport();

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: params.to,
    subject: params.subject,
    text: params.text,
  });
}

async function writeMailToOutbox(params: SendMailParams): Promise<MailDeliveryResult> {
  await fs.mkdir(outboxDirectoryPath, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeEmail = params.to.replace(/[^a-zA-Z0-9@._-]/g, '_');
  const filePath = path.join(outboxDirectoryPath, `${timestamp}-${safeEmail}.txt`);
  const content = [
    `From: ${env.MAIL_FROM}`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    '',
    params.text,
    '',
  ].join('\n');

  await fs.writeFile(filePath, content, 'utf-8');

  console.log(`Mail preview written to ${filePath}`);

  return {
    channel: 'file',
    previewPath: filePath,
  };
}
