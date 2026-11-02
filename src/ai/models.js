import defaults from '../config/model-policy.json' with { type: 'json' };
import catalog from '../config/text-model-catalog.json' with { type: 'json' };
import { workflowPolicy } from './workflows.js';

// Versions belong in configuration. Inventory-only entries do not authorize
// generation: a workflow assignment with confirmed quotas is still required.
export const SUPPORTED_GEMINI_MODELS = Object.freeze([...Object.keys(defaults.models), ...catalog.inventoryOnlyTextModels]);
export const DEFAULT_MODELS = Object.keys(defaults.models).join(',');

export function modelInventory(value = DEFAULT_MODELS, env = process.env) {
  if (typeof value !== 'string' || value.length > 4000) throw new Error('Model list is invalid. Nothing was saved.');
  const all = [...new Set(value.split(',').map(id => id.trim().replace(/^models\//, '')).filter(Boolean))];
  if (!all.length || all.length > 40 || all.some(id => !/^(?:gemini|gemma)-[a-z0-9][a-z0-9.-]{1,99}$/.test(id))) throw new Error('Enter up to 40 Gemini/Gemma model IDs, separated by commas. Nothing was saved.');
  const configured = new Set([...SUPPORTED_GEMINI_MODELS, ...Object.keys(workflowPolicy(env).models)]);
  const text = all.filter(id => configured.has(id));
  const specialist = all.filter(id => !text.includes(id) && /embedding|audio|live|transcrib|translat|tts/.test(id));
  const unverified = all.filter(id => !text.includes(id) && !specialist.includes(id));
  if (!text.length) throw new Error('Include at least one supported model for text research. Nothing was saved.');
  return { all, text, specialist, unverified };
}

export function researchModelOrder(inventory, question = '') {
  if (inventory.configuredOrder) return [...inventory.text];
  // Only narrow business-description questions are small tasks. Financial,
  // comparative and open-ended research use Flash-Lite before larger Flash.
  const simple = question.length <= 160 && /\b(business|products?|services?)\b/i.test(question)
    && !/\b(growth|guidance|financial|revenue|profit|margin|risk|compare|valuation|bull|bear|delivery)\b/i.test(question);
  const lite = inventory.text.filter(id => id.includes('flash-lite'));
  const flash = inventory.text.filter(id => id.startsWith('gemini-') && !lite.includes(id));
  const parameters = id => Number(id.match(/-(\d+(?:\.\d+)?)b(?:-|$)/)?.[1] ?? Infinity);
  const gemma = inventory.text.filter(id => id.startsWith('gemma-')).sort((a, b) => parameters(a) - parameters(b));
  const order = simple ? [gemma[0], ...lite, ...gemma.slice(1), ...flash] : [...lite, ...flash, ...gemma];
  return [...new Set(order)].filter(id => inventory.text.includes(id));
}
