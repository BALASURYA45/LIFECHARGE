import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

function isSmtpConfigured() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  if (!isSmtpConfigured()) {
    logger.warn('SMTP is not configured. Password reset email was not sent.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Reset your LIFECHARGE password',
    text: `Reset your LIFECHARGE password using this link: ${resetUrl}`,
    html: `<p>Reset your LIFECHARGE password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  return true;
}
