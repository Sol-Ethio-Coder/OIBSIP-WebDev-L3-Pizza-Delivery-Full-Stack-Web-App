import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

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
    } finally {
      setLoading(false);
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
