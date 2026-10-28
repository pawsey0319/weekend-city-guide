(function (W) {
  const { h, S, save, mount, clamp } = W;
  const DRE = /^\d{4}-\d{2}-\d{2}$/, TRE = /^\d{2}:\d{2}$/;

  function inviteText(t) {
    const ev = W.evById(t.evId);
    const per = (ev ? ev.price : 0) + (t.extra || 0);
    return ['【周末组队】' + t.title, '时间：' + t.date + ' ' + t.time, '集合：' + t.meet,
      '人均约 ¥' + per + '（AA）' + (t.once ? '｜一期一会，活动结束各自回家' : ''),
      t.note ? '备注：' + t.note : '', '接龙（' + t.members.length + '/' + t.cap + '）：',
      ...t.members.map((m, i) => (i + 1) + '. ' + m), '链接：' + W.shareUrl('join', payload(t))].filter(Boolean).join('\n');
  }
  const payload = (t) => ({ t: t.title, e: t.evId, d: t.date, tm: t.time, m: t.meet, c: t.cap, o: t.once ? 1 : 0, n: t.note, h: t.members[0] });
  function safetyText(t) {
    return ['【行程分享】我' + t.date + ' ' + t.time + '参加「' + t.title + '」', '集合地点：' + t.meet,
      '同行人数：' + t.members.length + ' 人（接龙见群）', '预计结束后我会报平安。紧急联系人：' + (t.sos || '未填写')].join('\n');
  }

  function detail(root, id) {
    const t = S.teams.find((x) => x.id === id);
    if (!t) return mount(root, h('div', { class: 'card empty' }, '没有找到这个小队。', h('br'), h('a', { href: '#/team' }, '返回组队')));
    const ev = W.evById(t.evId);
    const per = (ev ? ev.price : 0) + (t.extra || 0);
    const again = () => detail(root, id);
    const addInput = h('input', { type: 'text', maxlength: 12, placeholder: '输入接龙里的昵称' });
    mount(root,
      h('p', {}, h('a', { href: '#/team' }, '← 全部小队')),
      h('section', { class: 'card ev' },
        h('h1', { style: 'margin:0' }, t.title),
        h('div', { class: 'meta' }, h('span', { class: 'tag' }, t.date + ' ' + t.time), h('span', { class: 'tag' }, '集合：' + t.meet),
          t.once ? h('span', { class: 'tag acc' }, '一期一会') : null, t.closed ? h('span', { class: 'tag sun' }, '已结束') : null),
        t.note ? h('p', { class: 'muted' }, t.note) : null),
      h('h2', { class: 'sec' }, '成员 ' + t.members.length + '/' + t.cap),
      h('div', { class: 'card' },
        h('div', { class: 'row' }, t.members.map((m, i) => h('span', { class: 'chip on' }, m + ' ',
          i && t.host ? h('button', { class: 'btn sm ghost', 'aria-label': '移除 ' + m,
            on: { click: () => { t.members.splice(i, 1); save(); again(); } } }, '×') : null))),
        t.host ? h('div', { class: 'row', style: 'margin-top:10px' }, addInput,
          h('button', { class: 'btn sm', on: { click: () => {
            const n = clamp(addInput.value.trim(), 12);
            if (!n) return; if (t.members.length >= t.cap) return W.toast('已满员');
            t.members.push(n); save(); again();
          } } }, '添加成员')) : null,
        h('p', { class: 'small muted' }, '提示：各人的报名在自己手机里。队长把群里接龙的名字添到这里，再复制接龙文字更新到群。')),
      h('h2', { class: 'sec' }, '费用 AA'),
      h('div', { class: 'card' },
        h('p', {}, '活动 ¥' + (ev ? ev.price : 0) + ' + 其他每人 ¥', h('input', { type: 'number', min: 0, max: 999, value: t.extra || 0, style: 'width:90px;display:inline-block',
          on: { change: (e) => { t.extra = Math.max(0, Math.min(999, +e.target.value || 0)); save(); again(); } } }), '（交通/餐饮）'),
        h('p', {}, h('b', {}, '人均约 ¥' + per), h('span', { class: 'muted small' }, ' · 全队 ¥' + per * t.members.length))),
      h('h2', { class: 'sec' }, '安全清单'),
      h('div', { class: 'card' },
        h('ul', { class: 'small', style: 'margin:0 0 8px;padding-left:1.1em' },
          h('li', {}, '在地铁口、商场等公共场所集合，不去陌生人指定的私人场所'),
          h('li', {}, '活动尽量在白天或晚高峰前结束，晚间活动结伴返程'),
          h('li', {}, '出发前把行程发给室友或家人，结束后报平安'),
          h('li', {}, '对方要求提前转账、拉进陌生群或有不适，请立刻退出')),
        h('label', { class: 'f' }, '紧急联系人（会写进行程分享文字）'),
        h('input', { type: 'text', maxlength: 30, value: t.sos || '', placeholder: '例如：室友小李 138xxxx',
          on: { change: (e) => { t.sos = clamp(e.target.value, 30); save(); } } }),
        h('div', { class: 'row', style: 'margin-top:10px' },
          h('button', { class: 'btn sm', on: { click: () => W.copy(safetyText(t)) } }, '复制行程分享'))),
      h('div', { class: 'row sec' },
        h('button', { class: 'btn pri', on: { click: () => W.copy(inviteText(t)) } }, '复制接龙+邀请链接'),
        h('button', { class: 'btn', on: { click: () => W.copy(W.shareUrl('join', payload(t))) } }, '只复制链接'),
        h('button', { class: 'btn acc', on: { click: () => { t.closed = true; save(); location.hash = '#/checkin/' + t.evId + '/' + t.id; } } }, '活动结束，去打卡'),
        h('button', { class: 'btn ghost', on: { click: () => {
          if (!confirm('删除这个小队？')) return; S.teams = S.teams.filter((x) => x.id !== id); save(); location.hash = '#/team';
        } } }, '删除')));
  }

  function join(root, raw) {
    let p;
    try { p = W.dec(raw); } catch (e) { p = null; }
    if (!p || typeof p !== 'object' || !DRE.test(p.d || '') || !TRE.test(p.tm || '')) {
      return mount(root, h('div', { class: 'card empty' }, '这个邀请链接无法识别，请让队长重新发送。', h('br'), h('a', { href: '#/' }, '去首页')));
    }
    const t = { id: W.uid(), evId: clamp(p.e, 12), title: clamp(p.t, 40), date: p.d, time: p.tm, meet: clamp(p.m, 40),
      cap: Math.max(2, Math.min(12, parseInt(p.c, 10) || 6)), note: clamp(p.n, 120), once: !!p.o, host: false, extra: 0,
      members: [clamp(p.h, 12) || '队长'], created: Date.now() };
    mount(root, h('h1', {}, '你被邀请加入一个小队'),
      h('div', { class: 'card ev' }, h('h2', { style: 'margin:0' }, t.title),
        h('div', { class: 'meta' }, h('span', { class: 'tag' }, t.date + ' ' + t.time), h('span', { class: 'tag' }, '集合：' + t.meet),
          t.once ? h('span', { class: 'tag acc' }, '一期一会') : null),
        t.note ? h('p', { class: 'muted' }, t.note) : null,
        h('p', { class: 'note' }, '请先确认集合地点是公共场所，并与队长在群里核对名单。内容来自链接，请自行判断可信度。'),
        h('div', { class: 'row' },
          h('button', { class: 'btn pri', on: { click: () => {
            t.members.push(S.nick); S.teams.unshift(t); save(); location.hash = '#/team/' + t.id;
          } } }, '加入并保存'),
          h('a', { class: 'btn ghost', href: '#/' }, '先看看别的'))));
  }
  W.views = W.views || {};
  W.views.teamDetail = detail;
  W.views.join = join;
})(window.WCG);
