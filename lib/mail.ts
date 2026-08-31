import nodemailer, { type Transporter } from 'nodemailer';

/**
 * E-Mail-Versand über Mailjet-SMTP (EU, DSGVO-konform — siehe
 * INFRASTRUCTURE.md). Es werden ausschließlich Text-Mails versendet.
 */

let transporter: Transporter | null = null;

/**
 * true, wenn alle für den Versand nötigen Umgebungsvariablen gesetzt sind.
 */
export function istMailKonfiguriert(): boolean {
  return Boolean(
    process.env.MAILJET_API_KEY &&
      process.env.MAILJET_SECRET_KEY &&
      process.env.MAIL_FROM,
  );
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'in-v3.mailjet.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILJET_API_KEY,
        pass: process.env.MAILJET_SECRET_KEY,
      },
    });
  }
  return transporter;
}

/**
 * Versendet eine Text-Mail über Mailjet. Wirft bei fehlender Konfiguration
 * oder SMTP-Fehlern einen Error.
 */
export async function sendeMail({
  an,
  betreff,
  inhalt,
}: {
  an: string;
  betreff: string;
  inhalt: string;
}): Promise<void> {
  if (!istMailKonfiguriert()) {
    throw new Error(
      'E-Mail-Versand ist nicht konfiguriert (MAILJET_API_KEY, MAILJET_SECRET_KEY, MAIL_FROM).',
    );
  }

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to: an,
    subject: betreff,
    text: inhalt,
  });
}
