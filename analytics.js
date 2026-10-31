// GA4 统计：所有页面共用。拿到 Measurement ID 后只改下面这一行。
const GA_ID = 'G-XXXXXXXXXX';

(function () {
  // 还没填真实 ID 时不加载 GA，也不发任何请求
  if (!/^G-[A-Z0-9]+$/.test(GA_ID) || GA_ID.includes('XXXX')) return;

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.append(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  // 需求 1 基础访问量 + 每页停留时间：page_view 和 engagement time 由 GA4 自动记录
  gtag('config', GA_ID);

  const page = location.pathname.split('/').pop() || 'index.html';
  const send = (name, params) => gtag('event', name, Object.assign({ page_name: page }, params));

  // 需求 2 阅读深度：滚动到 50% 和 90% 各记一次
  const marks = [50, 90];
  const hit = new Set();
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    const pct = (scrollY / max) * 100;
    marks.forEach(m => {
      if (pct >= m && !hit.has(m)) { hit.add(m); send('scroll_depth', { percent: m }); }
    });
  }, { passive: true });

  // 点击类事件统一用事件委托
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';

    // 需求 3 Resume 点击
    if (href.includes('drive.google.com')) return send('resume_click', { location: a.closest('header') ? 'nav' : 'page' });

    // 需求 4 联系方式点击
    if (a.classList.contains('copy-email') || href.startsWith('mailto:')) return send('contact_click', { method: 'email' });
    if (href.includes('linkedin.com')) return send('contact_click', { method: 'linkedin' });

    // 需求 5 toolbox 卡片打开
    if (a.classList.contains('note')) {
      const t = a.querySelector('.card-title');
      return send('case_open', { case_title: t ? t.textContent.trim() : '' });
    }

    // 需求 6 点进 case study（首页卡片和页面底部的其他项目）
    if (/^(iu-peer-coach|lock-ecommerce|meitu-localization)\.html/.test(href)) {
      return send('project_click', { project: href.replace('.html', '') });
    }
  });
})();
