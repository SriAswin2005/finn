import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBriefing } from '../src/domain/briefing.js';
import { getDemoDataset, DEMO_AS_OF } from '../src/providers/demo.js';

test('demo briefing is scoped, deterministic and separates routine items', () => {
  const data = buildBriefing(getDemoDataset());
  assert.equal(data.mode, 'demo');
  assert.equal(data.asOf, DEMO_AS_OF);
  assert.equal(new Set(data.portfolio.map(c => c.symbol)).size, 15);
  assert.deepEqual(data.counts, { material: 4, routine: 3, signals: 3 });
  assert.equal(data.announcements[0].category, 'litigation');
  assert.ok(data.announcements.every(a => a.source.url === null));
  assert.deepEqual(data, buildBriefing(getDemoDataset()));
});

test('window includes its boundary, excludes future and non-portfolio filings', () => {
  const dataset = getDemoDataset();
  const base = dataset.announcements[0];
  dataset.announcements = [
    { ...base, id: 'boundary', publishedAt: new Date(Date.parse(DEMO_AS_OF) - 24 * 3600000).toISOString() },
    { ...base, id: 'too-old', publishedAt: new Date(Date.parse(DEMO_AS_OF) - 24 * 3600000 - 1).toISOString() },
    { ...base, id: 'future', publishedAt: new Date(Date.parse(DEMO_AS_OF) + 1).toISOString() },
    { ...base, id: 'other', symbol: 'UNKNOWN' },
  ];
  assert.deepEqual(buildBriefing(dataset).announcements.map(a => a.id), ['boundary']);
  assert.equal(buildBriefing(getDemoDataset(), { hours: 72 }).counts.material, 5);
  assert.equal(buildBriefing(getDemoDataset(), { hours: 168 }).counts.material, 6);
});

test('alerts use absolute price movement OR volume; exact thresholds count', () => {
  const dataset = getDemoDataset();
  dataset.portfolio = [{ symbol: 'TEST', name: 'Test', eod: { close: 97, previousClose: 100, volume: 200, averageVolume: 100, baselineSessions: 20 } }];
  assert.deepEqual(buildBriefing(dataset).signals[0].reasons, ['price', 'volume']);
  dataset.portfolio[0].eod.close = 100;
  assert.deepEqual(buildBriefing(dataset).signals[0].reasons, ['volume']);
  assert.equal(buildBriefing(getDemoDataset(), { priceThreshold: 50, volumeThreshold: 20 }).signals.length, 0);
});

test('missing prices, invalid baselines and partial histories are not fabricated', () => {
  const dataset = getDemoDataset();
  dataset.portfolio = [{ symbol: 'TEST', eod: { close: null, previousClose: 100, volume: 500, averageVolume: 100, baselineSessions: 19 } }];
  assert.equal(buildBriefing(dataset).signals.length, 0);
  dataset.portfolio[0].eod = { close: 120, previousClose: 0, volume: 100, averageVolume: 0, baselineSessions: 20 };
  assert.equal(buildBriefing(dataset).signals.length, 0);
});

test('invalid thresholds and windows fail explicitly', () => {
  for (const options of [{ hours: 0 }, { hours: 25 }, { priceThreshold: NaN }, { priceThreshold: 0 }, { priceThreshold: 51 }, { volumeThreshold: 0.9 }, { volumeThreshold: Infinity }]) {
    assert.throws(() => buildBriefing(getDemoDataset(), options), RangeError);
  }
});
