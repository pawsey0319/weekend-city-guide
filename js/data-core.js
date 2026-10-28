(function (W) {
  W.CITIES = {
    shanghai: { name: '上海', lat: 31.23, lon: 121.47 },
    beijing: { name: '北京', lat: 39.9, lon: 116.4 },
    guangzhou: { name: '广州', lat: 23.13, lon: 113.26 },
    chengdu: { name: '成都', lat: 30.66, lon: 104.07 }
  };
  W.CATS = {
    walk: { name: 'CityWalk', icon: '🚶' },
    exhibit: { name: '展览', icon: '🖼️' },
    market: { name: '市集', icon: '🛍️' },
    show: { name: '演出', icon: '🎭' },
    hike: { name: '徒步', icon: '🥾' },
    sport: { name: '运动', icon: '🏸' },
    craft: { name: '手作', icon: '🎨' },
    social: { name: '桌游/剧本', icon: '🎲' }
  };
  W.ENERGY = ['', '轻松', '适中', '有点挑战'];
  W.events = [];
  // E(id, city, cat, title, place, price, indoor, hours, solo, min, max, energy, tags, desc, tip)
  W.E = function (id, city, cat, title, place, price, indoor, hours, solo, min, max, energy, tags, desc, tip) {
    W.events.push({ id, city, cat, title, place, price, indoor, hours, solo, min, max, energy, tags, desc, tip });
  };
  W.evById = (id) => W.events.find((e) => e.id === id);
  const cats = () => new Set(W.S.checkins.map((c) => c.cat).filter(Boolean));
  W.BADGES = [
    { id: 'first', icon: '👣', name: '第一步', desc: '完成第 1 次打卡', ok: () => W.S.checkins.length >= 1 },
    { id: 'three', icon: '🎒', name: '周末常客', desc: '累计打卡 3 次', ok: () => W.S.checkins.length >= 3 },
    { id: 'cats3', icon: '🧭', name: '探索家', desc: '体验 3 种不同类型', ok: () => cats().size >= 3 },
    { id: 'free', icon: '🪙', name: '省钱达人', desc: '打卡 2 次免费活动', ok: () => W.S.checkins.filter((c) => c.spend === 0).length >= 2 },
    { id: 'rain', icon: '☔', name: '雨天不宅', desc: '在下雨天完成 1 次打卡', ok: () => W.S.checkins.some((c) => c.rain) },
    { id: 'team', icon: '🤝', name: '一期一会', desc: '参加 1 次组队活动', ok: () => W.S.checkins.some((c) => c.teamId) },
    { id: 'guide', icon: '✍️', name: '攻略作者', desc: '发布 1 篇攻略', ok: () => W.S.guides.length >= 1 }
  ];
})(window.WCG);
