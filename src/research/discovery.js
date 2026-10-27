import { SourceError } from '../providers/http.js';

export function normalizeTicker(value) {
  const symbol = String(value ?? '').trim().toUpperCase().replace(/\.NS$/, '');
  if (!/^[A-Z0-9][A-Z0-9&-]{0,29}$/.test(symbol)) throw new RangeError('Enter a valid NSE symbol, such as INFY or ASIANPAINT.');
  return symbol;
}
export function decodeHtml(text) {
  return text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
export function directDocumentUrl(value) {
  const url = new URL(value);
  if (url.hostname === 'www.bseindia.com' && url.pathname.toLowerCase() === '/stockinfo/annpdfopen.aspx') {
    const filename = url.searchParams.get('Pname');
    if (/^[a-f0-9-]+\.pdf$/i.test(filename ?? '')) return `https://www.bseindia.com/xml-data/corpfiling/AttachHis/${filename}`;
  }
  return url.href;
}

export function discoverDocuments(html, ticker) {
  const title = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  const company = title ? decodeHtml(title[1]) : ticker;
  // Only the dedicated document lists are used. No Screener financials or AI summaries enter the evidence corpus.
  const annualSection = html.split(/<h3[^>]*>Annual reports<\/h3>/i)[1]?.split(/<h3/i)[0] ?? '';
  const callSection = html.split(/<h3[^>]*>Concalls<\/h3>/i)[1]?.split(/<h3/i)[0] ?? '';
  const documents = [];
  const anchors = section => [...section.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  for (const match of anchors(annualSection)) {
    const href = /href="([^"]+)"/.exec(match[1]); const label = decodeHtml(match[2]);
    if (href && /^Annual Report \d{4}$/.test(label)) documents.push({ kind: 'annual_report', title: label, url: directDocumentUrl(decodeHtml(href[1])) });
    if (documents.length === 1) break;
  }
  for (const item of callSection.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const period = />([A-Z][a-z]{2} \d{4})<\/div>/.exec(item[1])?.[1] ?? 'Period unavailable';
    for (const match of anchors(item[1])) {
      const href = /href="([^"]+)"/.exec(match[1]);
      if (href && decodeHtml(match[2]) === 'Transcript') {
        documents.push({ kind: 'transcript', title: `Earnings call · ${period}`, url: directDocumentUrl(decodeHtml(href[1])) });
      }
    }
    if (documents.filter(d => d.kind === 'transcript').length >= 2) break;
  }
  if (!documents.length) throw new SourceError('No annual-report or transcript links were available for this ticker.');
  return { ticker, company, discoveryUrl: `https://www.screener.in/company/${encodeURIComponent(ticker)}/consolidated/`, documents };
}
