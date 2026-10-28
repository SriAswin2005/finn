import { createInterface, emitKeypressEvents } from 'node:readline';
import { readFile, writeFile, rename, rm, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mergeGeminiEnvironment } from '../src/config/ai-env.js';

async function readOptional(path) {
  try { return await readFile(path, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function hiddenKey() {
  return new Promise((resolveKey, reject) => {
    const input = process.stdin; const wasRaw = input.isRaw; let value = '';
    emitKeypressEvents(input);
    try { input.setRawMode(true); }
    catch { reject(new Error('Secure console input is unavailable here. Run this command in your own PowerShell terminal; no key was requested or saved.')); return; }
    process.stdout.write('Gemini API key (hidden; never printed): '); input.resume();
    const finish = error => {
      input.removeListener('keypress', onKey); input.setRawMode(Boolean(wasRaw)); input.pause(); process.stdout.write('\n');
      if (error) reject(error); else resolveKey(value);
    };
    const onKey = (text, key) => {
      if (key?.ctrl && key.name === 'c') return finish(new Error('Cancelled. Nothing saved.'));
      if (key?.name === 'return' || key?.name === 'enter') return finish();
      if (key?.name === 'backspace') { value = value.slice(0, -1); return; }
      if (!key?.ctrl && !key?.meta && typeof text === 'string' && /^[A-Za-z0-9_-]+$/.test(text)) value = (value + text).slice(0, 201);
    };
    input.on('keypress', onKey);
  });
}
async function run() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Run npm run configure:ai in your own interactive PowerShell terminal. Do not pass the key as a command argument.');
  const path = resolve('.env');
  try {
    await access('.git');
    const ignored = spawnSync('git', ['check-ignore', '--quiet', '.env'], { windowsHide: true });
    if (ignored.status !== 0) throw new Error('.env must be ignored by Git before saving a key.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const existing = await readOptional(path);
  const base = existing ?? await readFile('.env.example', 'utf8');
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  const question = prompt => new Promise(answer => readline.question(prompt, answer));
  console.log('FINN: Gemini free-quota setup. This command does not contact Google or generate research.');
  const confirmed = await question('Is this a Gemini project with billing disabled? Type YES to continue: ');
  if (confirmed.trim() !== 'YES') { readline.close(); throw new Error('Cancelled. Nothing saved.'); }
  const models = await question('Free models available in your AI Studio project [gemini-3.5-flash-lite,gemini-3.1-flash-lite]: ');
  if (existing) {
    const replace = await question('Update the existing .env Gemini settings while preserving other settings? [y/N]: ');
    if (replace.trim().toLowerCase() !== 'y') { readline.close(); throw new Error('Cancelled. Nothing saved.'); }
  }
  readline.close();
  const key = await hiddenKey();
  const content = mergeGeminiEnvironment(base, { key, confirmed: true, models: models.trim() || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite' });
  // Refuse to overwrite settings edited while the wizard was open.
  if (await readOptional(path) !== existing) throw new Error('.env changed during setup. Nothing saved; run the command again.');
  const temporary = `${path}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, content, { mode: 0o600, flag: 'wx' }); await rename(temporary, path); }
  finally { await rm(temporary, { force: true }); }
  console.log('Saved backend configuration in ignored .env. Restart FINN, then request one cited note to verify it.');
}
run().catch(error => { console.error(error.message); process.exitCode = 1; });
