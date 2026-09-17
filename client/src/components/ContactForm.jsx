import { useState } from 'react';
import { publicApi } from '../lib/api.js';
import Icon from '../lib/icons.jsx';

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  company_website: '', // honeypot
};

const SUBJECTS = [
  'Modular Kitchen',
  'Wardrobes & Storage',
  'Modular Furniture',
  'Kitchen Appliances',
  'Full Home Interiors',
  'Something else',
];

export default function ContactForm({ sourcePage = 'contact', compact = false }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // {type, message}
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const validate = () => {
    const next = {};
    if (form.first_name.trim().length < 2) next.first_name = 'Please enter your name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.phone && !/^[+\d][\d\s\-()]{6,19}$/.test(form.phone)) next.phone = 'Enter a valid phone number';
    if (form.message.trim().length < 10) next.message = 'Please tell us a little more about your project';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!validate()) return;

    setSending(true);
    try {
      const res = await publicApi.sendEnquiry({ ...form, source_page: sourcePage });
      setStatus({ type: 'ok', message: res.message || 'Thank you — we will be in touch shortly.' });
      setForm(EMPTY);
    } catch (err) {
      if (err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      setStatus({
        type: 'err',
        message: err.message || 'We could not send your message. Please call us instead.',
      });
    } finally {
      setSending(false);
    }
  };

  const field = (key) => `field${errors[key] ? ' has-error' : ''}`;

  return (
    <form className={compact ? '' : 'form-card'} onSubmit={submit} noValidate>
      {status && (
        <div className={`form-alert form-alert--${status.type === 'ok' ? 'ok' : 'err'}`}>
          {status.type === 'ok' ? <Icon.checkCircle /> : <Icon.alert />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="field-row">
        <div className={field('first_name')}>
          <label htmlFor="cf-first">
            Name <span>*</span>
          </label>
          <input
            id="cf-first"
            type="text"
            value={form.first_name}
            onChange={set('first_name')}
            placeholder="Your first name"
            autoComplete="given-name"
          />
          {errors.first_name && <span className="field__error">{errors.first_name}</span>}
        </div>

        <div className={field('last_name')}>
          <label htmlFor="cf-last">Last name</label>
          <input
            id="cf-last"
            type="text"
            value={form.last_name}
            onChange={set('last_name')}
            placeholder="Optional"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="field-row">
        <div className={field('email')}>
          <label htmlFor="cf-email">
            Your email <span>*</span>
          </label>
          <input
            id="cf-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </div>

        <div className={field('phone')}>
          <label htmlFor="cf-phone">Phone</label>
          <input
            id="cf-phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+91 00000 00000"
            autoComplete="tel"
          />
          {errors.phone && <span className="field__error">{errors.phone}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="cf-subject">I am planning</label>
        <select id="cf-subject" value={form.subject} onChange={set('subject')}>
          <option value="">Select a service</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className={field('message')}>
        <label htmlFor="cf-message">
          Message <span>*</span>
        </label>
        <textarea
          id="cf-message"
          value={form.message}
          onChange={set('message')}
          placeholder="Tell us about your space — size, layout, timeline, and anything you already have in mind."
        />
        {errors.message && <span className="field__error">{errors.message}</span>}
      </div>

      {/* Bots fill this; humans never see it. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="cf-website">Company website</label>
        <input
          id="cf-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company_website}
          onChange={set('company_website')}
        />
      </div>

      <button className="btn btn--block" type="submit" disabled={sending}>
        {sending ? <span className="spinner" /> : null}
        {sending ? 'Sending…' : 'Submit Enquiry'}
      </button>
    </form>
  );
}
