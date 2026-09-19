const RECIPIENT = 'admin@melonemaintenance.com.au';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 4000;

const text = (value) => String(value || '').trim();
const escapeHtml = (value) => text(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function validateContact(input = {}) {
  const name = text(input.name);
  const phone = text(input.phone);
  const email = text(input.email);
  const message = text(input.message);
  const suburb = text(input.suburb);
  const timing = text(input.timing);
  const contactPreference = text(input.contactPreference);

  if (text(input.website)) return { error: 'Please submit a valid enquiry.' };
  if (!message) return { error: 'Please add your project details or question.' };
  if (!suburb) return { error: 'Please add your suburb or postcode.' };
  if (!['phone', 'email'].includes(contactPreference)) return { error: 'Please choose how you would like us to reply.' };
  if (contactPreference === 'phone' && !phone) return { error: 'Please add a phone number for your preferred reply.' };
  if (contactPreference === 'email' && (!email || !EMAIL_PATTERN.test(email))) return { error: 'Please enter a valid email address for your preferred reply.' };
  if (email && !EMAIL_PATTERN.test(email)) return { error: 'Please enter a valid email address.' };
  if ([name, phone, email, message, suburb, timing, contactPreference].some((value) => value.length > MAX_FIELD_LENGTH)) {
    return { error: 'One or more fields are too long.' };
  }

  return { value: { name, phone, email, message, suburb, timing, contactPreference } };
}

function createEmailPayload(enquiry, from) {
  const safe = Object.fromEntries(Object.entries(enquiry).map(([key, value]) => [key, escapeHtml(value)]));
  const customerName = enquiry.name || 'Website enquiry';
  const replyTo = EMAIL_PATTERN.test(enquiry.email) ? enquiry.email : undefined;
  const contactLine = enquiry.contactPreference === 'phone' ? enquiry.phone : enquiry.email;
  return {
    from,
    to: [RECIPIENT],
    ...(replyTo ? { reply_to: replyTo } : {}),
    subject: `New MEL ONE website enquiry — ${customerName}`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#17372f;line-height:1.5"><h1>New MEL ONE website enquiry</h1><p><strong>Name:</strong> ${safe.name || 'Not provided'}</p><p><strong>Preferred reply:</strong> ${safe.contactPreference}</p><p><strong>Preferred contact:</strong> ${escapeHtml(contactLine)}</p><p><strong>Phone:</strong> ${safe.phone || 'Not provided'}</p><p><strong>Email:</strong> ${safe.email || 'Not provided'}</p><p><strong>Suburb or postcode:</strong> ${safe.suburb}</p><p><strong>Preferred timing:</strong> ${safe.timing || 'Not provided'}</p><hr><p><strong>What needs attention:</strong></p><p>${safe.message.replaceAll('\n', '<br>')}</p></body></html>`,
    text: `New MEL ONE website enquiry\n\nName: ${enquiry.name || 'Not provided'}\nPreferred reply: ${enquiry.contactPreference}\nPreferred contact: ${contactLine}\nPhone: ${enquiry.phone || 'Not provided'}\nEmail: ${enquiry.email || 'Not provided'}\nSuburb or postcode: ${enquiry.suburb}\nPreferred timing: ${enquiry.timing || 'Not provided'}\n\nWhat needs attention:\n${enquiry.message}`,
  };
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    const validation = validateContact(await readBody(req));
    if (validation.error) return res.status(400).json(validation);

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) return res.status(500).json({ error: 'Email delivery is not configured yet.' });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(createEmailPayload(validation.value, from)),
    });
    if (!response.ok) {
      console.error('Resend rejected contact email:', response.status, await response.text());
      return res.status(502).json({ error: 'We could not send your enquiry. Please call or email us directly.' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(400).json({ error: 'Please check your details and try again.' });
  }
}

module.exports = handler;
module.exports.validateContact = validateContact;
module.exports.createEmailPayload = createEmailPayload;
