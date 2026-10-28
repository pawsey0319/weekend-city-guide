(function (W) {
  const { h, S, save, mount, clamp, money } = W;
  const MOODS = ['😄', '😌', '🤩', '😴', '🥲'];
  const WEEK = 7 * 864e5;
  const weekIdx = (ts) => Math.floor((ts - 4 * 864e5) / WEEK);

  function streak() {
    const set = new Set(S.checkins.map((c) => weekIdx(c.ts)));
    let w = weekIdx(Date.now());
    if (!set.has(w)) w -= 1;
    let n = 0;
    while (set.has(w)) { n++; w--; }
    return n;
  }
  function resizePhoto(file) {
    return new Promise((ok, no) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 640 / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        ok(cv.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => { URL.revokeObjectURL(url); no(new Error('bad image')); };
      img.src = url;
    });
  }
  function stats() {
    const c = S.checkins;
    const month = new Date().toISOString().slice(0, 7);
    const spend = c.filter((x) => new Date(x.ts).toISOString().slice(0, 7) === month).reduce((a, x) => a + x.spend, 0);
    const cats = new Set(c.map((x) => x.cat).filter(Boolean)).size;
    const st = (n, l) => h('div', { class: 'stat' }, h('b', {}, n), h('span', { class: 'small muted' }, l));
    return h('div', { class: 'card row' }, st(c.length, '累计打卡'), st(streak(), '连续周末'), st(cats, '体验类型'), st('¥' + spend, '本月花费'));
  }
  function badges() {
    return h('div', { class: 'grid g2' }, W.BADGES.map((b) => {
      const got = b.ok();
      return h('div', { class: 'badge' + (got ? ' got' : '') }, h('span', { class: 'bi' }, b.icon),
        h('div', {}, h('b', {}, b.name + (got ? ' ✓' : '')), h('div', { class: 'small muted' }, b.desc)));
    }));
  }
  function item(c, root) {
    return h('article', { class: 'card ev' },
      h('div', { class: 'head' }, h('div', { class: 'emoji' }, c.mood),
        h('div', { class: 'grow' }, h('h3', {}, c.title), h('div', { class: 'muted small' }, new Date(c.ts).toLocaleDateString() + ' · ' + c.place)),
        h('span', { class: 'tag sun' }, '★'.repeat(c.rating) + ' ' + money(c.spend))),
      c.photo ? h('img', { class: 'photo', src: c.photo, alt: c.title + ' 的照片' }) : null,
      c.note ? h('p', { style: 'margin:0' }, c.note) : null,
      h('div', { class: 'row' },
        h('button', { class: 'btn sm', on: { click: () => W.showPoster({ title: c.title, sub: c.mood + ' ' + '★'.repeat(c.rating) + ' · ' + money(c.spend),
          lines: [c.place, c.note || '又完成了一个周末打卡'], foot: new Date(c.ts).toLocaleDateString() + ' · 周末城市探索指南' }) } }, '生成海报'),
        h('button', { class: 'btn sm ghost', on: { click: () => {
          if (!confirm('删除这条打卡？')) return; S.checkins = S.checkins.filter((x) => x.id !== c.id); save(); render(root);
        } } }, '删除')));
  }
  function form(root, evId, teamId) {
    const ev = W.evById(evId);
    const f = { evId: ev ? ev.id : '', title: ev ? ev.title : '', place: ev ? ev.place : '', rating: 4, mood: MOODS[0],
      spend: ev ? ev.price : 0, note: '', photo: '', rain: S.prefs.wx === 'rain' };
    const inp = (k, type, extra) => h('input', Object.assign({ type, value: f[k], on: { input: (e) => { f[k] = type === 'number' ? Math.max(0, +e.target.value || 0) : e.target.value; } } }, extra));
    const moods = h('div', { class: 'row' }, MOODS.map((m) => h('button', { class: 'chip' + (m === f.mood ? ' on' : ''), 'aria-label': '心情 ' + m,
      on: { click: (e) => { f.mood = m; [...moods.children].forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on'); } } }, m)));
    const stars = h('div', { class: 'seg' }, [1, 2, 3, 4, 5].map((n) => h('button', { class: n === f.rating ? 'on' : '',
      on: { click: (e) => { f.rating = n; [...stars.children].forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on'); } } }, n + '★')));
    const preview = h('img', { class: 'photo hide', alt: '照片预览' });
    return h('section', { class: 'card' }, h('h2', {}, '新的打卡'),
      h('label', { class: 'f' }, '去了哪里'), inp('title', 'text', { maxlength: 40, placeholder: '活动或地点名称' }),
      h('label', { class: 'f' }, '地点'), inp('place', 'text', { maxlength: 40, placeholder: '区域 / 场馆' }),
      h('label', { class: 'f' }, '实际花费（元）'), inp('spend', 'number', { min: 0, max: 9999 }),
      h('label', { class: 'f' }, '评分'), stars, h('label', { class: 'f' }, '心情'), moods,
      h('label', { class: 'f' }, '一句话记录'),
      h('textarea', { maxlength: 140, placeholder: '值得二刷吗？有什么要提醒下一个人的？', on: { input: (e) => { f.note = e.target.value; } } }),
      h('label', { class: 'f' }, '照片（可选，压缩后仅存在本机）'),
      h('input', { type: 'file', accept: 'image/*', on: { change: async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try { f.photo = await resizePhoto(file); preview.src = f.photo; preview.classList.remove('hide'); }
        catch (err) { W.toast('这张图片无法读取'); }
      } } }), preview,
      h('div', { class: 'row', style: 'margin-top:14px' },
        h('button', { class: 'btn pri', on: { click: () => {
          if (!f.title.trim()) return W.toast('请填写去了哪里');
          S.checkins.unshift({ id: W.uid(), evId: f.evId, cat: ev ? ev.cat : '', title: clamp(f.title, 40), place: clamp(f.place, 40) || '未填写',
            rating: f.rating, mood: f.mood, spend: f.spend, note: clamp(f.note, 140), photo: f.photo, ts: Date.now(), rain: f.rain, teamId: teamId || '' });
          if (!save()) { S.checkins.shift(); return; }
          W.toast('打卡成功'); location.hash = '#/checkin';
        } } }, '保存打卡'),
        h('button', { class: 'btn ghost', on: { click: () => { location.hash = '#/checkin'; } } }, '取消')));
  }
  function render(root, arg) {
    const [evId, teamId] = (arg || '').split('/');
    if (arg === 'new' || evId) return mount(root, form(root, evId === 'new' ? '' : evId, teamId));
    mount(root, h('section', { class: 'hero' }, h('h1', {}, '打卡记录'), h('p', {}, '记下每个周末去过的地方，攒徽章，也给自己留一份回忆。')),
      h('div', { class: 'row', style: 'margin-bottom:14px' }, h('button', { class: 'btn pri', on: { click: () => { location.hash = '#/checkin/new'; } } }, '＋ 新打卡')),
      stats(), h('h2', { class: 'sec' }, '周末护照'), badges(), h('h2', { class: 'sec' }, '我的足迹'),
      S.checkins.length ? h('div', { class: 'grid g2' }, S.checkins.map((c) => item(c, root))) : h('div', { class: 'card empty' }, '还没有打卡，去过的地方记一笔吧。'));
  }
  W.views = W.views || {};
  W.views.checkin = render;
})(window.WCG);
