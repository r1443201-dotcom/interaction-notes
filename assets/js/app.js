/* Interaction Notes renderer. See AGENTS.md before editing. */
'use strict';
const CATEGORY = Object.freeze({
  hci: { label: '人機互動', symbol: '◎' },
  ai: { label: '人工智慧', symbol: '✳' },
  research: { label: '研究方法', symbol: '⌘' }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
function safe(value) { return escapeHtml(value ?? ''); }
function noteUrl(id) { return `./note.html?id=${encodeURIComponent(id)}`; }
function categoryInfo(id) { return CATEGORY[id] || { label: '未分類', symbol: '◇' }; }
function noteCard(note) {
  const category = categoryInfo(note.category);
  return `<a class="note-card" href="${noteUrl(note.id)}" aria-label="閱讀筆記：${safe(note.title)}">
    <div class="note-color ${safe(note.category)}"><span class="note-color-icon" aria-hidden="true">${category.symbol}</span><span class="note-color-id">${safe(note.category.toUpperCase())} / NOTE</span></div>
    <div class="note-content"><div class="note-meta"><span class="meta-category">${category.label}</span><span>${safe(note.readingMinutes)} MIN READ</span></div>
    <h3>${safe(note.title)}</h3><p>${safe(note.summary)}</p>
    <span class="note-link">閱讀筆記 <span aria-hidden="true">↗</span></span></div></a>`;
}
async function loadNotes() {
  const response = await fetch('./data/notes.json', {cache: 'no-store'});
  if (!response.ok) throw new Error(`載入失敗（HTTP ${response.status}）`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('資料格式必須是陣列');
  return data;
}
function showLoadError(target) {
  target.innerHTML = '<p class="error-copy">無法載入筆記。請確認使用本機伺服器（例如 python -m http.server 8000），不要直接雙擊 HTML 檔案。</p>';
}
function renderHome(notes) {
  const area = document.querySelector('#featured-notes');
  const count = document.querySelector('#home-note-count');
  if (count) count.textContent = String(notes.length).padStart(2, '0');
  area.innerHTML = notes.filter(n => n.featured).slice(0,3).map(noteCard).join('') || '<p class="empty-state">目前沒有精選筆記。</p>';
}
function renderLibrary(notes) {
  const input = document.querySelector('#search-input');
  const buttons = [...document.querySelectorAll('[data-category]')];
  const area = document.querySelector('#all-notes');
  const counter = document.querySelector('#result-count');
  const queryCategory = new URLSearchParams(location.search).get('category');
  let selected = Object.hasOwn(CATEGORY, queryCategory) ? queryCategory : 'all';
  function draw() {
    const query = input.value.trim().toLocaleLowerCase();
    buttons.forEach(button => {
      const active = button.dataset.category === selected;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const results = notes.filter(n => {
      const inCategory = selected === 'all' || n.category === selected;
      const searchableText = [n.title, n.summary, ...n.tags].join(' ').toLocaleLowerCase();
      return inCategory && searchableText.includes(query);
    });
    counter.textContent = `共 ${results.length} 篇`; 
    area.innerHTML = results.length ? results.map(noteCard).join('') : '<p class="empty-state">找不到符合條件的筆記，請嘗試不同關鍵字或分類。</p>';
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.category;
    const url = new URL(location.href);
    if (selected === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', selected);
    history.replaceState({}, '', url);
    draw();
  }));
  input.addEventListener('input', draw);
  draw();
}
function renderDetail(notes) {
  const area = document.querySelector('#note-root');
  const id = new URLSearchParams(location.search).get('id');
  const note = notes.find(n => n.id === id);
  if (!note) {
    document.title = '找不到筆記｜交互筆記';
    area.innerHTML = '<div class="empty-state"><h1>找不到這篇筆記</h1><p>網址可能有誤，或文章已經移除。</p><a class="text-link" href="./library.html">返回全部筆記 →</a></div>';
    return;
  }
  document.title = `${note.title}｜交互筆記`;
  const sections = note.sections.map(section => `<section><h2>${safe(section.heading)}</h2>
    ${(section.paragraphs || []).map(p => `<p>${safe(p)}</p>`).join('')}
    ${(section.bullets?.length) ? `<ul>${section.bullets.map(item => `<li>${safe(item)}</li>`).join('')}</ul>` : ''}</section>`).join('');
  const related = notes.filter(n => n.category === note.category && n.id !== note.id).slice(0,2);
  area.innerHTML = `<a class="article-back" href="./library.html">← 返回全部筆記</a>
    <header class="article-heading"><span class="article-category">${categoryInfo(note.category).label}</span><h1>${safe(note.title)}</h1><p class="article-summary">${safe(note.summary)}</p><div class="article-meta"><span>發布日期 ${safe(note.published)}</span><span>閱讀時間 ${safe(note.readingMinutes)} 分鐘</span><span>${safe(note.sections.length)} 個段落</span></div></header>
    <div class="article-body">${sections}<div class="article-tags">${note.tags.map(tag => `<span># ${safe(tag)}</span>`).join('')}</div></div>
    ${related.length ? `<aside class="related-area"><h2>同分類的其他筆記</h2>${related.map(n => `<a href="${noteUrl(n.id)}">${safe(n.title)} <span aria-hidden="true">↗</span></a>`).join('')}</aside>` : ''}`;
}
(async function main() {
  const page = document.body.dataset.page;
  if (!['home','library','note'].includes(page)) return;
  const target = document.querySelector(page === 'home' ? '#featured-notes' : page === 'library' ? '#all-notes' : '#note-root');
  try {
    const notes = await loadNotes();
    if (page === 'home') renderHome(notes);
    else if (page === 'library') renderLibrary(notes);
    else renderDetail(notes);
  } catch (error) { console.error(error); showLoadError(target); }
})();
