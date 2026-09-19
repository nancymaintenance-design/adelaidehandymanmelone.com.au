(() => {
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
  const form = document.querySelector('[data-local-enquiry]');
  if (!form) return;
  // No submit, fetch, telemetry, photo reads or browser persistence in the local demo.
  form.addEventListener('submit', event => event.preventDefault());
  const button = form.querySelector('[data-preview-enquiry]');
  const status = form.querySelector('[data-enquiry-status]');
  const preview = form.querySelector('[data-enquiry-preview]');
  button.disabled = false;
  button.addEventListener('click', () => {
    const values = new FormData(form);
    const errors = {};
    if (!String(values.get('message')).trim()) errors.message = 'Describe what needs attention.';
    if (!String(values.get('suburb')).trim()) errors.suburb = 'Add your suburb or postcode.';
    if (values.get('contactPreference') === 'phone' && !/^[+\d][\d\s()-]{5,}$/.test(String(values.get('phone')).trim())) errors.phone = 'Add a phone number for your preferred reply.';
    if (values.get('contactPreference') === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.get('email')).trim())) errors.email = 'Add an email address, such as name@example.com.';
    for (const name of ['message', 'suburb', 'phone', 'email']) {
      form.elements[name].setAttribute('aria-invalid', String(Boolean(errors[name])));
      document.getElementById(`${name}-error`).textContent = errors[name] || '';
    }
    if (Object.keys(errors).length) {
      preview.hidden = true;
      status.textContent = 'Check the highlighted details. Nothing has been sent.';
      form.elements[Object.keys(errors)[0]].focus();
      return;
    }
    preview.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = 'Your enquiry preview';
    preview.append(heading);
    const details = document.createElement('dl');
    for (const [name, label] of [['message', 'What needs attention'], ['suburb', 'Suburb or postcode'], ['timing', 'Preferred timing'], ['contactPreference', 'Preferred reply'], ['phone', 'Phone'], ['email', 'Email']]) {
      const value = String(values.get(name) || '').trim();
      if (!value) continue;
      const term = document.createElement('dt');
      term.textContent = label;
      const detail = document.createElement('dd');
      detail.textContent = value;
      details.append(term, detail);
    }
    preview.append(details);
    preview.hidden = false;
    status.textContent = 'Preview ready. Nothing has been sent or saved. Call or email MEL ONE to make your enquiry.';
  });
  form.querySelector('textarea').addEventListener('input', event => {
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  });
})();
