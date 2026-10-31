"""Reproduce one page-reviewed filing adapter, not general unseen-PDF extraction.

Usage: .venv/Scripts/python.exe scripts/record-lt-results.py path/to/LT.pdf
The PDF hash, page, six-column mapping and reporting basis must already be reviewed.
"""
import hashlib
import json
from pathlib import Path
import re
import sys
from pypdf import PdfReader

path = Path(sys.argv[1])
output = Path('data/filings.json')
data = json.loads(output.read_text(encoding='utf-8'))
record = next(item for item in data['items'] if item['kind'] == 'results' and item['symbol'] == 'LT')
if hashlib.sha256(path.read_bytes()).hexdigest() != record['source']['sha256']:
    raise ValueError('PDF changed; review the source page/columns before extraction')
lines = PdfReader(path).pages[record['source']['page'] - 1].extract_text(extraction_mode='layout').splitlines()
compact = lambda line: re.sub(r'\s+', ' ', line).strip()
patterns = {'revenue': r'Revenue from operations', 'otherIncome': r'Other\s*income', 'financeCost': r'^e\).*Finance costs', 'depreciation': r'Depreciation.*amortisation', 'pbt': r'^5\s+Profit before tax'}
rows = []
for metric in ['revenue', 'otherIncome', 'financeCost', 'depreciation', 'pbt', 'pat']:
    if metric == 'pat':
        # Ownership appears again under comprehensive income: anchor to net profit row 9.
        anchors = [index for index, line in enumerate(lines) if re.search(r'^9 Net profit after tax including', compact(line), re.I)]
        if len(anchors) != 1:
            raise ValueError('Ambiguous net-profit section')
        line = lines[anchors[0] + 1]
        if not re.sub('[^a-z]', '', line.lower()).startswith('attributabletoownersofthecompany'):
            raise ValueError('Ownership row is not established')
    else:
        matches = [line for line in lines if re.search(patterns[metric], compact(line), re.I)]
        if len(matches) != 1:
            raise ValueError('Ambiguous financial row: ' + metric)
        line = matches[0]
    values = [re.sub(r'\s+', '', cell) for cell in re.split(r'\s{2,}', line.strip()) if cell.strip()][-6:]
    if len(values) != 6 or any(not re.fullmatch(r'\(?-?\d+[.,]\d{2}\)?', value) for value in values):
        raise ValueError('Ambiguous six-column mapping: ' + metric)
    rows.append({'metric': metric, 'values': values})
record['rows'] = rows
output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Reproduced six page-reviewed L&T rows with section-anchored PAT; no model calls.')
