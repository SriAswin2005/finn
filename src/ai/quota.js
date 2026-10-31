import { readFile } from 'node:fs/promises';
import { writeJsonAtomic } from '../storage/snapshots.js';

// Disk is best-effort. Losing the ledger never grants a fresh allowance.
export function createQuotaStore({ path, read = async () => JSON.parse(await readFile(path, 'utf8')), write = ledger => writeJsonAtomic(path, ledger) }) {
  let memory = { entries: [], cooldowns: {} }; let resting = false;
  const unavailable = () => new Error('AI quota resting; showing cached notes and primary evidence. Quota storage is unavailable.');
  return {
    async load() {
      if (resting) throw unavailable();
      try {
        const ledger = await read();
        if (!Array.isArray(ledger?.entries) || !ledger.cooldowns || typeof ledger.cooldowns !== 'object' || Array.isArray(ledger.cooldowns)
          || ledger.entries.some(entry => typeof entry.model !== 'string' || !Number.isFinite(entry.at))
          || Object.values(ledger.cooldowns).some(value => !Number.isFinite(value))
          || (ledger.projectCooldown !== undefined && !Number.isFinite(ledger.projectCooldown))) throw new Error('Invalid ledger.');
        memory = structuredClone(ledger); return structuredClone(memory);
      } catch { resting = true; throw unavailable(); }
    },
    async save(ledger) {
      memory = structuredClone(ledger);
      if (resting) throw unavailable();
      try { await write(memory); } catch { resting = true; throw unavailable(); }
    },
    snapshot: () => ({ ledger: structuredClone(memory), resting }),
  };
}
