(function (W) {
  const { h } = W;
  // 绘制分享海报并下载 PNG；全部在本机 canvas 完成。
  function poster(o) {
    const cv = document.createElement('canvas');
    cv.width = 750; cv.height = 1000;
    const g = cv.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 750, 1000);
    grad.addColorStop(0, '#1f8a70'); grad.addColorStop(1, '#ffc857');
    g.fillStyle = grad; g.fillRect(0, 0, 750, 1000);
    g.fillStyle = '#fffdf8';
    g.beginPath(); g.roundRect(40, 120, 670, 780, 28); g.fill();
    g.fillStyle = '#fff'; g.font = '600 30px sans-serif';
    g.fillText('🧭 周末城市探索指南', 50, 78);
    g.fillStyle = '#1f2a2e';
    g.font = '700 46px sans-serif';
    wrap(g, o.title, 80, 210, 590, 60, 3);
    g.fillStyle = '#16705a'; g.font = '600 30px sans-serif';
    g.fillText(o.sub || '', 80, 430);
    g.fillStyle = '#44525a'; g.font = '30px sans-serif';
    (o.lines || []).slice(0, 6).forEach((t, i) => wrap(g, t, 80, 500 + i * 56, 590, 40, 1));
    g.fillStyle = '#6b7780'; g.font = '26px sans-serif';
    g.fillText(o.foot || '', 80, 860);
    return cv;
  }
  function wrap(g, text, x, y, maxW, lh, maxLines) {
    let line = '', n = 0;
    for (const ch of String(text || '')) {
      if (g.measureText(line + ch).width > maxW) {
        if (++n >= maxLines) { g.fillText(line.slice(0, -1) + '…', x, y); return; }
        g.fillText(line, x, y); y += lh; line = ch;
      } else line += ch;
    }
    g.fillText(line, x, y);
  }
  function showPoster(o) {
    const cv = poster(o);
    cv.style.cssText = 'width:100%;border-radius:14px';
    const url = cv.toDataURL('image/png');
    W.modal('分享海报', h('div', {}, cv, h('p', { class: 'muted small' }, '保存图片后可发给同学或发朋友圈。')),
      [{ label: '保存图片', cls: 'pri', keep: true, fn: () => {
        const a = h('a', { href: url, download: 'weekend-guide.png' });
        document.body.append(a); a.click(); a.remove();
      } }]);
  }
  W.showPoster = showPoster;
})(window.WCG);
