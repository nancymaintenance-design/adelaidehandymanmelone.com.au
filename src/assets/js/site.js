(() => {
  const chinese = document.documentElement?.lang?.startsWith('zh');
  const message = (key, values = {}) => (window.MEL_ONE_MESSAGES?.[key] || '').replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  const updateLanguageLinks = () => document.querySelectorAll('[data-language-switch]').forEach(link => {
    const target = new URL(link.getAttribute('href'), window.location.href);
    target.search = window.location.search;
    target.hash = window.location.hash;
    link.href = target.pathname + target.search + target.hash;
  });
  updateLanguageLinks();
  window.addEventListener('hashchange', updateLanguageLinks);
  const openLinkedStep = () => {
    const target = document.getElementById(window.location.hash.slice(1));
    const disclosure = target?.matches('.answer-list details') ? target : target?.querySelector('.method-disclosure');
    if (disclosure) disclosure.open = true;
  };
  window.addEventListener('hashchange', openLinkedStep);
  openLinkedStep();
  const areaSearch = document.querySelector('#area-search');
  if (areaSearch) {
    const cards = [...document.querySelectorAll('.area-atlas .note-card')];
    const clear = document.querySelector('[data-area-search-clear]');
    const status = document.querySelector('[data-area-search-status]');
    const filter = () => {
      const query = areaSearch.value.trim().toLocaleLowerCase('en-AU');
      let matches = 0;
      cards.forEach(card => {
        let visible = 0;
        card.querySelectorAll('li').forEach(item => {
          item.hidden = !item.textContent.toLocaleLowerCase('en-AU').includes(query);
          if (!item.hidden) visible++;
        });
        card.hidden = visible === 0;
        matches += visible;
      });
      clear.hidden = !areaSearch.value;
      status.textContent = query ? (matches ? message('matches', { count: matches, suffix: matches === 1 ? '' : 's' }) : message('noMatches')) : '';
    };
    areaSearch.addEventListener('input', event => { if (!event.isComposing) filter(); });
    areaSearch.addEventListener('compositionend', filter);
    clear.addEventListener('click', () => { areaSearch.value = ''; filter(); areaSearch.focus(); });
    filter();
  }
  const track = (eventName, parameters = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', eventName, parameters);
  };
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => track('click_to_call', { link_url: link.href }));
  });
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  const narrow = window.matchMedia('(max-width: 850px)');
  if (menu && nav) {
    const sync = () => {
      menu.hidden = !narrow.matches;
      nav.hidden = narrow.matches && menu.getAttribute('aria-expanded') !== 'true';
    };
    menu.addEventListener('click', () => {
      menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') !== 'true'));
      sync();
    });
    nav.addEventListener('keydown', event => {
      if (event.key === 'Escape' && narrow.matches) {
        menu.setAttribute('aria-expanded', 'false');
        sync();
        menu.focus();
      }
    });
    narrow.addEventListener('change', sync);
    sync();
  }
  const form = document.querySelector('[data-enquiry-form]');
  if (!form) return;
  if (form.dataset.suburbOptions && !form.elements.suburb.value) {
    const query = new URLSearchParams(window.location.search);
    const suburb = JSON.parse(form.dataset.suburbOptions).find(option =>
      option.slug === query.get('suburb') && (!query.has('region') || option.region === query.get('region')));
    if (suburb) form.elements.suburb.value = suburb.name;
  }
  const button = form.querySelector('[data-enquiry-submit]');
  const status = form.querySelector('[data-enquiry-status]');
  const validate = values => {
    const errors = {};
    if (!String(values.get('message')).trim()) errors.message = message('messageRequired');
    if (!String(values.get('suburb')).trim()) errors.suburb = message('suburbRequired');
    if (values.get('contactPreference') === 'phone' && !/^[+\d][\d\s()-]{5,}$/.test(String(values.get('phone')).trim())) errors.phone = message('phoneRequired');
    if (values.get('contactPreference') === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.get('email')).trim())) errors.email = message('emailRequired');
    for (const name of ['message', 'suburb', 'phone', 'email']) {
      form.elements[name].setAttribute('aria-invalid', String(Boolean(errors[name])));
      document.getElementById(`${name}-error`).textContent = errors[name] || '';
    }
    if (Object.keys(errors).length) {
      status.textContent = message('checkFields');
      form.elements[Object.keys(errors)[0]].focus();
      return false;
    }
    return true;
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const values = new FormData(form);
    if (!validate(values)) return;
    button.disabled = true;
    status.textContent = message('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(values.entries())),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (String(result.error).startsWith('Local preview:')) throw new Error(message('localPreview'));
        if (response.status === 429) throw new Error(message('tooMany'));
        throw new Error(chinese ? message('failed') : (result.error || message('failed')));
      }
      track('generate_lead', { form_name: 'contact_enquiry', preferred_contact: values.get('contactPreference') || 'not_provided' });
      form.reset();
      for (const name of ['message', 'suburb', 'phone', 'email']) {
        form.elements[name].setAttribute('aria-invalid', 'false');
        document.getElementById(`${name}-error`).textContent = '';
      }
      status.textContent = message('success');
    } catch (error) {
      const detail = chinese && !/[\u3400-\u9fff]/.test(error.message) ? message('failed') : error.message;
      status.textContent = `${detail} ${message('fallback')}`;
    } finally {
      button.disabled = false;
    }
  });
  form.querySelector('textarea').addEventListener('input', event => {
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  });
})();
