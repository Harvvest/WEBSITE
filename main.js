const nav = document.getElementById('mainNav');
const toggle = document.getElementById('menuToggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  toggle.textContent = open ? '×' : '☰';
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.textContent = '☰';
  }
});
const dialog = document.getElementById('bookingDialog');
const form = document.getElementById('enquiryForm');
const status = document.getElementById('formStatus');
let opener;
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
  opener = button;
  if (button.dataset.book) form.elements.program.value = button.dataset.book;
  dialog.showModal();
  document.body.classList.add('modal-open');
  form.elements.name.focus();
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = '☰';
}));
document.getElementById('closeBooking').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  const r = dialog.getBoundingClientRect();
  if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  opener?.focus();
});
let requestId;
form.addEventListener('input', () => { requestId = undefined; });
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  button.textContent = 'Sending…';
  status.className = '';
  status.textContent = 'Submitting your enquiry…';
  requestId ||= crypto.randomUUID();
  const payload = {...Object.fromEntries(new FormData(form)), requestId};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch('/api/enquiry', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload), signal: controller.signal
    });
    const result = await response.json();
    if (!response.ok || result.stored !== true) throw new Error('Not saved');
    status.className = 'success';
    status.textContent = 'Thank you. Your enquiry has been received.';
    form.reset();
    requestId = undefined;
  } catch {
    status.className = 'error';
    status.textContent = 'We couldn’t confirm your enquiry was saved. Please retry or contact us on WhatsApp. Your details are still here.';
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    button.innerHTML = 'Send Enquiry <span aria-hidden="true">↗</span>';
  }
});
document.getElementById('year').textContent = new Date().getFullYear();
