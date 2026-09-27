import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = resolve(ROOT, "worker", "assets");

await mkdir(OUT, { recursive: true });
await copyFile(resolve(ROOT, "tools", "studio", "ui.html"), resolve(OUT, "ui.html"));
console.log("ui.html → worker/assets/ui.html");
