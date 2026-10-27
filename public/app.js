const $ = id => document.getElementById(id);
const defaults = { hours: 24, price: 3, volume: 2 };
let preferences = { ...defaults };
let requestId = 0;
let pendingInstall;
try {
  const saved = JSON.parse(localStorage.getItem('finn.preferences.v1'));
  if ([24, 72, 168].includes(saved?.hours)) preferences.hours = saved.hours;
  if (Number.isFinite(saved?.price) && saved.price >= 0.1 && saved.price <= 50) preferences.price = saved.price;
  if (Number.isFinite(saved?.volume) && saved.volume >= 1 && saved.volume <= 20) preferences.volume = saved.volume;
} catch { /* Browser storage may be disabled or contain an older format. */ }
$('window').value = preferences.hours;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
const time = value => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) + ' IST';
const categoryLabel = value => value.replaceAll('_', ' ');
function persist() {
  try { localStorage.setItem('finn.preferences.v1', JSON.stringify(preferences)); return true; }
  catch { return false; }
}
function openDetail(item) {
  $('detail-symbol').textContent = `${item.symbol} / ${categoryLabel(item.category)}`;
  $('detail-title').textContent = item.title;
  $('detail-time').textContent = `${time(item.publishedAt)} · Fictional scenario`;
  $('detail-summary').textContent = item.summary;
  $('detail-why').textContent = item.why;
  $('detail-evidence').textContent = item.source.evidence;
  $('detail').showModal();
}
function card(item) {
  const article = element('article', 'announcement');
  const meta = element('div', 'card-meta');
  meta.append(element('span', 'symbol', item.symbol), element('span', 'category', categoryLabel(item.category)), element('span', '', time(item.publishedAt)));
  const why = element('p', 'why', item.why);
  const button = element('button', 'detail-button', 'View scenario & evidence status →');
  button.setAttribute('aria-label', `View scenario: ${item.title}`);
  button.addEventListener('click', () => openDetail(item));
  article.append(meta, element('h3', '', item.title), element('p', '', item.summary), why, button);
  return article;
}
function render(data) {
  $('material-count').textContent = data.counts.material;
  $('signal-count').textContent = data.counts.signals;
  $('portfolio-count').textContent = data.portfolio.length;
  const material = data.announcements.filter(item => !item.routine);
  $('announcements').replaceChildren(...(material.length ? material.map(card) : [element('p', 'empty', 'No material announcements in this window. Try a wider period.')]));
  $('routine-items').replaceChildren(...data.announcements.filter(item => item.routine).map(card));
  $('routine-label').textContent = `${data.counts.routine} routine disclosures · lower priority`;
  $('routine').hidden = !data.counts.routine;
  $('threshold-caption').textContent = `Your thresholds: ±${data.thresholds.price}% price or ${data.thresholds.volume}× volume.`;
  const signals = data.signals.map(signal => {
    const row = element('div', 'signal');
    const header = element('div', 'signal-header');
    header.append(element('strong', '', signal.symbol), element('span', `move ${signal.priceChange < 0 ? 'negative' : 'positive'}`, signal.priceChange === null ? 'N/A' : `${signal.priceChange >= 0 ? '+' : ''}${signal.priceChange.toFixed(1)}%`));
    row.append(header, element('small', '', `${signal.volumeRatio === null ? 'Volume unavailable' : `${signal.volumeRatio.toFixed(1)}× volume`} · ${signal.reasons.map(r => r === 'price' ? 'Price trigger' : 'Volume trigger').join(' + ')}`));
    return row;
  });
  $('signals').replaceChildren(...(signals.length ? signals : [element('p', 'empty', 'No companies cross these thresholds. Your radar is clear.')]));
  $('portfolio').replaceChildren(...data.portfolio.map(company => {
    const li = element('li'); li.append(element('span', '', company.symbol), element('span', '', company.sector)); return li;
  }));
}
async function loadBriefing() {
  const id = ++requestId;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  $('status').className = 'status';
  $('status').textContent = 'Loading your briefing…';
  $('briefing').hidden = true;
  $('refresh').disabled = true;
  try {
    const query = new URLSearchParams({ hours: preferences.hours, price: preferences.price, volume: preferences.volume });
    const response = await fetch(`/api/briefing?${query}`, { cache: 'no-store', signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Briefing unavailable.');
    if (id !== requestId) return;
    render(data);
    $('status').textContent = `Demo snapshot · ${time(data.asOf)} · All events and figures are fictional.`;
    $('briefing').hidden = false;
  } catch {
    if (id !== requestId) return;
    $('status').className = 'status error';
    $('status').textContent = navigator.onLine ? 'Briefing unavailable. Check the server, then choose Refresh briefing.' : 'You’re offline. The FINN shell is available; reconnect and refresh to load the briefing.';
  } finally {
    clearTimeout(timeout);
    if (id === requestId) $('refresh').disabled = false;
  }
}
$('window').addEventListener('change', () => { preferences.hours = Number($('window').value); persist(); loadBriefing(); });
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
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {
  // Online operation remains available if the browser blocks offline support.
  $('status').textContent += ' Offline support could not be enabled.';
});
loadBriefing();
