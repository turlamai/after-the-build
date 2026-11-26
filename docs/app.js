
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REPO = 'turlamai/fundamentals';
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
    try { localStorage.setItem('atb:last', JSON.stringify({ url: 'ch/' + PAGE + '.html', title: t ? t.textContent : PAGE })); } catch (e) {}
  }
  var last = null;
  try { last = JSON.parse(localStorage.getItem('atb:last') || 'null'); } catch (e) {}
  if (!PAGE && last && last.url) {
    var rt = $('#resume-top');
    if (rt) { var entry = (window.SEARCH_INDEX || []).find(function (it) { return last.url === it.url || last.url === '../' + it.url; }); if (entry) { var link = document.createElement('a'); link.href = ROOT + entry.url; link.textContent = entry.title + ' →'; rt.textContent = '上次读到：'; rt.appendChild(link); rt.classList.add('show'); } }
  }

  /* Sidebar collapse (desktop, chapter pages) — racket parity. */
  var collapseBtn = $('#toc-collapse');
  if (collapseBtn) {
    try { if (localStorage.getItem('atb:toc') === 'hidden') document.body.classList.add('toc-hidden'); } catch (e) {}
    collapseBtn.setAttribute('aria-expanded', document.body.classList.contains('toc-hidden') ? 'false' : 'true');
    if (document.body.classList.contains('toc-hidden')) collapseBtn.textContent = '›';
    collapseBtn.addEventListener('click', function () {
      var hidden = document.body.classList.toggle('toc-hidden');
      collapseBtn.setAttribute('aria-expanded', hidden ? 'false' : 'true');
      collapseBtn.textContent = hidden ? '›' : '‹';
      try { localStorage.setItem('atb:toc', hidden ? 'hidden' : 'open'); } catch (e) {}
    });
  }

  /* Anchor the sidebar on the active chapter: load -> scroll it into view, centered. */
  var activeLink = $('#toc a.active');
  var tocEl = $('#toc');
  if (activeLink && tocEl) {
    var target = activeLink.offsetTop - tocEl.clientHeight / 2 + activeLink.offsetHeight / 2;
    tocEl.scrollTop = Math.max(0, target);
  }

  /* Per-part collapse in the sidebar (racket parity). */
  $$('.part-toggle').forEach(function (btn) {
    var key = 'atb:part:' + btn.dataset.part;
    var ul = document.querySelector('[data-part-ul="' + btn.dataset.part + '"]');
    if (!ul) return;
    try { if (localStorage.getItem(key) === 'collapsed') { ul.classList.add('collapsed'); btn.setAttribute('aria-expanded', 'false'); } } catch (e) {}
    btn.addEventListener('click', function () {
      var collapsed = ul.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      try { localStorage.setItem(key, collapsed ? 'collapsed' : 'open'); } catch (e) {}
    });
  });

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
      navigator.clipboard.writeText(pre.querySelector('code').textContent.replace(/\n$/, '')).then(function () {
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
    if (s) s.innerHTML = '如果这本书对你有帮助，欢迎到 <a href="https://github.com/' + REPO + '" target="_blank" rel="noopener noreferrer">GitHub 点个 Star</a>，让更多读者看到它。';
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

  /* Lightbox: click a diagram to enlarge; Esc or click anywhere to close. */
  var box = $('#lightbox');
  if (box) {
    var holder = box.querySelector('.lb-holder');
    var caption = box.querySelector('.lb-caption');
    var source = null;
    function renderBox() {
      if (!source) return;
      var vb = (source.getAttribute('viewBox') || '').split(/\s+/);
      var clone_ = holder.querySelector('svg');
      if (vb.length === 4) {
        var ratio = vb[2] / vb[3];
        var maxW = window.innerWidth * 0.94;
        var maxH = (window.innerHeight - 70) * 0.96;
        var w = maxH * ratio <= maxW ? maxH * ratio : maxW;
        clone_.style.width = Math.round(w) + 'px';
        clone_.style.height = Math.round(w / ratio) + 'px';
      }
    }
    function openBox(svg) {
      source = svg;
      holder.innerHTML = '';
      var clone = svg.cloneNode(true);
      clone.removeAttribute('width');
      clone.removeAttribute('height');
      clone.style.cursor = 'zoom-out';
      holder.appendChild(clone);
      caption.textContent = svg.getAttribute('aria-label') || '';
      renderBox();
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
    }
    function closeBox() {
      source = null;
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
    }
    $$('article.chapter svg').forEach(function (svg) {
      svg.addEventListener('click', function () { openBox(svg); });
    });
    box.addEventListener('click', closeBox);
    window.addEventListener('resize', function () { if (source) renderBox(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('open')) closeBox();
    });
  }

  /* Home: deep links from the old single-page era -> chapter pages */
  if (!PAGE && window.SEARCH_INDEX && location.hash.length > 1) {
    var legacy = {"06-os":"07-os","07-data-shapes":"08-data-shapes","08-network":"09-network","09-cloud":"10-cloud","10-ai-landscape":"11-ai-landscape","11-ai-collab":"12-ai-collab","12-deploy":"13-deploy","13-debug":"14-debug","14-secrets":"15-secrets","15-cost":"16-cost","16-data":"17-data","17-versions":"18-versions","18-security":"19-security","19-crypto":"20-crypto","20-privacy":"21-privacy","21-ask-for-help":"22-ask-for-help","22-maintenance":"23-maintenance","23-50-questions":"24-50-questions"};
    var target = (window.SEARCH_INDEX.filter(function (it) { return '#' + it.slug === (legacy[location.hash.slice(1)] ? '#' + legacy[location.hash.slice(1)] : location.hash); }))[0];
    if (target) location.replace(ROOT + target.url);
  }
})();
