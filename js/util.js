window.WCG = window.WCG || {};
(function (W) {
  function add(el, kids) {
    for (const k of kids.flat(Infinity)) {
      if (k == null || k === false) continue;
      el.append(k.nodeType ? k : document.createTextNode(String(k)));
    }
  }
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    const late = {};
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'on') for (const [e, f] of Object.entries(v)) el.addEventListener(e, f);
      else if (k === 'value' || k === 'checked' || k === 'selected') late[k] = v;
      else if (k === 'disabled') el.disabled = true;
      else el.setAttribute(k, v === true ? '' : v);
    }
    add(el, kids);
    Object.assign(el, late);
    return el;
  }
  function mount(root, ...kids) {
    root.replaceChildren();
    add(root, kids);
  }
  let tt;
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => t.classList.remove('show'), 2400);
  }
  function modal(title, body, actions) {
    const bg = h('div', { class: 'modal-bg', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
    const close = () => { bg.remove(); document.removeEventListener('keydown', esc); };
    const esc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
    bg.addEventListener('click', (e) => { if (e.target === bg) close(); });
    const box = h('div', { class: 'modal' }, h('h2', {}, title), body,
      h('div', { class: 'row', style: 'margin-top:14px;justify-content:flex-end' },
        (actions || []).map((a) => h('button', { class: 'btn ' + (a.cls || ''),
          on: { click: () => { if (a.fn) a.fn(); if (!a.keep) close(); } } }, a.label)),
        h('button', { class: 'btn ghost', on: { click: close } }, '关闭')));
    bg.append(box);
    document.body.append(bg);
    return close;
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('已复制'); return true; }
    catch (e) {
      const ta = h('textarea', { style: 'position:fixed;opacity:0' }, text);
      document.body.append(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove();
      toast(ok ? '已复制' : '复制失败，请手动选择文字');
      return ok;
    }
  }
  const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const money = (n) => (n === 0 ? '免费' : '¥' + n);
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const clamp = (s, n) => String(s == null ? '' : s).slice(0, n);
  const nextWeekend = () => {
    const d = new Date();
    const add = (6 - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + add);
    return ymd(d);
  };
  Object.assign(W, { h, mount, toast, modal, copy, uid, money, ymd, clamp, nextWeekend, add });
})(window.WCG);
