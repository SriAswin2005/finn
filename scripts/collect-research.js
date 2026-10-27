import { recordResearch } from '../src/research/service.js';
for (const ticker of process.argv.slice(2)) {
  try { console.log(JSON.stringify(await recordResearch(ticker))); }
  catch (error) { console.error(`${ticker}: ${error.message}`); process.exitCode = 1; }
}
