import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsUnverified(false);
    setResendStatus(null);

    if (!form.email || !form.password) {
      setError('Please enter both fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
      if (err.response?.status === 403) setIsUnverified(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendStatus('sending');
    try {
      const res = await api.post('/auth/resend-verification', { email: form.email });
      setResendStatus(res.data.message);
    } catch (err) {
      setResendStatus(err.response?.data?.message || 'Could not resend right now.');
    }
  }

  return (
    <div className="center-card">
      <div>
        <div className="brand">🍕 Forno</div>
        <div className="card">
          <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Log in</h1>
          <p style={{ color: 'var(--text-soft)', marginBottom: 22, fontSize: '0.92rem' }}>
            Order your next pizza in a few clicks.
          </p>

          {error && <p className="message message--error">{error}</p>}

          {isUnverified && (
            <p className="switch" style={{ marginTop: -10, marginBottom: 18 }}>
              {resendStatus ? (
                resendStatus
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  style={{ background: 'none', border: 'none', color: 'var(--tomato)', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit' }}
                >
                  Resend verification email
                </button>
              )}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn btn-block" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="switch">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p className="switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
          <p className="switch">
            <Link to="/admin/login" style={{ color: 'var(--text-soft)' }}>Admin login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
