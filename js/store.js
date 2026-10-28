(function (W) {
  const KEY = 'wcg.v1';
  const def = () => ({
    prefs: { city: 'shanghai', cats: [], budget: 80, party: 2, energy: 2, quiet: false, wx: 'auto' },
    teams: [], checkins: [], guides: [], liked: [], saved: [],
    plan: { sat: [], sun: [] }, nick: '我'
  });
  function load() {
    const d = def();
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (o && typeof o === 'object') {
        Object.assign(d, o);
        d.prefs = Object.assign(def().prefs, o.prefs || {});
        d.plan = Object.assign(def().plan, o.plan || {});
      }
    } catch (e) { /* ignore corrupt storage */ }
    return d;
  }
  const S = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); return true; }
    catch (e) { W.toast('本机存储空间不足，部分内容没有保存'); return false; }
  }
  const enc = (o) => {
    const b = new TextEncoder().encode(JSON.stringify(o));
    let s = '';
    b.forEach((c) => { s += String.fromCharCode(c); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const dec = (t) => {
    t = String(t).replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) t += '=';
    const s = atob(t);
    const b = Uint8Array.from(s, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(b));
  };
  const shareUrl = (kind, obj) =>
    location.origin + location.pathname + '#/' + kind + '/' + enc(obj);
  W.S = S;
  W.save = save;
  W.enc = enc;
  W.dec = dec;
  W.shareUrl = shareUrl;
})(window.WCG);
