import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectoryPath = path.dirname(currentFilePath)
const packageDirectoryPath = path.resolve(currentDirectoryPath, "..")
const schemaPath = path.resolve(packageDirectoryPath, "../../prisma/schema.prisma")

function getGeneratedClientDirectoryPath() {
  const prismaPackagePath = require.resolve("@prisma/client/package.json")
  const prismaPackageDirectoryPath = path.dirname(prismaPackagePath)
  const nodeModulesDirectoryPath = path.dirname(
    path.dirname(prismaPackageDirectoryPath),
  )

  return path.join(nodeModulesDirectoryPath, ".prisma", "client")
}

function hasGeneratedEngineFile(clientDirectoryPath) {
  if (!fs.existsSync(clientDirectoryPath)) {
    return false
  }

  return fs
    .readdirSync(clientDirectoryPath)
    .some(
      (fileName) =>
        fileName.startsWith("query_engine") ||
        fileName.startsWith("libquery_engine"),
    )
}

function isGeneratedClientUpToDate() {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Prisma schema not found at ${schemaPath}`)
  }

  const clientDirectoryPath = getGeneratedClientDirectoryPath()
  const generatedSchemaPath = path.join(clientDirectoryPath, "schema.prisma")

  if (!fs.existsSync(generatedSchemaPath)) {
    return false
  }

  if (!hasGeneratedEngineFile(clientDirectoryPath)) {
    return false
  }

  const sourceSchemaLastWriteTime = fs.statSync(schemaPath).mtimeMs
  const generatedSchemaLastWriteTime = fs.statSync(generatedSchemaPath).mtimeMs

  return generatedSchemaLastWriteTime >= sourceSchemaLastWriteTime
}

function runPrismaGenerate() {
  console.log("Prisma Client missing or outdated. Running prisma generate...")

  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm"
  const result = spawnSync(command, ["run", "prisma:generate"], {
    cwd: packageDirectoryPath,
    env: process.env,
    stdio: "inherit",
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (!isGeneratedClientUpToDate()) {
  runPrismaGenerate()
}
