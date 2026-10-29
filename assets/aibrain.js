/* =========================================================
   aibrain · 交互脚本（零依赖）
   1) 导航：滚动后转为实底，覆盖深色区块时自动反色
   2) 移动端抽屉菜单
   3) 滚动渐入
   4) 场景标签切换（无障碍 tablist）
   5) 导航锚点随滚动高亮
   ========================================================= */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

  /* ---------- 1. 导航状态 ---------- */
  var darkZones = Array.prototype.slice.call(
    document.querySelectorAll('.hero, .sec-dark, .contact, .footer')
  );

  function navShouldBeDark() {
    var probe = nav.offsetHeight * 0.5;
    for (var i = 0; i < darkZones.length; i++) {
      var r = darkZones[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) return true;
    }
    return false;
  }

  var ticking = false;
  function updateNav() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var dark = navShouldBeDark();
    nav.classList.toggle('on-dark', dark);
    nav.classList.toggle('solid', !dark && y > 24);
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateNav);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateNav();

  /* ---------- 2. 抽屉 ---------- */
  function closeDrawer() {
    drawer.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', '打开菜单');
  }
  function toggleDrawer() {
    var open = drawer.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  }
  if (burger) burger.addEventListener('click', toggleDrawer);
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeDrawer();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeDrawer();
  });

  /* ---------- 3. 滚动渐入 ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 4. 场景标签 ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.scene-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.scene-panel'));

  function selectTab(tab) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
    panels.forEach(function (p) {
      p.hidden = p.id !== tab.getAttribute('aria-controls');
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) {
        e.preventDefault();
        selectTab(next);
        next.focus();
      }
    });
  });

  /* ---------- 5. 锚点高亮 ---------- */
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = '#' + en.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 年份 ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
