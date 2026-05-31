(function initCookieConsentModule() {
  'use strict';

  const STORAGE_KEY = 'cookieConsent';
  const CONSENT_VERSION = 1;

  const ANALYTICS_SCRIPT_ID = 'consent-analytics-script';
  const MARKETING_SCRIPT_ID = 'consent-marketing-script';

  let bannerEl = null;
  let modalEl = null;
  let analyticsToggle = null;
  let marketingToggle = null;

  function getStoredConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      return {
        version: parsed.version ?? 1,
        essential: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        timestamp: parsed.timestamp ?? null,
      };
    } catch {
      return null;
    }
  }

  function saveConsent(consent) {
    const payload = {
      version: CONSENT_VERSION,
      essential: true,
      analytics: Boolean(consent.analytics),
      marketing: Boolean(consent.marketing),
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    applyConsent(payload);
    hideBanner();
    syncModalToggles(payload);
    return payload;
  }

  function removeScriptById(id) {
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }
  }

  function loadAnalyticsScripts() {
    if (document.getElementById(ANALYTICS_SCRIPT_ID)) return;

    console.log(
      '[Cookie Consent] Analytics: Hier würden z. B. Google Analytics / Matomo geladen werden.'
    );

    /* Beispiel für echten Tracking-Code:
    const script = document.createElement('script');
    script.id = ANALYTICS_SCRIPT_ID;
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);
    */

    const placeholder = document.createElement('script');
    placeholder.id = ANALYTICS_SCRIPT_ID;
    placeholder.textContent =
      'console.log("[Cookie Consent] Analytics-Tracking aktiv — ersetze loadAnalyticsScripts() durch deinen Code.");';
    document.head.appendChild(placeholder);
  }

  function loadMarketingScripts() {
    if (document.getElementById(MARKETING_SCRIPT_ID)) return;

    console.log(
      '[Cookie Consent] Marketing: Hier würden z. B. Facebook Pixel / LinkedIn Insight Tag geladen werden.'
    );

    /* Beispiel für echten Tracking-Code:
    const script = document.createElement('script');
    script.id = MARKETING_SCRIPT_ID;
    script.textContent = `!function(f,b,e,v,n,t,s){...}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`;
    document.head.appendChild(script);
    */

    const placeholder = document.createElement('script');
    placeholder.id = MARKETING_SCRIPT_ID;
    placeholder.textContent =
      'console.log("[Cookie Consent] Marketing-Tracking aktiv — ersetze loadMarketingScripts() durch deinen Code.");';
    document.head.appendChild(placeholder);
  }

  function unloadAnalyticsScripts() {
    removeScriptById(ANALYTICS_SCRIPT_ID);
    console.log('[Cookie Consent] Analytics-Skripte entfernt / nicht geladen.');
  }

  function unloadMarketingScripts() {
    removeScriptById(MARKETING_SCRIPT_ID);
    console.log('[Cookie Consent] Marketing-Skripte entfernt / nicht geladen.');
  }

  function applyConsent(consent) {
    if (consent.analytics) {
      loadAnalyticsScripts();
    } else {
      unloadAnalyticsScripts();
    }

    if (consent.marketing) {
      loadMarketingScripts();
    } else {
      unloadMarketingScripts();
    }
  }

  function buildUi() {
    if (document.getElementById('cookie-consent-banner')) return;

    bannerEl = document.createElement('div');
    bannerEl.id = 'cookie-consent-banner';
    bannerEl.className = 'cookie-consent';
    bannerEl.setAttribute('role', 'dialog');
    bannerEl.setAttribute('aria-live', 'polite');
    bannerEl.setAttribute('aria-labelledby', 'cookie-consent-title');
    bannerEl.setAttribute('aria-describedby', 'cookie-consent-desc');
    bannerEl.hidden = true;
    bannerEl.innerHTML = `
      <div class="cookie-consent__panel">
        <div class="cookie-consent__copy">
          <p id="cookie-consent-title" class="cookie-consent__title">Cookies</p>
          <p id="cookie-consent-desc" class="cookie-consent__text">
            Essenziell für den Betrieb. Analyse &amp; Marketing nur mit Einwilligung.
            <a href="datenschutz.html">Details</a>
          </p>
        </div>
        <div class="cookie-consent__actions">
          <button type="button" class="cookie-consent__btn cookie-consent__btn--primary" data-consent-action="accept-all">
            Akzeptieren
          </button>
          <button type="button" class="cookie-consent__btn cookie-consent__btn--ghost" data-consent-action="essential-only">
            Essenziell
          </button>
          <button type="button" class="cookie-consent__btn cookie-consent__btn--ghost" data-consent-action="open-settings">
            Einstellungen
          </button>
        </div>
      </div>
    `;

    modalEl = document.createElement('dialog');
    modalEl.id = 'cookie-consent-modal';
    modalEl.className = 'cookie-consent-modal';
    modalEl.setAttribute('aria-labelledby', 'cookie-consent-modal-title');
    modalEl.innerHTML = `
      <div class="cookie-consent-modal__panel">
        <div class="cookie-consent-modal__header">
          <h2 id="cookie-consent-modal-title" class="cookie-consent-modal__title">Cookies</h2>
          <button type="button" class="cookie-consent-modal__close" data-consent-action="close-modal" aria-label="Schließen">
            ×
          </button>
        </div>
        <div class="cookie-consent-categories">
          <div class="cookie-consent-category">
            <div>
              <p class="cookie-consent-category__label">Essenziell</p>
              <p class="cookie-consent-category__desc">Technisch erforderlich.</p>
            </div>
            <label class="cookie-consent-toggle" aria-label="Essenziell (immer aktiv)">
              <input type="checkbox" checked disabled data-consent-toggle="essential" />
              <span class="cookie-consent-toggle__track" aria-hidden="true"></span>
            </label>
          </div>
          <div class="cookie-consent-category">
            <div>
              <p class="cookie-consent-category__label">Analyse</p>
              <p class="cookie-consent-category__desc">z. B. Google Analytics.</p>
            </div>
            <label class="cookie-consent-toggle" aria-label="Analyse erlauben">
              <input type="checkbox" data-consent-toggle="analytics" />
              <span class="cookie-consent-toggle__track" aria-hidden="true"></span>
            </label>
          </div>
          <div class="cookie-consent-category">
            <div>
              <p class="cookie-consent-category__label">Marketing</p>
              <p class="cookie-consent-category__desc">z. B. Facebook Pixel.</p>
            </div>
            <label class="cookie-consent-toggle" aria-label="Marketing erlauben">
              <input type="checkbox" data-consent-toggle="marketing" />
              <span class="cookie-consent-toggle__track" aria-hidden="true"></span>
            </label>
          </div>
        </div>
        <div class="cookie-consent-modal__actions">
          <button type="button" class="cookie-consent__btn cookie-consent__btn--ghost" data-consent-action="close-modal">
            Abbrechen
          </button>
          <button type="button" class="cookie-consent__btn cookie-consent__btn--primary" data-consent-action="save-selection">
            Speichern
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(bannerEl);
    document.body.appendChild(modalEl);

    analyticsToggle = modalEl.querySelector('[data-consent-toggle="analytics"]');
    marketingToggle = modalEl.querySelector('[data-consent-toggle="marketing"]');
  }

  function showBanner() {
    if (!bannerEl) return;
    bannerEl.hidden = false;
    requestAnimationFrame(() => {
      bannerEl.classList.add('is-visible');
    });
  }

  function hideBanner() {
    if (!bannerEl) return;
    bannerEl.classList.remove('is-visible');
    window.setTimeout(() => {
      bannerEl.hidden = true;
    }, 350);
  }

  function syncModalToggles(consent) {
    if (!analyticsToggle || !marketingToggle) return;

    analyticsToggle.checked = Boolean(consent?.analytics);
    marketingToggle.checked = Boolean(consent?.marketing);
  }

  function openSettingsModal() {
    if (!modalEl) return;

    const stored = getStoredConsent();
    syncModalToggles(
      stored ?? {
        essential: true,
        analytics: false,
        marketing: false,
      }
    );

    if (typeof modalEl.showModal === 'function') {
      modalEl.showModal();
    }
  }

  function closeSettingsModal() {
    if (!modalEl) return;

    if (modalEl.open) {
      modalEl.close();
    }
  }

  function readModalSelection() {
    return {
      essential: true,
      analytics: Boolean(analyticsToggle?.checked),
      marketing: Boolean(marketingToggle?.checked),
    };
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest('[data-cookie-settings]')) {
        event.preventDefault();
        openSettingsModal();
        return;
      }

      const actionEl = target.closest('[data-consent-action]');
      if (!actionEl) return;

      const action = actionEl.getAttribute('data-consent-action');

      switch (action) {
        case 'accept-all':
          saveConsent({ essential: true, analytics: true, marketing: true });
          closeSettingsModal();
          break;
        case 'essential-only':
          saveConsent({ essential: true, analytics: false, marketing: false });
          closeSettingsModal();
          break;
        case 'open-settings':
          openSettingsModal();
          break;
        case 'save-selection':
          saveConsent(readModalSelection());
          closeSettingsModal();
          break;
        case 'close-modal':
          closeSettingsModal();
          break;
        default:
          break;
      }
    });

    if (modalEl) {
      modalEl.addEventListener('click', (event) => {
        if (event.target === modalEl) {
          closeSettingsModal();
        }
      });

      modalEl.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeSettingsModal();
      });
    }
  }

  function boot() {
    buildUi();
    bindEvents();

    const stored = getStoredConsent();

    if (stored) {
      applyConsent(stored);
      hideBanner();
      return;
    }

    showBanner();
  }

  window.CookieConsent = {
    getConsent: getStoredConsent,
    openSettings: openSettingsModal,
    applyConsent,
    saveConsent,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
