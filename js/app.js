(function (W) {
  const root = document.getElementById('view');
  const NAV = { discover: 'discover', plan: 'plan', team: 'team', join: 'team', checkin: 'checkin', guides: 'guides', g: 'guides', insights: 'insights' };

  function parse() {
    const hash = location.hash.replace(/^#\/?/, '');
    const i = hash.indexOf('/');
    const route = (i < 0 ? hash : hash.slice(0, i)) || 'discover';
    const arg = i < 0 ? '' : hash.slice(i + 1);
    return { route, arg };
  }
  function go() {
    const { route, arg } = parse();
    const view = W.views[route];
    W.route = route;
    document.querySelectorAll('#nav a').forEach((a) => {
      const on = a.dataset.r === NAV[route];
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    try {
      if (!view) { location.hash = '#/'; return; }
      view(root, arg);
    } catch (e) {
      console.error(e);
      W.mount(root, W.h('div', { class: 'card empty' }, '页面出了点问题。', W.h('br'), W.h('a', { href: '#/' }, '回到首页')));
    }
    window.scrollTo(0, 0);
    root.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', go);
  go();
})(window.WCG);
