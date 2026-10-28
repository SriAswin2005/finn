import { modelInventory } from '../ai/models.js';

export function mergeGeminiEnvironment(existing, { key, confirmed, models }) {
  if (confirmed !== true) throw new Error('Confirm a billing-disabled Gemini project before saving.');
  if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{20,200}$/.test(key)) throw new Error('The key format is invalid. Nothing was saved.');
  const selected = modelInventory(models).all;
  const values = { GEMINI_API_KEY: key, FINN_AI_FREE_TIER_CONFIRMED: 'true', FINN_GEMINI_MODELS: selected.join(',') };
  const lines = existing.replace(/\r\n/g, '\n').split('\n');
  for (const [name, value] of Object.entries(values)) {
    const pattern = new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=`);
    let found = false;
    for (let index = lines.length - 1; index >= 0; index--) {
      if (!pattern.test(lines[index])) continue;
      if (found) lines.splice(index, 1);
      else { lines[index] = `${name}=${value}`; found = true; }
    }
    if (!found) lines.push(`${name}=${value}`);
  }
  return lines.join('\n').trim() + '\n';
}
