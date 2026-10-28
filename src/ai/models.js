// Text generation models checked against Google's free-tier documentation.
// Inventory is separate: saving an ID does not authorize invoking an unknown model.
export const SUPPORTED_GEMINI_MODELS = Object.freeze([
  'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite',
  'gemma-4-26b-a4b-it', 'gemma-4-31b-it',
]);
export const DEFAULT_MODELS = 'gemini-3.5-flash-lite,gemini-3.1-flash-lite';

export function modelInventory(value = DEFAULT_MODELS) {
  if (typeof value !== 'string' || value.length > 4000) throw new Error('Model list is invalid. Nothing was saved.');
  const all = [...new Set(value.split(',').map(id => id.trim().replace(/^models\//, '')).filter(Boolean))];
  if (!all.length || all.length > 40 || all.some(id => !/^(?:gemini|gemma)-[a-z0-9][a-z0-9.-]{1,99}$/.test(id))) throw new Error('Enter up to 40 Gemini/Gemma model IDs, separated by commas. Nothing was saved.');
  const text = all.filter(id => SUPPORTED_GEMINI_MODELS.includes(id));
  const specialist = all.filter(id => !text.includes(id) && /embedding|audio|live|transcrib|translat|tts/.test(id));
  const unverified = all.filter(id => !text.includes(id) && !specialist.includes(id));
  if (!text.length) throw new Error('Include at least one supported model for text research. Nothing was saved.');
  return { all, text, specialist, unverified };
}

export function researchModelOrder(inventory, question = '') {
  // Only narrow business-description questions are small tasks. Financial,
  // comparative and open-ended research retain the configured Flash order.
  const simple = question.length <= 160 && /\b(business|products?|services?)\b/i.test(question)
    && !/\b(growth|guidance|financial|revenue|profit|margin|risk|compare|valuation|bull|bear|delivery)\b/i.test(question);
  const preferred = simple ? ['gemma-4-26b-a4b-it', 'gemma-4-31b-it'] : [];
  return [...preferred.filter(id => inventory.text.includes(id)), ...inventory.text.filter(id => !preferred.includes(id) && !id.startsWith('gemma-')), ...inventory.text.filter(id => !preferred.includes(id) && id.startsWith('gemma-'))];
}
