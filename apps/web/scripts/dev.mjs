import crypto from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { startServer } = require("next/dist/server/lib/start-server");
const { RESTART_EXIT_CODE } = require("next/dist/server/lib/utils");

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), "..");
const workspaceRoot = path.resolve(projectRoot, "..", "..");
const nextDirectoryPath = path.join(projectRoot, ".next");
const devFingerprintPath = path.join(nextDirectoryPath, "dev-fingerprint.json");

const isChildProcess = process.env.NEXT_DEV_CHILD === "1";

if (isChildProcess) {
  await runChildProcess();
} else {
  ensureFreshDevCache();
  await runParentProcess(parseLaunchOptions(process.argv.slice(2)));
}

async function runParentProcess(options) {
  const childEnv = {
    ...process.env,
    NEXT_DEV_CHILD: "1",
    NEXT_DEV_PORT: String(options.port),
    NEXT_DEV_ALLOW_RETRY: options.allowRetry ? "1" : "0",
    NEXT_DEV_HOSTNAME: options.hostname ?? "",
    NEXT_PRIVATE_START_TIME:
      process.env.NEXT_PRIVATE_START_TIME ?? Date.now().toString(),
    __NEXT_DEV_SERVER: "1",
  };

  let childProcess;
  let isShuttingDown = false;

  const launchChild = () => {
    childProcess = spawn(process.execPath, [__filename], {
      env: childEnv,
      stdio: "inherit",
    });

    childProcess.once("error", (error) => {
      console.error(error);
      process.exit(1);
    });

    childProcess.once("exit", (code, signal) => {
      if (isShuttingDown) {
        process.exit(0);
        return;
      }

      if (!isShuttingDown && code === RESTART_EXIT_CODE) {
        childEnv.NEXT_PRIVATE_START_TIME = Date.now().toString();
        launchChild();
        return;
      }

      if (signal === "SIGINT" || signal === "SIGTERM") {
        process.exit(0);
        return;
      }

      if (signal) {
        process.exit(1);
        return;
      }

      process.exit(code ?? 0);
    });
  };

  const stopChild = () => {
    isShuttingDown = true;

    if (childProcess) {
      childProcess.kill();
      return;
    }

    process.exit(0);
  };

  process.on("SIGINT", stopChild);
  process.on("SIGTERM", stopChild);

  launchChild();
}

async function runChildProcess() {
  const port = parsePositiveInteger(process.env.NEXT_DEV_PORT) ?? 3000;
  const allowRetry = process.env.NEXT_DEV_ALLOW_RETRY === "1";
  const hostname = process.env.NEXT_DEV_HOSTNAME || undefined;

  process.env.__NEXT_DEV_SERVER = "1";
  process.env.NEXT_PRIVATE_START_TIME =
    process.env.NEXT_PRIVATE_START_TIME ?? Date.now().toString();

  try {
    await startServer({
      dir: projectRoot,
      port,
      allowRetry,
      isDev: true,
      hostname,
      serverFastRefresh: true,
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

function parseLaunchOptions(argv) {
  let port = undefined;
  let allowRetry = true;
  let hostname;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--port" || argument === "-p") {
      port = parsePositiveInteger(argv[index + 1]);
      allowRetry = false;
      index += 1;
      continue;
    }

    if (argument.startsWith("--port=")) {
      port = parsePositiveInteger(argument.slice("--port=".length));
      allowRetry = false;
      continue;
    }

    if (argument === "--hostname" || argument === "-H") {
      hostname = argv[index + 1];
      index += 1;
      continue;
    }

    if (argument.startsWith("--hostname=")) {
      hostname = argument.slice("--hostname=".length);
    }
  }

  const envPort = parsePositiveInteger(process.env.PORT);

  if (port === undefined && envPort !== undefined) {
    port = envPort;
    allowRetry = false;
  }

  if (port === undefined) {
    port = 3000;
    allowRetry = true;
  }

  return {
    allowRetry,
    hostname,
    port,
  };
}

function parsePositiveInteger(value) {
  if (value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue >= 0
    ? parsedValue
    : undefined;
}

function ensureFreshDevCache() {
  const currentFingerprint = createDependencyFingerprint();
  const previousFingerprint = readSavedFingerprint();

  if (previousFingerprint === currentFingerprint) {
    return;
  }

  resetNextArtifacts();
  fs.mkdirSync(nextDirectoryPath, { recursive: true });
  fs.writeFileSync(
    devFingerprintPath,
    JSON.stringify({ fingerprint: currentFingerprint }, null, 2)
  );
}

function createDependencyFingerprint() {
  const hash = crypto.createHash("sha256");
  const filesToTrack = [
    path.join(workspaceRoot, "pnpm-lock.yaml"),
    path.join(workspaceRoot, "package.json"),
    path.join(projectRoot, "package.json"),
  ];

  for (const filePath of filesToTrack) {
    hash.update(filePath);
    hash.update("\n");
    hash.update(readFileIfExists(filePath));
    hash.update("\n");
  }

  return hash.digest("hex");
}

function readSavedFingerprint() {
  if (!fs.existsSync(devFingerprintPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(devFingerprintPath, "utf8");
    const parsedContent = JSON.parse(content);
    return typeof parsedContent.fingerprint === "string"
      ? parsedContent.fingerprint
      : null;
  } catch {
    return null;
  }
}

function readFileIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function resetNextArtifacts() {
  const relativePath = path.relative(projectRoot, nextDirectoryPath);

  if (relativePath !== ".next") {
    throw new Error(`Refusing to reset unexpected path: ${nextDirectoryPath}`);
  }

  fs.rmSync(nextDirectoryPath, { recursive: true, force: true });
}
