(function (W) {
  const WMO = (c) => {
    if (c === 0) return ['晴', '☀️'];
    if (c <= 3) return ['多云', '⛅'];
    if (c === 45 || c === 48) return ['有雾', '🌫️'];
    if (c >= 51 && c <= 57) return ['毛毛雨', '🌦️'];
    if (c >= 61 && c <= 67) return ['雨', '🌧️'];
    if (c >= 71 && c <= 77) return ['雪', '❄️'];
    if (c >= 80 && c <= 82) return ['阵雨', '🌧️'];
    if (c >= 95) return ['雷雨', '⛈️'];
    return ['多云', '⛅'];
  };
  const isRainCode = (c) => (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95;
  const cache = {};
  function classify(date, tmax, tmin, pop, code) {
    const [label, icon] = WMO(code);
    return { date, tmax, tmin, pop, code, label, icon,
      rain: pop >= 50 || isRainCode(code), cold: tmax < 10, hot: tmax >= 32 };
  }
  async function getWeekend(cityKey) {
    if (cache[cityKey]) return cache[cityKey];
    const c = W.CITIES[cityKey];
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&timezone=auto&forecast_days=10';
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 6000);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok) throw new Error('http ' + r.status);
      const d = (await r.json()).daily;
      const out = { live: true, sat: null, sun: null };
      d.time.forEach((t, i) => {
        const wd = new Date(t + 'T00:00:00').getDay();
        const row = classify(t, Math.round(d.temperature_2m_max[i]), Math.round(d.temperature_2m_min[i]),
          d.precipitation_probability_max[i] || 0, d.weather_code[i]);
        if (wd === 6 && !out.sat) out.sat = row;
        if (wd === 0 && !out.sun) out.sun = row;
      });
      cache[cityKey] = out;
      return out;
    } catch (e) {
      return { live: false, sat: null, sun: null };
    } finally {
      clearTimeout(to);
    }
  }
  const OVERRIDES = {
    sunny: { label: '晴', icon: '☀️', rain: false, cold: false, hot: false },
    rain: { label: '雨', icon: '🌧️', rain: true, cold: false, hot: false },
    cold: { label: '偏冷', icon: '🥶', rain: false, cold: true, hot: false },
    hot: { label: '偏热', icon: '🥵', rain: false, cold: false, hot: true }
  };
  function effective(wk, day) {
    const o = W.S.prefs.wx;
    if (o !== 'auto' && OVERRIDES[o]) return Object.assign({ manual: true }, OVERRIDES[o]);
    return wk && wk[day] ? wk[day] : null;
  }
  W.weather = { getWeekend, effective, OVERRIDES };
})(window.WCG);
