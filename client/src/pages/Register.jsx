import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!form.name || !form.email || !form.password) {
      setMessage({ type: 'error', text: 'Please fill in every field.' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Registration failed.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-card">
      <div>
        <div className="brand">🍕 Forno</div>
        <div className="card">
          <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Create an account</h1>
          <p style={{ color: 'var(--text-soft)', marginBottom: 22, fontSize: '0.92rem' }}>
            We'll send a verification link to your email.
          </p>

          {message && (
            <p className={`message message--${message.type}`}>{message.text}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
              />
            </div>
            <button className="btn btn-block" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
