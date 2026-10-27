import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
// Keep test discovery scoped; built release copies must not run as duplicate suites.
const files = (await readdir('test')).filter(file => file.endsWith('.test.js')).sort().map(file => `test/${file}`);
if (!files.length) throw new Error('No test suites found.');
const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit', windowsHide: true });
process.exitCode = result.status ?? 1;
