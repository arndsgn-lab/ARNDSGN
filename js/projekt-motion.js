/**
 * projekt.html — scroll reveals + motion helpers
 * Does not alter layout, typography, colors, or content.
 */
(function initProjektMotion() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealAll(nodes) {
    nodes.forEach((el) => el.classList.add('is-revealed'));
  }

  function initRevealUp() {
    const nodes = Array.from(document.querySelectorAll('.reveal-up'));
    if (!nodes.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealAll(nodes);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
      }
    );

    nodes.forEach((el) => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealUp, { once: true });
  } else {
    initRevealUp();
  }
})();
