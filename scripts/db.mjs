#!/usr/bin/env node
// Runs the PushPace MySQL database in a container, using Docker or Podman
// (whichever is installed). No compose plugin is needed.
//
//   node scripts/db.mjs up      create (first time) or start the container
//   node scripts/db.mjs down    stop it (data is kept)
//   node scripts/db.mjs reset   delete container + data, then re-create and re-seed
//   node scripts/db.mjs logs    show MySQL logs

import { spawnSync } from "node:child_process";
import path from "node:path";

const CONTAINER = "pushpace-mysql";
const VOLUME = "pushpace-mysql-data";
const IMAGE = "docker.io/library/mysql:8.4";
const PORT = process.env.DB_PORT ?? "3306";
const SCHEMA = path.resolve(import.meta.dirname, "../backend/database/schema.sql");

function run(cmd, args, { quiet = false } = {}) {
  const result = spawnSync(cmd, args, { stdio: quiet ? "pipe" : "inherit", encoding: "utf8" });
  return { ok: result.status === 0, out: (result.stdout ?? "").trim(), error: result.error };
}

const engine = ["docker", "podman"].find((cmd) => !run(cmd, ["--version"], { quiet: true }).error);
if (!engine) {
  console.error("Neither Docker nor Podman is installed.");
  console.error("Install one of them, or use a local MySQL server and import backend/database/schema.sql.");
  process.exit(1);
}

const exists = () => run(engine, ["container", "inspect", CONTAINER], { quiet: true }).ok;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitUntilReady() {
  process.stdout.write("Waiting for MySQL to be ready");
  for (let i = 0; i < 90; i++) {
    // Succeeds only once the server is up and schema.sql has been loaded.
    const probe = run(
      engine,
      ["exec", CONTAINER, "mysql", "-uroot", "-h127.0.0.1", "-e", "SELECT 1 FROM pushpace_db.users LIMIT 1"],
      { quiet: true },
    );
    if (probe.ok) {
      console.log(`\nMySQL is ready on localhost:${PORT} (user root, empty password, database pushpace_db).`);
      return;
    }
    process.stdout.write(".");
    await sleep(2000);
  }
  console.error(`\nMySQL did not become ready in time. Check: ${engine} logs ${CONTAINER}`);
  process.exit(1);
}

async function up() {
  if (exists()) {
    console.log(`Starting existing container ${CONTAINER} (${engine})...`);
    if (!run(engine, ["start", CONTAINER]).ok) process.exit(1);
  } else {
    console.log(`Creating container ${CONTAINER} with ${engine} (first run downloads MySQL)...`);
    const created = run(engine, [
      "run", "-d",
      "--name", CONTAINER,
      "-e", "MYSQL_ALLOW_EMPTY_PASSWORD=yes",
      "-e", "MYSQL_DATABASE=pushpace_db",
      "-p", `${PORT}:3306`,
      "-v", `${VOLUME}:/var/lib/mysql`,
      // Runs only when the data volume is empty. `Z` lets SELinux hosts (Fedora) read the file.
      "-v", `${SCHEMA}:/docker-entrypoint-initdb.d/01-schema.sql:ro,Z`,
      IMAGE,
    ]);
    if (!created.ok) process.exit(1);
  }
  await waitUntilReady();
}

function down() {
  if (!exists()) return console.log("Database container is not running.");
  run(engine, ["stop", CONTAINER]);
}

async function reset() {
  run(engine, ["rm", "-f", CONTAINER], { quiet: true });
  run(engine, ["volume", "rm", VOLUME], { quiet: true });
  console.log("Removed the old container and data.");
  await up();
}

const command = process.argv[2];
switch (command) {
  case "up":
    await up();
    break;
  case "down":
    down();
    break;
  case "reset":
    await reset();
    break;
  case "logs":
    run(engine, ["logs", CONTAINER]);
    break;
  default:
    console.error("Usage: node scripts/db.mjs <up|down|reset|logs>");
    process.exit(1);
}
