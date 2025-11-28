/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CRANEMAIL_SMTP_HOST?: string;
  readonly CRANEMAIL_SMTP_PORT?: string;
  readonly CRANEMAIL_SMTP_USER?: string;
  readonly CRANEMAIL_SMTP_PASS?: string;
  readonly CONTACT_FROM_EMAIL?: string;
  readonly CONTACT_RECIPIENT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

