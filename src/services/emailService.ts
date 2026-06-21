import nodemailer from "nodemailer";

import { decryptSecret } from "@/lib/security/secretEncryption";
import { findSettings } from "@/repositories/settingsRepository";

export interface EmailTransportConfig {
  readonly host: string;
  readonly port: number;
  readonly username: string | null;
  readonly password: string | null;
  readonly encryption: "tls" | "ssl" | "none";
  readonly senderName: string | null;
  readonly senderAddress: string | null;
  readonly replyTo: string | null;
}

export interface SendTestEmailResult {
  readonly recipient: string;
  readonly messageId: string;
}

async function getEmailTransportConfig(): Promise<EmailTransportConfig> {
  const settings = await findSettings();

  if (!settings) {
    throw new Error("Settings record not found");
  }

  if (!settings.smtpHost) {
    throw new Error("SMTP host is not configured");
  }

  if (!settings.emailSenderAddress) {
    throw new Error("Sender email address is not configured");
  }

  const password = settings.smtpPasswordEncrypted
    ? decryptSecret(settings.smtpPasswordEncrypted)
    : null;

  return {
    host: settings.smtpHost,
    port: settings.smtpPort,
    username: settings.smtpUsername,
    password,
    encryption: settings.smtpEncryption,
    senderName: settings.emailSenderName,
    senderAddress: settings.emailSenderAddress,
    replyTo: settings.emailReplyTo,
  };
}

function createTransport(config: EmailTransportConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.encryption === "ssl",
    auth:
      config.username && config.password
        ? {
            user: config.username,
            pass: config.password,
          }
        : undefined,
    tls: config.encryption === "tls" ? { rejectUnauthorized: true } : undefined,
  });
}

export async function sendTestEmail(recipient: string): Promise<SendTestEmailResult> {
  const config = await getEmailTransportConfig();
  const transport = createTransport(config);

  const from = config.senderName
    ? `"${config.senderName}" <${config.senderAddress}>`
    : config.senderAddress!;

  const result = await transport.sendMail({
    from,
    to: recipient,
    replyTo: config.replyTo ?? undefined,
    subject: "SEO CMS test email",
    text: "This is a test email from your SEO CMS configuration.",
    html: "<p>This is a <strong>test email</strong> from your SEO CMS configuration.</p>",
  });

  if (!result.messageId) {
    throw new Error("Email provider did not return a message id");
  }

  return {
    recipient,
    messageId: result.messageId,
  };
}

export async function verifyEmailTransport(): Promise<void> {
  const config = await getEmailTransportConfig();
  const transport = createTransport(config);
  await transport.verify();
}
