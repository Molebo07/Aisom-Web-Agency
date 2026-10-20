import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

const projectDirectory = process.cwd();
const sourceDirectory = join(projectDirectory, "src");
const publicDirectory = join(projectDirectory, "public");
const forbiddenContent = /\[CONFIRM|\bTODO\b|\bLorem\b|\bXXX\b/;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return nested.flat();
}

const sourceFiles = await listFiles(sourceDirectory);
const checkedFiles = sourceFiles.filter((file) => /\.(?:css|html|js|jsx|svg|ts|tsx)$/.test(file));
checkedFiles.push(join(projectDirectory, "index.html"));
if (existsSync(publicDirectory)) {
  const publicFiles = await listFiles(publicDirectory);
  checkedFiles.push(...publicFiles.filter((file) => /\.(?:html|json|svg)$/.test(file)));
}
const findings = [];

for (const file of checkedFiles) {
  const content = await readFile(file, "utf8");
  if (forbiddenContent.test(content)) findings.push(relative(process.cwd(), file));
}

const outputDirectory = join(projectDirectory, "dist");
const outputFiles = existsSync(outputDirectory) ? await listFiles(outputDirectory) : [];
const renderedHtml = outputFiles.filter((path) => path.endsWith(".html"));
for (const file of renderedHtml) {
  if (forbiddenContent.test(await readFile(file, "utf8"))) {
    findings.push(relative(projectDirectory, file));
  }
}

if (findings.length > 0) {
  console.error(`Build output contains blocked placeholder text:\n${findings.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Content check passed (${checkedFiles.length} project files and ${renderedHtml.length} rendered HTML files checked).`);
}
