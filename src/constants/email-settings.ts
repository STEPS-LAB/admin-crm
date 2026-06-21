export const SMTP_ENCRYPTION_MODES = ["tls", "ssl", "none"] as const;

export type SmtpEncryptionMode = (typeof SMTP_ENCRYPTION_MODES)[number];

export const SMTP_ENCRYPTION_LABELS: Record<SmtpEncryptionMode, string> = {
  tls: "TLS (STARTTLS)",
  ssl: "SSL",
  none: "None",
};

export const SMTP_PORT_LIMITS = {
  min: 1,
  max: 65535,
  default: 587,
} as const;
