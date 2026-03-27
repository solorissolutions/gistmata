/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const cwd = process.cwd();
const logPath = path.join(cwd, ".dev-server.log");
const pidPath = path.join(cwd, ".dev-server.pid");
const nextPath = path.join(cwd, "node_modules", ".bin", "next.cmd");

const command = `"${nextPath}" dev -p 3000 --hostname 127.0.0.1 >> "${logPath}" 2>&1`;
const child = spawn(command, {
  cwd,
  detached: true,
  stdio: "ignore",
  windowsHide: true,
  shell: true,
});

fs.writeFileSync(pidPath, String(child.pid), "utf8");
child.unref();

console.log(`Started GistMata dev server with PID ${child.pid}`);
