/* Opening TL;DR. The name decodes letter by letter, each glyph rolling
   through the alphabet (A → … → target), then the who/what beats land in order. */
(function () {
  var root = document.getElementById('intro');
  if (!root) return;
  var nameEl = root.querySelector('.intro-name');
  var beats = root.querySelectorAll('.intro-beat');
  var flow = root.querySelector('.intro-flow');
  var nodes = root.querySelectorAll('.flow-node');
  var fill = root.querySelector('.flow-fill');
  var GLYPHS = '#%&*+=<>/\\|$@01';
  var rot = root.querySelector('.rot');
  var WORDS = rot ? rot.getAttribute('data-words').split('|') : [];
  var stats = root.querySelector('.intro-stats');
  var foot = root.querySelector('.intro-foot');
  var NAME = nameEl.getAttribute('data-text');
  var LAST = nameEl.getAttribute('data-accent') || '';
  var token = 0;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* Builds one span per character and pins each to its final glyph width so the
     line doesn't jitter while wider letters roll past. */
  function build() {
    var accentFrom = LAST ? NAME.lastIndexOf(LAST) : -1;
    nameEl.innerHTML = NAME.split('').map(function (ch, i) {
      var cls = 'ch' + (accentFrom >= 0 && i >= accentFrom ? ' last' : '');
      return '<span class="' + cls + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
    }).join('');
    var cells = Array.prototype.slice.call(nameEl.children);
    cells.forEach(function (c) { c.style.width = c.getBoundingClientRect().width + 'px'; });
    cells.forEach(function (c, i) { if (NAME[i] !== ' ') c.textContent = sequenceFor(NAME[i])[0]; });
    return cells;
  }

  function sequenceFor(ch) {
    var code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return seq(65, code);
    if (code >= 97 && code <= 122) return seq(97, code);
    return [ch];
  }
  function seq(from, to) { var s = []; for (var c = from; c <= to; c++) s.push(String.fromCharCode(c)); return s; }

  function roll(cells, alive) {
    var STEP = 26, STAGGER = 55;
    var plans = cells.map(function (c, i) {
      var ch = NAME[i];
      return { el: c, ch: ch, seq: ch === ' ' ? [' '] : sequenceFor(ch), start: i * STAGGER, done: false };
    });
    plans.forEach(function (p) { if (p.ch !== ' ') p.el.textContent = p.seq[0]; });
    return new Promise(function (resolve) {
      var t0 = performance.now();
      (function tick() {
        if (!alive()) return resolve();
        var t = performance.now() - t0, left = 0;
        plans.forEach(function (p) {
          if (p.done) return;
          if (p.ch === ' ') { p.done = true; return; }
          var k = Math.floor((t - p.start) / STEP);
          if (k < 0) { left++; return; }
          if (k >= p.seq.length - 1) {
            p.el.textContent = p.ch; p.el.classList.remove('rolling'); p.el.classList.add('done'); p.done = true;
          } else {
            p.el.textContent = p.seq[k]; p.el.classList.add('rolling'); left++;
          }
        });
        if (left) setTimeout(tick, STEP); else resolve();
      })();
    });
  }

  /* Once the name has landed it keeps glitching with short static bursts. */

  /* Half-width katakana and digits, as in The Matrix. */
  var MX = '\uFF66\uFF71\uFF73\uFF74\uFF75\uFF76\uFF77\uFF79\uFF7A\uFF7B\uFF7C\uFF7D\uFF7E\uFF7F\uFF80\uFF82\uFF83\uFF85\uFF86\uFF87\uFF88\uFF8A\uFF8B\uFF8E\uFF8F\uFF90\uFF91\uFF92\uFF93\uFF94\uFF95\uFF97\uFF98\uFF9C0123456789Z:=*+<>';
  function mxChar() { return MX.charAt(Math.floor(Math.random() * MX.length)); }
  function letterIdx() {
    var out = [];
    NAME.split('').forEach(function (ch, i) { if (/[A-Za-z]/.test(ch)) out.push(i); });
    return out;
  }

  async function fxGlitch(cells, alive) {
    var picks = letterIdx().sort(function () { return Math.random() - 0.5; }).slice(0, 4);
    for (var f = 0; f < 9; f++) {
      if (!alive()) break;
      picks.forEach(function (i) {
        cells[i].classList.add('glitch');
        cells[i].textContent = Math.random() < 0.3 ? NAME[i] : mxChar();
      });
      await sleep(45);
    }
    picks.forEach(function (i) { cells[i].textContent = NAME[i]; cells[i].classList.remove('glitch'); });
  }

  /* TV-static burst: RGB-split slices and jitter over the whole name, twice. */
  async function fxStatic(cells, alive) {
    nameEl.classList.add('static');
    fxGlitch(cells, alive);
    await sleep(420);
    nameEl.classList.remove('static');
    await sleep(140);
    if (!alive()) return;
    nameEl.classList.add('static');
    await sleep(200);
    nameEl.classList.remove('static');
  }

  async function idleName(cells, alive) {
    for (var k = 0; ; k++) {
      await sleep(k === 0 ? 1500 : 2200 + Math.random() * 1600);
      if (!alive()) return;
      await fxStatic(cells, alive);
    }
  }

  /* Mid-Harness style decode: glyph noise that resolves left to right. */
  function scramble(el, alive) {
    var text = el.getAttribute('data-text') || el.textContent;
    el.setAttribute('data-text', text);
    el.innerHTML = text.split('').map(function (ch) { return '<span class="sc">' + ch + '</span>'; }).join('');
    var cells = Array.prototype.slice.call(el.children);
    cells.forEach(function (c) { c.style.width = c.getBoundingClientRect().width + 'px'; });
    var frames = 14, f = 0;
    (function tick() {
      if (!alive()) { el.textContent = text; return; }
      f++;
      cells.forEach(function (c, i) {
        c.textContent = i < (f / frames) * cells.length - 0.5 ? text[i] : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      });
      if (f < frames) setTimeout(tick, 40); else el.textContent = text;
    })();
  }

  /* Measures each word so the lime block can animate its width between them. */
  var rotWidths = [], rotIdx = 0;
  function measureRot() {
    rot.style.transition = 'none';
    rot.style.width = 'auto';
    rotWidths = WORDS.map(function (word) { rot.textContent = word; return Math.ceil(rot.getBoundingClientRect().width); });
    rot.textContent = WORDS[rotIdx];
    rot.style.width = rotWidths[rotIdx] + 'px';
    void rot.offsetWidth;
    rot.style.transition = '';
  }
  function pinRot() {
    if (!rot) return;
    rotIdx = 0;
    rot.setAttribute('data-text', WORDS[0]);
    measureRot();
  }

  async function rotate(alive) {
    for (var i = 1; ; i = (i + 1) % WORDS.length) {
      await sleep(2200);
      if (!alive()) return;
      rotIdx = i;
      rot.style.width = rotWidths[i] + 'px';
      rot.setAttribute('data-text', WORDS[i]);
      rot.classList.remove('swap'); void rot.offsetWidth; rot.classList.add('swap');
      scramble(rot, alive);
    }
  }

  /* A signal sweeps the line; each node lights and decodes as the signal reaches it. */
  async function runFlow(alive) {
    var DUR = 1700;
    var horizontal = window.getComputedStyle(root.querySelector('.flow-line')).display !== 'none';
    fill.style.transition = 'none'; fill.style.transform = 'scaleX(0)';
    void fill.offsetWidth;
    fill.style.transition = 'transform ' + DUR + 'ms linear';
    fill.style.transform = 'scaleX(1)';
    var t0 = performance.now();
    for (var i = 0; i < nodes.length; i++) {
      var at = horizontal ? DUR * (i + 0.5) / nodes.length : i * 260;
      var wait = at - (performance.now() - t0);
      if (wait > 0) await sleep(wait);
      if (!alive()) return;
      nodes[i].classList.add('on');
      scramble(nodes[i].querySelector('.w'), alive);
    }
    var rest = DUR - (performance.now() - t0);
    if (rest > 0) await sleep(rest);
    if (alive()) flow.classList.add('loop');
  }

  function countUp(el, to, dur) {
    return new Promise(function (resolve) {
      var t0 = performance.now();
      (function f() {
        var p = Math.max(0, Math.min(1, (performance.now() - t0) / dur));
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) setTimeout(f, 16); else resolve();
      })();
    });
  }

  function reset() {
    root.classList.remove('go');
    beats.forEach(function (b) { b.classList.remove('in'); });
    nodes.forEach(function (n) { n.classList.remove('on'); });
    flow.classList.remove('loop');
    fill.style.transition = 'none'; fill.style.transform = 'scaleX(0)';
    stats.classList.remove('in');
    foot.classList.remove('in');
    stats.querySelectorAll('b[data-to]').forEach(function (b) { b.textContent = '0'; });
  }

  async function play() {
    var my = ++token;
    function alive() { return my === token; }
    reset();
    pinRot();
    var cells = build();
    root.classList.add('go');
    await sleep(250); if (!alive()) return;
    await roll(cells, alive); if (!alive()) return;
    idleName(cells, alive);
    await sleep(180); if (!alive()) return;
    for (var i = 0; i < beats.length; i++) {
      beats[i].classList.add('in');
      if (rot && beats[i].contains(rot)) scramble(rot, alive);
      await sleep(260); if (!alive()) return;
    }
    if (rot) rotate(alive);
    await sleep(500); if (!alive()) return;
    await runFlow(alive); if (!alive()) return;
    await sleep(150); if (!alive()) return;
    stats.classList.add('in');
    stats.querySelectorAll('b[data-to]').forEach(function (b, k) {
      setTimeout(function () { if (alive()) countUp(b, +b.getAttribute('data-to'), 900); }, k * 90);
    });
    await sleep(900); if (!alive()) return;
    foot.classList.add('in');
  }

  root.querySelector('.intro-replay').addEventListener('click', play);
  root.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = root.getBoundingClientRect();
    root.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    root.style.setProperty('--my', (e.clientY - r.top) + 'px');
    root.classList.add('pointer');
  });
  root.addEventListener('pointerleave', function () { root.classList.remove('pointer'); });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (rot && rotWidths.length) measureRot(); }, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(play); else play();
})();
