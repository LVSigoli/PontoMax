import nodemailer from "nodemailer"

import { env } from "../../config/env.js"

const DEFAULT_SMTP_PORT = 465

export function isSmtpConfigured() {
  return Boolean(
    env.SMTP_USER &&
      env.SMTP_PASS &&
      (env.SMTP_SERVICE || env.SMTP_HOST)
  )
}

export function createSmtpTransport() {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP transport is not configured.")
  }

  if (env.SMTP_SERVICE) {
    return nodemailer.createTransport({
      service: env.SMTP_SERVICE,
      auth: {
        user: env.SMTP_USER!,
        pass: env.SMTP_PASS!,
      },
    })
  }

  const port = env.SMTP_PORT ?? DEFAULT_SMTP_PORT

  return nodemailer.createTransport({
    host: env.SMTP_HOST!,
    port,
    secure: env.SMTP_SECURE ?? port === DEFAULT_SMTP_PORT,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
    },
  })
}
