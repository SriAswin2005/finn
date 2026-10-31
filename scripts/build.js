import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd(); const output = resolve(root, 'dist/finn');
// Delete only this script's fixed build directory; never touch a computed external path.
if (!output.startsWith(resolve(root, 'dist') + '\\') && !output.startsWith(resolve(root, 'dist') + '/')) throw new Error('Invalid build output.');
await rm(output, { recursive: true, force: true }); await mkdir(output, { recursive: true });
for (const path of ['public', 'src', 'scripts', 'test', 'api', 'vercel.json', '.vercelignore', 'package-lock.json', 'package.json', 'requirements.txt', '.env.example', 'Dockerfile', 'README.md', 'AGENTS.md', 'CONTRIBUTING.md', 'HANDOFF.md', 'PROGRESS.md', 'docs']) await cp(resolve(root, path), resolve(output, path), { recursive: true });
for (const path of ['recorded-snapshot.json', 'research']) await cp(resolve(root, 'data', path), resolve(output, 'data', path), { recursive: true });
const files = [];
async function scan(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, item.name);
    if (item.isDirectory()) await scan(path);
    else files.push({ path: relative(output, path).replaceAll('\\', '/'), sha256: createHash('sha256').update(await readFile(path)).digest('hex') });
  }
}
await scan(output);
await writeFile(resolve(output, 'BUILD_MANIFEST.json'), JSON.stringify({ version: '0.3.0', files }, null, 2) + '\n');
const archive = resolve(root, 'dist/finn-prototype.tar.gz');
const tar = spawnSync('tar', ['-czf', archive, '-C', resolve(root, 'dist'), 'finn'], { stdio: 'inherit', windowsHide: true });
if (tar.status !== 0) throw new Error('tar packaging failed; the prepared dist/finn folder remains available.');
console.log(`Built ${files.length} files: ${archive}`);
