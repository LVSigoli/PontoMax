import path from "node:path"
import { fileURLToPath } from "node:url"

import { config } from "dotenv"

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectoryPath = path.dirname(currentFilePath)
const workspaceEnvPath = path.resolve(currentDirectoryPath, "../../../../.env")

config({ path: workspaceEnvPath })

type NodeEnv = "development" | "test" | "production"

function readRequiredString(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

function readOptionalString(name: string) {
  const value = process.env[name]?.trim()
  return value || undefined
}

function readOptionalPort(name: string) {
  const rawPort = process.env[name]?.trim()

  if (!rawPort) {
    return undefined
  }

  const parsedPort = Number(rawPort)

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }

  return parsedPort
}

function readOptionalBoolean(name: string) {
  const rawValue = process.env[name]?.trim().toLowerCase()

  if (!rawValue) {
    return undefined
  }

  if (rawValue === "true" || rawValue === "1" || rawValue === "yes") {
    return true
  }

  if (rawValue === "false" || rawValue === "0" || rawValue === "no") {
    return false
  }

  throw new Error(`${name} must be true or false`)
}

function readPort() {
  const rawPort = process.env.PORT?.trim()

  if (!rawPort) {
    return 3333
  }

  const parsedPort = Number(rawPort)

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error("PORT must be a positive integer")
  }

  return parsedPort
}

function readNodeEnv(): NodeEnv {
  const rawNodeEnv = process.env.NODE_ENV?.trim()

  if (!rawNodeEnv) return "development"

  if (
    rawNodeEnv === "development" ||
    rawNodeEnv === "test" ||
    rawNodeEnv === "production"
  ) {
    return rawNodeEnv
  }

  throw new Error("NODE_ENV must be development, test, or production")
}

function loadEnv() {
  return {
    NODE_ENV: readNodeEnv(),
    PORT: readPort(),
    API_PREFIX: process.env.API_PREFIX?.trim() || "api",
    DATABASE_URL: readRequiredString("DATABASE_URL"),
    JWT_ACCESS_SECRET: readRequiredString("JWT_ACCESS_SECRET"),
    JWT_ACCESS_EXPIRES_IN: readRequiredString("JWT_ACCESS_EXPIRES_IN"),
    JWT_REFRESH_SECRET: readRequiredString("JWT_REFRESH_SECRET"),
    JWT_REFRESH_EXPIRES_IN: readRequiredString("JWT_REFRESH_EXPIRES_IN"),
    APP_URL: process.env.APP_URL?.trim() || "http://localhost:3000",
    MAIL_FROM:
      process.env.MAIL_FROM?.trim() || "PontoMax <no-reply@pontomax.local>",
    SMTP_SERVICE: readOptionalString("SMTP_SERVICE"),
    SMTP_HOST: readOptionalString("SMTP_HOST"),
    SMTP_PORT: readOptionalPort("SMTP_PORT"),
    SMTP_SECURE: readOptionalBoolean("SMTP_SECURE"),
    SMTP_USER: readOptionalString("SMTP_USER"),
    SMTP_PASS: readOptionalString("SMTP_PASS"),
  }
}

export const env = loadEnv()
