const metrics = ['revenue', 'pbt', 'pat', 'financeCost', 'depreciation', 'otherIncome'];
function sourceNumber(value) {
  if (value === null || value === undefined || value === '-' || value === '') return null;
  // This adapter accepts one decimal separator and exactly two decimals, never guesses grouping.
  if (!/^\(?-?\d+[.,]\d{2}\)?$/.test(value) || value.startsWith('(') !== value.endsWith(')')) throw new RangeError('Ambiguous financial table number.');
  return Number(value.replace(/[()]/g, '').replace(',', '.')) * (value.startsWith('(') ? -1 : 1);
}
export function financialChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return { percent: null, label: 'Unavailable' };
  if (previous <= 0) return { percent: null, label: previous < 0 && current > 0 ? 'Loss → profit' : 'No positive comparison base' };
  return { percent: (current / previous - 1) * 100, label: null };
}
export function buildResults(record) {
  if (!['standalone', 'consolidated'].includes(record.scope) || record.currency !== 'INR' || record.unit !== 'crore' || record.columns.length !== 6) throw new RangeError('Financial period, entity or units are unverified.');
  const dates = record.columns.slice(0, 3).map(date => Date.parse(date));
  if (dates.some(date => !Number.isFinite(date)) || dates[0] <= dates[1] || dates[1] <= dates[2] || dates[0] - dates[1] > 100 * 86400000 || dates[0] - dates[2] < 350 * 86400000 || dates[0] - dates[2] > 380 * 86400000) throw new RangeError('Financial comparison periods are not comparable quarters.');
  const values = {};
  for (const row of record.rows) {
    if (!metrics.includes(row.metric)) continue;
    if (values[row.metric] || row.values.length !== 6) throw new RangeError('Financial row or column mapping is ambiguous.');
    values[row.metric] = row.values.slice(0, 3).map(sourceNumber);
  }
  const ebitda = [0, 1, 2].map(index => {
    const input = ['pbt', 'financeCost', 'depreciation', 'otherIncome'].map(metric => values[metric]?.[index]);
    return input.every(Number.isFinite) ? Math.round((input[0] + input[1] + input[2] - input[3]) * 100) / 100 : null;
  });
  return { scope: record.scope, currency: record.currency, unit: record.unit, periods: record.columns.slice(0, 3), source: record.source, notes: record.notes,
    rows: [['revenue', 'Revenue'], ['ebitda', 'EBITDA proxy · derived'], ['pbt', 'PBT'], ['pat', 'PAT']].map(([metric, label]) => {
      const series = metric === 'ebitda' ? ebitda : values[metric] ?? [null, null, null];
      return { metric, label, value: series[0], previousQuarter: series[1], previousYear: series[2], qoq: financialChange(series[0], series[1]), yoy: financialChange(series[0], series[2]) };
    }) };
}
