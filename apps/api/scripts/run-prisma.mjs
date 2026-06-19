import path from "node:path"
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

import { config } from "dotenv"

const require = createRequire(import.meta.url)
const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url))
const packageDirectoryPath = path.resolve(currentDirectoryPath, "..")
const workspaceEnvPath = path.resolve(packageDirectoryPath, "../../.env")
const prismaCliPath = require.resolve("prisma/build/index.js")

config({ path: workspaceEnvPath })

const result = spawnSync(
  process.execPath,
  [prismaCliPath, ...process.argv.slice(2)],
  {
    cwd: packageDirectoryPath,
    env: process.env,
    stdio: "inherit",
  }
)

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
