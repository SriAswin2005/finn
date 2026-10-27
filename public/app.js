import { researchCompany } from './research.js';
const $ = id => document.getElementById(id);
const alertCategories = ['results', 'M&A', 'management_change', 'litigation', 'fund_raise', 'capex', 'credit_rating', 'dividend', 'pledging', 'other'];
const defaults = { hours: 24, price: 3, volume: 2, mode: 'recorded', delivery: 'inapp', categories: ['results', 'M&A', 'management_change', 'litigation', 'fund_raise', 'capex'] };
let preferences = { ...defaults };
let requestId = 0;
let pendingInstall;
let currentMode = 'live';
let currentBriefing;
try {
  const saved = JSON.parse(localStorage.getItem('finn.preferences.v1'));
  if ([24, 72, 168].includes(saved?.hours)) preferences.hours = saved.hours;
  if (['live', 'recorded', 'demo'].includes(saved?.mode)) preferences.mode = saved.mode;
  if (['inapp', 'paused'].includes(saved?.delivery)) preferences.delivery = saved.delivery;
  if (Array.isArray(saved?.categories)) preferences.categories = saved.categories.filter(category => alertCategories.includes(category));
  if (Number.isFinite(saved?.price) && saved.price >= 0.1 && saved.price <= 50) preferences.price = saved.price;
  if (Number.isFinite(saved?.volume) && saved.volume >= 1 && saved.volume <= 20) preferences.volume = saved.volume;
} catch { /* Browser storage may be disabled or contain an older format. */ }
$('window').value = preferences.hours;
$('data-mode').value = preferences.mode;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
const time = value => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) + ' IST';
const categoryLabel = value => value.replaceAll('_', ' ');
const number = value => Number.isFinite(value) ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value) : 'Unavailable';
function sourceLink(source, label = source?.label) {
  try {
    const url = new URL(source?.url);
    if (url.protocol !== 'https:' || url.username || url.password || !['finance.yahoo.com', 'nsearchives.nseindia.com', 'archives.nseindia.com'].includes(url.hostname)) return element('span', 'muted', 'No verified source link available.');
    const link = element('a', 'source-link', label);
    link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; return link;
  } catch { return element('span', 'muted', 'Fictional demo · no source document.'); }
}
function setModeHeader(mode, asOf) {
  currentMode = mode;
  const demo = mode === 'demo'; const recorded = mode === 'recorded';
  $('mode-tag').textContent = demo ? 'DEMO EDITION' : recorded ? 'RECORDED SOURCES' : 'SOURCE SNAPSHOT';
  $('mode-description').textContent = demo ? 'A working briefing with fictional scenarios.' : recorded ? 'Real records. A fixed point in time.' : 'Exchange filings. Closing prices. Evidence in reach.';
  $('mode-note').textContent = demo ? 'All events and figures are fictional.' : recorded ? 'Replay mode · not current market information.' : 'Cached public sources · not streaming quotes.';
  $('footer-mode').textContent = `${demo ? 'FICTIONAL DATA' : recorded ? 'RECORDED PUBLIC DATA' : 'PUBLIC SOURCE DATA'} · NOT INVESTMENT ADVICE`;
  $('edition-date').textContent = asOf ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(asOf)).toUpperCase() : 'YOUR DAILY BRIEFING';
}
function persist() {
  try { localStorage.setItem('finn.preferences.v1', JSON.stringify(preferences)); return true; }
  catch { return false; }
}
function openDetail(item) {
  $('detail-symbol').textContent = `${item.symbol} / ${categoryLabel(item.category)}`;
  $('detail-title').textContent = item.title;
  $('detail-time').textContent = `${time(item.publishedAt)} · ${currentMode === 'demo' ? 'Fictional scenario' : `NSE disclosure · collected ${time(item.fetchedAt)}`}`;
  $('detail-summary').textContent = item.summary;
  $('detail-why').textContent = item.why;
  $('detail-evidence').textContent = item.source.evidence;
  $('detail-source').replaceChildren(sourceLink(item.source, 'Open original NSE filing ↗'));
  $('detail').showModal();
}
function openMarket(company) {
  const eod = company.eod;
  $('market-title').textContent = `${company.symbol} · ${company.name}`;
  $('market-time').textContent = eod ? `Session ${eod.session}${eod.fetchedAt ? ` · collected ${time(eod.fetchedAt)}` : ' · Fictional demo'}` : 'No market record is available.';
  const rows = eod ? [
    ['Close (INR)', number(eod.close)], ['Previous close (INR)', number(eod.previousClose)],
    ['Daily price move', company.market.priceChange === null ? 'Unavailable' : `${company.market.priceChange.toFixed(2)}%`],
    ['Volume (shares)', number(eod.volume)], ['Prior-session average volume', number(eod.averageVolume)],
    ['Valid sessions in baseline', `${eod.baselineSessions} / 20`],
    ['Volume / baseline', company.market.volumeRatio === null ? 'Unavailable' : `${company.market.volumeRatio.toFixed(2)}×`],
  ] : [];
  $('market-values').replaceChildren(...rows.flatMap(([key, value]) => [element('dt', '', key), element('dd', '', value)]));
  $('market-warning').textContent = company.market.warning ?? 'Raw closing prices; daily bars are accepted only after 4:00 PM IST. Volume baseline excludes the current session. Split-affected comparisons are suppressed.';
  $('market-source').replaceChildren(sourceLink(eod?.source, 'View Yahoo Finance history ↗'));
  $('market-detail').showModal();
}
function card(item) {
  const article = element('article', 'announcement');
  const meta = element('div', 'card-meta');
  meta.append(element('span', 'symbol', item.symbol), element('span', 'category', categoryLabel(item.category)), element('span', '', time(item.publishedAt)));
  const why = element('p', 'why', item.why);
  const button = element('button', 'detail-button', currentMode === 'demo' ? 'View scenario & evidence status →' : 'View disclosure & original filing →');
  button.setAttribute('aria-label', `View ${item.symbol}: ${item.title}`);
  button.addEventListener('click', () => openDetail(item));
  article.append(meta, element('h3', '', item.title), element('p', '', item.summary.length > 280 ? item.summary.slice(0, 280) + '…' : item.summary), why, button);
  return article;
}
function render(data) {
  currentBriefing = data;
  setModeHeader(data.mode, data.asOf);
  $('material-count').textContent = data.counts.material;
  $('signal-count').textContent = data.counts.signals;
  $('portfolio-count').textContent = data.portfolio.length;
  const material = data.announcements.filter(item => !item.routine);
  const filingUnavailable = data.sources?.announcements.status === 'unavailable';
  $('announcements').replaceChildren(...(material.length ? material.map(card) : [element('p', 'empty', filingUnavailable ? 'Announcement collection is unavailable. Check Sources & freshness.' : 'No priority disclosures in this window. Routine items remain below; try a wider period.')]));
  $('routine-items').replaceChildren(...data.announcements.filter(item => item.routine).map(card));
  $('routine-label').textContent = `${data.counts.routine} routine disclosures · lower priority`;
  $('routine').hidden = !data.counts.routine;
  const valid = data.portfolio.filter(c => c.eod && c.market.alertEligible).length;
  $('threshold-caption').textContent = `Your thresholds: ±${data.thresholds.price}% price or ${data.thresholds.volume}× volume. Alert coverage: ${valid}/${data.portfolio.length}.`;
  $('signal-note').textContent = `${data.mode === 'demo' ? 'Fictional closing moves. ' : ''}Closing moves vs. the previous session; volume vs. the preceding 20 valid sessions. Independent of the filing window. Stale or split-affected records do not trigger alerts.`;
  const signals = data.signals.map(signal => {
    const row = element('div', 'signal');
    const header = element('div', 'signal-header');
    header.append(element('strong', '', signal.symbol), element('span', `move ${signal.priceChange < 0 ? 'negative' : 'positive'}`, signal.priceChange === null ? 'N/A' : `${signal.priceChange >= 0 ? '+' : ''}${signal.priceChange.toFixed(1)}%`));
    row.append(header, element('small', '', `${signal.volumeRatio === null ? 'Volume unavailable' : `${signal.volumeRatio.toFixed(1)}× volume`} · ${signal.reasons.map(r => r === 'price' ? 'Price trigger' : 'Volume trigger').join(' + ')}`));
    const button = element('button', 'detail-button', `Session ${signal.session} · inspect calculation →`);
    button.addEventListener('click', () => openMarket(data.portfolio.find(c => c.symbol === signal.symbol)));
    row.append(button);
    return row;
  });
  $('signals').replaceChildren(...(signals.length ? signals : [element('p', 'empty', valid ? 'No eligible companies cross these thresholds.' : 'Market data is incomplete, stale or unavailable. Alerts are paused.')]));
  $('portfolio').replaceChildren(...data.portfolio.map(company => {
    const li = element('li');
    const button = element('button', 'portfolio-button', company.symbol);
    button.setAttribute('aria-label', `View market record for ${company.symbol}`);
    button.addEventListener('click', () => openMarket(company));
    li.append(button, element('span', '', company.market.warning ? 'Check data status' : `${company.sector}${company.eod ? ` · ${company.eod.session}` : ''}`)); return li;
  }));
  $('source-health').hidden = data.mode === 'demo';
  $('source-health').open = data.sources?.announcements.status === 'unavailable';
  $('source-health-label').textContent = `Sources & freshness${data.stale ? ' · warnings to review' : ''}`;
  $('source-health-items').replaceChildren(...Object.values(data.sources ?? {}).map(source => {
    const section = element('div', 'source-status');
    section.append(element('strong', '', `${source.label} · ${source.status}`), element('p', 'muted', source.fetchedAt ? `Collected ${time(source.fetchedAt)}` : 'No successful collection yet.'));
    if (source.error) section.append(element('p', 'muted', source.error));
    for (const error of source.errors ?? []) section.append(element('p', 'muted', `${error.symbol}: ${error.error}`));
    if (source.warnings?.length) section.append(element('p', 'muted', `${source.warnings.length} market records have comparison warnings. ${source.warnings[0].warning} Open a company market record for details.`));
    return section;
  }));
  renderPortfolio(data);
  renderAlerts(data);
  if (location.hash === '#research') $('footer-mode').textContent = 'PRIMARY DOCUMENT EVIDENCE · NOT INVESTMENT ADVICE';
}
function renderPortfolio(data) {
  $('portfolio-mode').textContent = `${data.mode === 'demo' ? 'Fictional demo' : data.mode === 'recorded' ? 'Recorded public sources' : 'Cached public sources'} · ${data.portfolio.length} companies · Prices are EOD, not intraday. Filing counts use your Today window.`;
  $('portfolio-grid').replaceChildren(...data.portfolio.map(company => {
    const article = element('article', 'portfolio-card'); const eod = company.eod;
    const heading = element('div', 'portfolio-card-heading');
    heading.append(element('strong', '', company.symbol), element('span', 'muted', company.sector));
    const filings = data.announcements.filter(item => item.symbol === company.symbol).length;
    article.append(heading, element('h3', '', company.name), element('p', 'portfolio-price', eod ? `₹${number(eod.close)}` : 'Price unavailable'), element('p', 'muted', eod ? `${company.market.priceChange === null ? 'Change unavailable' : `${company.market.priceChange >= 0 ? '+' : ''}${company.market.priceChange.toFixed(2)}%`} · ${company.market.volumeRatio === null ? 'Volume unavailable' : `${company.market.volumeRatio.toFixed(2)}× volume`} · Session ${eod.session}` : 'No completed record.'), element('p', 'muted', `${filings} disclosures in the selected window.${company.market.warning ? ` ${company.market.warning}` : ''}`));
    const inspect = element('button', 'detail-button', 'Inspect market record'); inspect.addEventListener('click', () => openMarket(company));
    const research = element('button', 'quiet', `Research ${company.symbol}`); research.addEventListener('click', () => researchCompany(company.symbol));
    article.append(inspect, research); return article;
  }));
}
function syncAlertForm() {
  $('alerts-price').value = preferences.price; $('alerts-volume').value = preferences.volume; $('alerts-delivery').value = preferences.delivery;
  $('alert-categories').replaceChildren(...alertCategories.map(category => {
    const label = element('label', 'category-choice'); const checkbox = element('input');
    checkbox.type = 'checkbox'; checkbox.name = 'category'; checkbox.value = category; checkbox.checked = preferences.categories.includes(category);
    label.append(checkbox, element('span', '', categoryLabel(category))); return label;
  }));
}
function renderAlerts(data) {
  $('alerts-mode').textContent = `${data.mode === 'demo' ? 'Fictional demo' : data.mode === 'recorded' ? 'Recorded source replay' : 'Latest saved sources'} · ${data.hours}-hour filing window. ${data.stale ? 'Data warnings apply; inspect Sources & freshness in Today.' : ''}`;
  if (preferences.delivery === 'paused') { $('alert-matches').replaceChildren(element('p', 'empty', 'In-app alerts are paused. Your briefing and portfolio remain available.')); return; }
  const matches = data.announcements.filter(item => preferences.categories.includes(item.category));
  const signals = data.signals.map(signal => {
    const article = element('article', 'announcement'); article.append(element('h3', '', `${signal.symbol} · ${signal.reasons.join(' + ')} threshold`), element('p', '', `Session ${signal.session} · ${signal.priceChange === null ? 'Price unavailable' : `${signal.priceChange.toFixed(2)}% price`} · ${signal.volumeRatio === null ? 'Volume unavailable' : `${signal.volumeRatio.toFixed(2)}× volume`}`));
    const button = element('button', 'detail-button', 'Inspect calculation →'); button.addEventListener('click', () => openMarket(data.portfolio.find(company => company.symbol === signal.symbol))); article.append(button); return article;
  });
  $('alert-matches').replaceChildren(...matches.map(card), ...signals, ...(!matches.length && !signals.length ? [element('p', 'empty', 'No matching alerts from eligible data. This can mean no threshold was crossed or the source is incomplete; check Today for coverage.')] : []));
}
syncAlertForm();
$('alerts-form').addEventListener('submit', event => {
  event.preventDefault(); preferences.price = Number($('alerts-price').value); preferences.volume = Number($('alerts-volume').value); preferences.delivery = $('alerts-delivery').value;
  preferences.categories = [...$('alert-categories').querySelectorAll('input:checked')].map(input => input.value);
  const saved = persist(); $('alerts-saved').textContent = saved ? 'Preferences saved on this browser.' : 'Preferences apply to this session; browser storage is unavailable.';
  loadBriefing();
});
function showScreen() {
  const screen = ['today', 'portfolio', 'research', 'alerts'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'today';
  for (const name of ['today', 'portfolio', 'research', 'alerts']) $(`screen-${name}`).hidden = name !== screen;
  for (const link of document.querySelectorAll('[data-screen]')) {
    if (link.dataset.screen === screen) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  }
  if (screen === 'alerts') syncAlertForm();
  $('footer-mode').textContent = screen === 'research' ? 'PRIMARY DOCUMENT EVIDENCE · NOT INVESTMENT ADVICE' : `${currentMode === 'demo' ? 'FICTIONAL DATA' : currentMode === 'recorded' ? 'RECORDED PUBLIC DATA' : 'PUBLIC SOURCE DATA'} · NOT INVESTMENT ADVICE`;
  if (screen === 'portfolio' && !currentBriefing) $('portfolio-mode').textContent = 'Portfolio unavailable. Check Today for the data-source status and refresh.';
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', showScreen); showScreen();
async function loadBriefing() {
  const id = ++requestId;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  $('status').className = 'status';
  $('status').textContent = 'Loading your briefing…';
  setModeHeader(preferences.mode);
  $('briefing').hidden = true;
  currentBriefing = null;
  $('portfolio-grid').replaceChildren(); $('portfolio-mode').textContent = 'Loading selected data source…';
  $('alert-matches').replaceChildren(); $('alerts-mode').textContent = 'Loading selected data source…';
  $('refresh').disabled = true;
  try {
    const query = new URLSearchParams({ hours: preferences.hours, price: preferences.price, volume: preferences.volume, mode: preferences.mode });
    const response = await fetch(`/api/briefing?${query}`, { cache: 'no-store', signal: controller.signal });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || 'Briefing unavailable.'); error.fromApi = true; throw error;
    }
    if (id !== requestId) return;
    render(data);
    $('status').textContent = data.mode === 'demo' ? `Demo snapshot · ${time(data.asOf)} · All events and figures are fictional.` : `${data.mode === 'recorded' ? 'Recorded replay' : 'Source snapshot'} · collected ${time(data.snapshotAt)}${data.stale ? ' · Source warnings: check freshness below.' : ''} · Exchange metadata, not AI analysis.`;
    $('briefing').hidden = false;
  } catch (error) {
    if (id !== requestId) return;
    $('status').className = 'status error';
    $('status').textContent = error.fromApi ? error.message : navigator.onLine ? 'Briefing unavailable. Check the server, then choose Refresh briefing.' : 'You’re offline. The FINN shell is available; reconnect and refresh to load the briefing.';
    $('portfolio-mode').textContent = $('status').textContent; $('alerts-mode').textContent = $('status').textContent;
  } finally {
    clearTimeout(timeout);
    if (id === requestId) $('refresh').disabled = false;
  }
}
$('window').addEventListener('change', () => { preferences.hours = Number($('window').value); persist(); loadBriefing(); });
$('data-mode').addEventListener('change', () => { preferences.mode = $('data-mode').value; persist(); loadBriefing(); });
$('refresh').addEventListener('click', loadBriefing);
$('settings-open').addEventListener('click', () => {
  $('price-threshold').value = preferences.price;
  $('volume-threshold').value = preferences.volume;
  $('settings').showModal();
});
$('settings-form').addEventListener('submit', event => {
  event.preventDefault();
  preferences.price = Number($('price-threshold').value);
  preferences.volume = Number($('volume-threshold').value);
  syncAlertForm();
  const saved = persist();
  $('settings').close();
  loadBriefing().then(() => { if (!saved) $('status').textContent += ' Browser storage is unavailable; preferences apply for this session only.'; });
});
for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => $(button.dataset.close).close());
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); pendingInstall = event; $('install').hidden = false;
});
$('install').addEventListener('click', async () => {
  if (!pendingInstall) return;
  await pendingInstall.prompt(); pendingInstall = null; $('install').hidden = true;
});
window.addEventListener('appinstalled', () => { $('install').hidden = true; });
window.addEventListener('online', loadBriefing);
window.addEventListener('offline', () => {
  ++requestId;
  $('briefing').hidden = true;
  $('refresh').disabled = false;
  $('status').className = 'status error';
  $('status').textContent = 'You’re offline. Reconnect and refresh to load the briefing.';
  currentBriefing = null; $('portfolio-grid').replaceChildren(); $('alert-matches').replaceChildren();
  $('portfolio-mode').textContent = $('status').textContent; $('alerts-mode').textContent = $('status').textContent;
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {
  // Online operation remains available if the browser blocks offline support.
  $('status').textContent += ' Offline support could not be enabled.';
});
loadBriefing();
