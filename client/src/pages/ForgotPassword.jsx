import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!email) return setMessage({ type: 'error', text: 'Enter your email.' });

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-card">
      <div>
        <div className="brand">🍕 Forno</div>
        <div className="card">
          <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Reset your password</h1>
          <p style={{ color: 'var(--text-soft)', marginBottom: 22, fontSize: '0.92rem' }}>
            We'll email you a reset link.
          </p>

          {message && <p className={`message message--${message.type}`}>{message.text}</p>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-block" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="switch">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
