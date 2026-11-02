import defaults from '../config/model-policy.json' with { type: 'json' };
import { validatePolicy } from '../push/quota.js';

// Model versions, roles, thinking levels and limits are configuration, never
// inferred upgrades. Updating configuration does not invalidate stored briefings.
export function workflowPolicy(env = process.env) {
  return validatePolicy(env.FINN_MODEL_POLICY_JSON ? JSON.parse(env.FINN_MODEL_POLICY_JSON) : structuredClone(defaults));
}
export function researchAssignments(env = process.env) {
  const trial = env.FINN_RESEARCH_EVALUATION_MODEL;
  const policy = workflowPolicy(env);
  let models = Object.entries(policy.models).filter(([id, cap]) => cap.workflow === 'research' && (!cap.evaluationOnly || trial === id) && (!trial || trial === id)).map(([id]) => id);
  if (policy.researchOrder) models = [...policy.researchOrder.filter(id => models.includes(id)), ...models.filter(id => !policy.researchOrder.includes(id))];
  const inventory = env.FINN_GEMINI_MODELS?.split(',').map(id => id.trim().replace(/^models\//, ''));
  const text = inventory ? models.filter(id => inventory.includes(id)) : models;
  if (!text.length) throw new Error('No approved Research model is assigned. Push models cannot be used as Research fallbacks.');
  return { text, configuredOrder: Boolean(policy.researchOrder) };
}
