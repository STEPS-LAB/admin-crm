import { spawnSync } from "node:child_process";

interface ReleaseStep {
  readonly name: string;
  readonly command: string;
  readonly args: readonly string[];
}

const steps: readonly ReleaseStep[] = [
  { name: "Lint", command: "pnpm", args: ["lint"] },
  { name: "Typecheck", command: "pnpm", args: ["typecheck"] },
  { name: "Unit tests", command: "pnpm", args: ["test"] },
  { name: "Production build", command: "pnpm", args: ["build"] },
  { name: "E2E smoke", command: "pnpm", args: ["test:e2e:smoke"] },
];

function runStep(step: ReleaseStep): void {
  const result = spawnSync(step.command, [...step.args], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`\nRelease verification failed at step: ${step.name}`);
    process.exit(result.status ?? 1);
  }
}

console.log("Running v1.0 release verification...\n");

for (const step of steps) {
  console.log(`→ ${step.name}`);
  runStep(step);
}

console.log("\nRelease verification passed.");
