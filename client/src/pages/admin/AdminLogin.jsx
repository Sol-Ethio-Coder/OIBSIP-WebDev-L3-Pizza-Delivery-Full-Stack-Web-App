import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
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
      const res = await api.post('/admin/login', form);
      loginAdmin(res.data.token, res.data.admin);
      navigate('/admin/inventory');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-card">
      <div>
        <div className="brand">🍕 Forno Admin</div>
        <div className="card">
          <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Admin login</h1>
          <p style={{ color: 'var(--text-soft)', marginBottom: 22, fontSize: '0.92rem' }}>
            Restricted access — inventory and order management.
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
            <Link to="/login" style={{ color: 'var(--text-soft)' }}>Back to customer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
