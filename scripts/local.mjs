import { execSync, spawn } from "node:child_process"
import { existsSync } from "node:fs"

if (!existsSync("node_modules/next")) {
  execSync("npm ci", { stdio: "inherit" })
}

process.stdout.write(
  "Given is starting with the mock registrar.\nhttp://127.0.0.1:43123\n",
)

const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--hostname", "0.0.0.0", "--port", "43123"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      REGISTRAR: "mock",
      DATA_DIR: "data",
    },
  },
)

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 0)
})
