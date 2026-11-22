
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REPO = 'turlamai/after-the-build';
  var ROOT = document.body.dataset.root || '';
  var PAGE = document.body.dataset.page || '';
  var PREV = document.body.dataset.prev || '';
  var NEXT = document.body.dataset.next || '';

  var bar = $('#progress');
  var ticking = false;
  function updateBar() {
    ticking = false;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  /* Resume memory: chapter pages remember themselves; home offers the way back. */
  if (PAGE && PAGE !== '00-prologue') {
    var t = document.querySelector('h1');
    try { localStorage.setItem('atb:last', JSON.stringify({ url: ROOT + 'ch/' + PAGE + '.html', title: t ? t.textContent : PAGE })); } catch (e) {}
  }
  var last = null;
  try { last = JSON.parse(localStorage.getItem('atb:last') || 'null'); } catch (e) {}
  if (!PAGE && last && last.url) {
    var rt = $('#resume-top');
    if (rt) { rt.innerHTML = '上次读到：<a href="' + last.url + '">' + last.title + ' →</a>'; rt.classList.add('show'); }
  }

  /* Search */
  var input = $('#search-input');
  if (input) {
    var results = $('#search-results');
    var items = [];
    var sel = -1;
    var closeResults = function () { results.innerHTML = ''; items = []; sel = -1; };
    var openResult = function (it) {
      closeResults(); input.blur();
      window.location.href = ROOT + it.url;
    };
    var renderResults = function (q) {
      var lq = q.toLowerCase();
      var hits = [];
      if (lq.length >= 1) {
        (window.SEARCH_INDEX || []).forEach(function (it) {
          var hay = (it.title + ' ' + it.text).toLowerCase();
          var pos = hay.indexOf(lq);
          if (pos !== -1) {
            var start = Math.max(0, pos - 34);
            var snip = (start > 0 ? '…' : '') + (it.title + ' ' + it.text).slice(start, pos + 66) + '…';
            hits.push({ slug: it.slug, title: it.title, url: it.url, snip: snip });
          }
        });
        hits = hits.slice(0, 8);
      }
      results.innerHTML = hits.length
        ? hits.map(function (h, i) {
            var esc = h.snip.replace(/&/g, '&amp;').replace(/</g, '&lt;');
            var idx = esc.toLowerCase().indexOf(lq);
            if (idx !== -1) esc = esc.slice(0, idx) + '<mark>' + esc.slice(idx, idx + lq.length) + '</mark>' + esc.slice(idx + lq.length);
            return '<div class="sr-item" data-i="' + i + '" role="button" tabindex="0"><div class="sr-title">' + h.title + '</div><div class="sr-snippet">' + esc + '</div></div>';
          }).join('')
        : (lq ? '<div class="sr-empty">没有找到「' + q.replace(/</g, '&lt;') + '」</div>' : '');
      items = hits; sel = -1;
      $$('.sr-item', results).forEach(function (el) {
        el.addEventListener('click', function () { openResult(items[+el.dataset.i]); });
      });
    };
    input.addEventListener('input', function () { renderResults(input.value.trim()); });
    input.addEventListener('keydown', function (e) {
      var els = $$('.sr-item', results);
      if (e.key === 'Escape') { closeResults(); input.blur(); return; }
      if (!els.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        sel = e.key === 'ArrowDown' ? Math.min(sel + 1, els.length - 1) : Math.max(sel - 1, 0);
        els.forEach(function (el, i) { el.classList.toggle('sel', i === sel); });
      } else if (e.key === 'Enter' && sel >= 0) {
        openResult(items[sel]);
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && input) { e.preventDefault(); input.focus(); input.select(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/' && input) { e.preventDefault(); input.focus(); return; }
    if (e.key === 'ArrowRight' && NEXT) window.location.href = ROOT + NEXT;
    if (e.key === 'ArrowLeft' && PREV) window.location.href = ROOT + PREV;
  });

  /* Mobile drawer */
  var toggle = $('#toc-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('toc-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    var ov = $('.toc-overlay');
    if (ov) ov.addEventListener('click', function () { document.body.classList.remove('toc-open'); });
    $$('#toc a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('toc-open'); });
    });
  }

  /* Reader font size */
  var SIZES = ['14px', '16px', '18px'];
  var fsIdx = 1;
  try { fsIdx = Math.min(2, Math.max(0, parseInt(localStorage.getItem('atb:fs') || '1', 10) || 1)); } catch (e) {}
  function applyFs() {
    document.documentElement.style.setProperty('--reader-fs', SIZES[fsIdx]);
    try { localStorage.setItem('atb:fs', String(fsIdx)); } catch (e) {}
  }
  applyFs();
  var dec = $('#fs-dec'); var inc = $('#fs-inc');
  if (dec) dec.addEventListener('click', function () { fsIdx = Math.max(0, fsIdx - 1); applyFs(); });
  if (inc) inc.addEventListener('click', function () { fsIdx = Math.min(2, fsIdx + 1); applyFs(); });

  /* Copy buttons on code blocks */
  $$('.chapter pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制代码');
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(pre.innerText.replace(/\n$/, '')).then(function () {
        btn.textContent = '✓ 已复制';
        btn.classList.add('done');
        setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('done'); }, 1600);
      });
    });
    pre.appendChild(btn);
  });

  /* Helpful */
  function thanks(box) {
    var q = box.querySelector('.fb-q');
    if (!q || q.dataset.done) return;
    q.dataset.done = '1';
    q.textContent = '谢谢！已记下你的反馈。';
    var s = box.querySelector('.fb-sub');
    if (s) s.innerHTML = '如果这本书对你有帮助，欢迎到 <a href="https://github.com/turlamai/after-the-build" target="_blank" rel="noopener noreferrer">GitHub 点个 Star</a>，让更多读者看到它。';
    var act = box.querySelector('.fb-actions');
    if (act) act.remove();
  }
  $$('.fb-helpful').forEach(function (btn) {
    var key = 'atb:helpful:' + btn.dataset.key;
    try { if (localStorage.getItem(key) === '1') thanks(btn.closest('.feedback')); } catch (e) {}
    btn.addEventListener('click', function () {
      try { localStorage.setItem(key, '1'); } catch (e) {}
      thanks(btn.closest('.feedback'));
    });
  });

  /* SelectionPill: floating 反馈这段 while the reader selects text in the article */
  if (PAGE) {
    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'selection-pill';
    pill.textContent = '反馈这段';
    pill.style.display = 'none';
    document.body.appendChild(pill);
    var pillQuote = '';
    var pillRaf = 0;
    var updatePill = function () {
      pillRaf = 0;
      var article = document.querySelector('article.chapter');
      var s = window.getSelection();
      var text = s && !s.isCollapsed ? s.toString().replace(/\s+/g, ' ').trim() : '';
      var ok = text.length >= 2 && text.length <= 500 && !!s && !!article && article.contains(s.anchorNode);
      var rect = ok ? s.getRangeAt(0).getBoundingClientRect() : null;
      ok = !!(ok && rect && (rect.width || rect.height) && rect.bottom > 0 && rect.top < window.innerHeight);
      if (!ok) { pill.style.display = 'none'; pillQuote = ''; return; }
      pillQuote = text;
      pill.style.display = 'block';
      pill.style.top = Math.max(8, rect.top - 44) + 'px';
      pill.style.left = (rect.left + rect.width / 2) + 'px';
    };
    var schedulePill = function () {
      if (pillRaf) cancelAnimationFrame(pillRaf);
      pillRaf = requestAnimationFrame(updatePill);
    };
    document.addEventListener('selectionchange', schedulePill);
    window.addEventListener('scroll', function () { if (pill.style.display === 'block') schedulePill(); }, { passive: true });
    window.addEventListener('resize', schedulePill);
    pill.addEventListener('mousedown', function (e) { e.preventDefault(); });
    pill.addEventListener('click', function () {
      if (!pillQuote) return;
      var t = (document.querySelector('h1') || {}).textContent || PAGE;
      var u = 'https://github.com/' + REPO + '/issues/new?' + new URLSearchParams({
        title: '【反馈】' + t + '——选中段落',
        body: '章节链接：' + location.href + '\n\n> ' + pillQuote + '\n\n问题描述：\n',
      }).toString();
      window.open(u, '_blank', 'noopener,noreferrer');
      window.getSelection().removeAllRanges();
      pill.style.display = 'none';
    });
  }

  /* Home: deep links from the old single-page era -> chapter pages */
  if (!PAGE && window.SEARCH_INDEX && location.hash.length > 1) {
    var target = (window.SEARCH_INDEX.filter(function (it) { return '#' + it.slug === location.hash; }))[0];
    if (target) location.replace(ROOT + target.url);
  }
})();
