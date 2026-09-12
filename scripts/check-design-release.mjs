import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import {
  buildContract,
  compareContracts,
  checkPreview,
} from "./lib/design-release.mjs";

// Explicit local-only commands. This tool never commits, pushes, deploys,
// changes LAUNCHED or updates calendar review dates.
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  if (
    !["--snapshot", "--against", "--preview", "--build"].includes(args[i]) ||
    !args[i + 1] ||
    args[i + 1].startsWith("--")
  ) {
    throw new Error(
      "Usage: node scripts/check-design-release.mjs [--build dist] [--snapshot FILE | --against FILE] [--preview http://localhost:4332]",
    );
  }
  if (options[args[i]]) throw new Error(`Duplicate option: ${args[i]}`);
  options[args[i]] = args[i + 1];
}
if (options["--snapshot"] && options["--against"])
  throw new Error("Snapshot and comparison must be separate steps");
const current = await buildContract(resolve(options["--build"] ?? "dist"));
const errors = [];
const summary = {
  pages: Object.keys(current.pages).length,
  routes: current.routes.length,
  protectedFiles: Object.keys(current.immutable).length,
};
if (options["--snapshot"]) {
  const output = resolve(options["--snapshot"]);
  await mkdir(dirname(output), { recursive: true });
  // Never silently bless a regression by overwriting an accepted baseline.
  await writeFile(output, JSON.stringify(current, null, 2) + "\n", {
    flag: "wx",
  });
  summary.snapshot = output;
}
if (options["--against"]) {
  const baseline = JSON.parse(
    await readFile(resolve(options["--against"]), "utf8"),
  );
  errors.push(...compareContracts(baseline, current));
  summary.comparison = errors.length ? "failed" : "unchanged";
}
if (options["--preview"]) {
  summary.preview = await checkPreview(current, options["--preview"]);
  errors.push(...summary.preview.errors);
}
console.log(JSON.stringify({ ...summary, errors }, null, 2));
if (errors.length) process.exitCode = 1;
