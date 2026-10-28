import { recordResearch } from '../src/research/service.js';
const cachedOnly = process.argv.includes('--cached');
for (const ticker of process.argv.slice(2).filter(arg => arg !== '--cached')) {
  try { console.log(JSON.stringify(await recordResearch(ticker, { cachedOnly }))); }
  catch (error) { console.error(`${ticker}: ${error.message}`); process.exitCode = 1; }
}
