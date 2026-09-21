(() => {
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
  const button = form.querySelector('[data-enquiry-submit]');
  const status = form.querySelector('[data-enquiry-status]');
  const validate = values => {
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
      status.textContent = 'Check the highlighted details before sending.';
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
    status.textContent = 'Sending your enquiry…';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(values.entries())),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not send your enquiry.');
      track('generate_lead', { form_name: 'contact_enquiry', preferred_contact: values.get('contactPreference') || 'not_provided' });
      form.reset();
      for (const name of ['message', 'suburb', 'phone', 'email']) {
        form.elements[name].setAttribute('aria-invalid', 'false');
        document.getElementById(`${name}-error`).textContent = '';
      }
      status.textContent = 'Thank you — your enquiry has been sent to MEL ONE. We will be in touch.';
    } catch (error) {
      status.textContent = `${error.message} Please call 0416 614 281 or email admin@melonemaintenance.com.au.`;
    } finally {
      button.disabled = false;
    }
  });
  form.querySelector('textarea').addEventListener('input', event => {
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  });
})();
