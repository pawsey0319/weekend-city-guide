(function (W) {
  function score(ev, p, wx) {
    let s = 50;
    const why = [], warn = [];
    if (p.cats.length) {
      if (p.cats.includes(ev.cat)) { s += 22; why.push('符合你喜欢的「' + W.CATS[ev.cat].name + '」'); }
      else s -= 8;
    }
    if (ev.price <= p.budget) {
      s += 12;
      if (ev.price === 0) { s += 6; why.push('免费，0 预算也能玩'); }
      else why.push('在预算内（¥' + ev.price + '）');
    } else {
      const over = ev.price - p.budget;
      s -= Math.min(40, 10 + (over / Math.max(p.budget, 20)) * 30);
      warn.push('超出预算 ¥' + over);
    }
    if (wx) {
      if (wx.rain) {
        if (ev.indoor) { s += 14; why.push('下雨也不受影响'); }
        else { s -= 34; warn.push('降雨概率高，建议改期或备雨具'); }
      } else if (!ev.indoor) { s += 8; why.push('天气不错，适合户外'); }
      if (wx.cold && !ev.indoor) { s -= 10; warn.push('偏冷，注意保暖'); }
      if (wx.hot && !ev.indoor && ev.energy >= 2) { s -= 10; warn.push('偏热，避开正午'); }
    }
    if (p.party < ev.min || p.party > ev.max) {
      s -= 18; warn.push('更适合 ' + ev.min + '-' + ev.max + ' 人');
    } else {
      s += 8;
      if (p.party === 1 && ev.solo) why.push('一个人去也自在');
    }
    if (p.party === 1 && !ev.solo) { s -= 14; warn.push('更适合组队，可以去「组队」发起'); }
    const d = Math.abs(ev.energy - p.energy);
    if (d === 0) { s += 8; why.push(W.ENERGY[ev.energy] + '的强度刚好'); }
    else if (d > 1) s -= 8;
    if (p.quiet) { s += ev.solo ? 8 : -8; if (ev.solo) why.push('低社交压力'); }
    return { score: Math.max(0, Math.min(100, Math.round(s))), why: why.slice(0, 3), warn };
  }
  function rank(p, wx, city) {
    return W.events.filter((e) => e.city === (city || p.city))
      .map((ev) => Object.assign({ ev }, score(ev, p, wx)))
      .sort((a, b) => b.score - a.score);
  }
  function blindBox(p, wx) {
    const pool = rank(p, wx).filter((r) => r.score >= 55).slice(0, 5);
    const list = pool.length ? pool : rank(p, wx).slice(0, 3);
    return list[Math.floor(Math.random() * list.length)];
  }
  function planB(ev, p, wx) {
    return rank(p, wx).find((r) => r.ev.id !== ev.id && r.ev.indoor && r.ev.price <= p.budget + 30);
  }
  W.rec = { score, rank, blindBox, planB };
})(window.WCG);
