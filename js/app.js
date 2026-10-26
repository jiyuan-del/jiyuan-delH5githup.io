(function () {
  'use strict';
  const TOTAL = 10;
  const phone = document.querySelector('.phone');
  const pager = document.getElementById('pager');
  const dotsBox = document.getElementById('dots');
  const pageInd = document.getElementById('pageInd');
  let cur = 0;

  /* ---------- 翻页 ---------- */
  function setTransform() {
    pager.style.transform = 'translateY(' + (-cur * phone.clientHeight) + 'px)';
  }
  function updateUI() {
    pageInd.textContent = String(cur + 1).padStart(2, '0') + ' / ' + TOTAL;
    [...dotsBox.children].forEach((d, i) => d.classList.toggle('on', i === cur));
  }
  function goTo(n) {
    n = Math.max(0, Math.min(TOTAL - 1, n));
    cur = n;
    setTransform();
    updateUI();
    if (n === 8) buildPoster();
  }

  /* ---------- 圆点导航 ---------- */
  for (let i = 0; i < TOTAL; i++) {
    const b = document.createElement('b');
    b.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(b);
  }

  /* ---------- 通用 data-goto 按钮 ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-goto]');
    if (t) { goTo(parseInt(t.getAttribute('data-goto'), 10)); }
  });

  /* ---------- 滑动翻页（移动端） ---------- */
  let sy = null, sx = null, moved = 0, swiping = false;
  const vp = document.querySelector('.viewport');
  vp.addEventListener('touchstart', (e) => {
    sy = e.touches[0].clientY; sx = e.touches[0].clientX; moved = 0; swiping = true;
  }, { passive: true });
  vp.addEventListener('touchmove', (e) => {
    if (!swiping) return;
    moved = Math.max(moved, Math.abs(e.touches[0].clientY - sy));
  }, { passive: true });
  vp.addEventListener('touchend', (e) => {
    if (sy == null) return;
    const dy = sy - e.changedTouches[0].clientY;
    const dx = sx - e.changedTouches[0].clientX;
    swiping = false;
    if (moved > 50) { sy = null; return; }            // 视为内容滚动
    if (Math.abs(dy) < 55 || Math.abs(dx) > Math.abs(dy)) { sy = null; return; }
    goTo(cur + (dy > 0 ? 1 : -1));
    sy = null;
  }, { passive: true });

  /* ---------- 滚轮翻页（桌面预览） ---------- */
  let wheelLock = false;
  vp.addEventListener('wheel', (e) => {
    if (wheelLock) return;
    if (Math.abs(e.deltaY) < 18) return;
    wheelLock = true;
    goTo(cur + (e.deltaY > 0 ? 1 : -1));
    setTimeout(() => (wheelLock = false), 750);
  }, { passive: true });

  window.addEventListener('resize', setTransform);

  /* ---------- 锁定滚动容器（overflow:hidden 仍可能被触摸回弹/聚焦滚动带偏，导致翻页错位） ---------- */
  function lockScroll() {
    if (vp.scrollTop !== 0) vp.scrollTop = 0;
    if (vp.scrollLeft !== 0) vp.scrollLeft = 0;
    if (phone.scrollTop !== 0) phone.scrollTop = 0;
    if (document.documentElement.scrollTop !== 0) document.documentElement.scrollTop = 0;
  }
  document.addEventListener('scroll', lockScroll, true);
  lockScroll();

  /* ---------- 诗词弹窗 ---------- */
  const poemModal = document.getElementById('poemModal');
  document.getElementById('openPoem').addEventListener('click', () => poemModal.classList.add('show'));
  document.getElementById('closePoem').addEventListener('click', () => poemModal.classList.remove('show'));
  poemModal.addEventListener('click', (e) => { if (e.target === poemModal) poemModal.classList.remove('show'); });

  /* ---------- 风光轮播 ---------- */
  const track = document.getElementById('carTrack');
  const carDots = document.getElementById('carDots');
  let cIdx = 0;
  const slides = track.children.length;
  for (let i = 0; i < slides; i++) {
    const d = document.createElement('i');
    if (i === 0) d.classList.add('on');
    d.addEventListener('click', () => setCar(i));
    carDots.appendChild(d);
  }
  function setCar(i) {
    cIdx = (i + slides) % slides;
    track.style.transform = 'translateX(' + (-cIdx * 100) + '%)';
    [...carDots.children].forEach((d, k) => d.classList.toggle('on', k === cIdx));
  }
  document.getElementById('carPrev').addEventListener('click', () => setCar(cIdx - 1));
  document.getElementById('carNext').addEventListener('click', () => setCar(cIdx + 1));
  // 轮播独立横滑
  const car = document.getElementById('carousel');
  let csy = null, csx = null, cmoved = 0;
  car.addEventListener('touchstart', (e) => { csy = e.touches[0].clientY; csx = e.touches[0].clientX; cmoved = 0; }, { passive: true });
  car.addEventListener('touchmove', (e) => { if (csy != null) cmoved = Math.max(cmoved, Math.abs(e.touches[0].clientX - csx)); }, { passive: true });
  car.addEventListener('touchend', (e) => {
    if (csx == null) return;
    const dx = csx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(csy - e.changedTouches[0].clientY)) setCar(cIdx + (dx > 0 ? 1 : -1));
    csy = csx = null; e.stopPropagation();
  }, { passive: true });

  /* ---------- 路线时间轴 ---------- */
  const routeTip = document.getElementById('routeTip');
  document.querySelectorAll('#timeline li').forEach((li) => {
    li.addEventListener('click', () => {
      document.querySelectorAll('#timeline li').forEach((x) => x.classList.remove('active'));
      li.classList.add('active');
      routeTip.textContent = '📍 ' + li.getAttribute('data-desc');
    });
  });

  /* ---------- 美食弹窗 ---------- */
  const foodModal = document.getElementById('foodModal');
  document.querySelectorAll('.food-card').forEach((c) => {
    c.addEventListener('click', () => {
      document.getElementById('foodModalImg').src = c.querySelector('img').src;
      document.getElementById('foodModalName').textContent = c.getAttribute('data-name');
      document.getElementById('foodModalDesc').textContent = c.getAttribute('data-desc');
      foodModal.classList.add('show');
    });
  });
  document.getElementById('closeFood').addEventListener('click', () => foodModal.classList.remove('show'));
  foodModal.addEventListener('click', (e) => { if (e.target === foodModal) foodModal.classList.remove('show'); });

  /* ---------- 贴士动效 ---------- */
  document.querySelectorAll('.tip-card').forEach((c) => {
    c.addEventListener('click', () => {
      c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    });
  });

  /* ---------- 集章 ---------- */
  const unlocked = { red: false, river: false, food: false };
  const posterBtn = document.getElementById('posterBtn');
  const stampTip = document.getElementById('stampTip');
  document.querySelectorAll('#stamps .stamp').forEach((s) => {
    s.addEventListener('click', () => {
      const k = s.getAttribute('data-key');
      unlocked[k] = true;
      s.classList.add('unlocked');
      s.querySelector('.stamp-state').textContent = '已解锁';
      if (unlocked.red && unlocked.river && unlocked.food) {
        posterBtn.classList.remove('disabled');
        stampTip.textContent = '三枚印章已集齐，点击生成海报 ✦';
      }
    });
  });

  /* ---------- 海报生成 ---------- */
  const poster = document.getElementById('poster');
  const posterStamps = document.getElementById('posterStamps');
  const posterDate = document.getElementById('posterDate');
  function buildPoster() {
    poster.classList.remove('show');
    posterStamps.innerHTML = '';
    const names = [['red', '红色\n文化'], ['river', '湘江\n风光'], ['food', '星城\n美食']];
    names.forEach(([k, label]) => {
      const d = document.createElement('div');
      d.className = 'p-s' + (unlocked[k] ? ' on' : '');
      d.innerHTML = label.replace('\n', '<br>');
      posterStamps.appendChild(d);
    });
    posterDate.textContent = new Date().getFullYear() + ' 年';
    setTimeout(() => poster.classList.add('show'), 80);
  }

  /* ---------- 分享提示 ---------- */
  const toast = document.getElementById('toast');
  let toastT;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  document.getElementById('shareBtn').addEventListener('click', () => showToast('长按或截图保存，即可分享到微信 🌿'));

  /* ---------- 国风背景音乐（Web Audio 合成，无需外部音频） ---------- */
  let actx = null, soundOn = false, schedTimer = null, mi = 0, nextTime = 0;
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0];
  const MELODY = [0, 2, 4, 2, 3, 1, 0, 2, 4, 3, 2, 0, 1, 2, 0, 4];
  const soundBtn = document.getElementById('soundBtn');
  function note(time, freq, dur) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.16, time + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g).connect(actx.destination);
    o.start(time); o.stop(time + dur + 0.05);
  }
  function scheduler() {
    while (nextTime < actx.currentTime + 0.3) {
      note(nextTime, SCALE[MELODY[mi % MELODY.length]], 0.5);
      nextTime += 0.42; mi++;
    }
    schedTimer = setTimeout(scheduler, 130);
  }
  function startSound() {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    nextTime = actx.currentTime + 0.1; mi = 0; scheduler();
  }
  function stopSound() { clearTimeout(schedTimer); }
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.classList.toggle('on', soundOn);
    if (soundOn) { startSound(); showToast('正在播放轻柔国风音乐 🎵'); }
    else { stopSound(); }
  });

  /* ---------- 初始化 ---------- */
  setTransform();
  updateUI();
})();
