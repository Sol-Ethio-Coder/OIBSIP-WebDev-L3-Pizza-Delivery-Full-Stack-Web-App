import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!token) return setMessage({ type: 'error', text: 'Missing reset token.' });
    if (password.length < 8) {
      return setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Reset failed.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-card">
      <div>
        <div className="brand">🍕 Forno</div>
        <div className="card">
          <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Set a new password</h1>

          {message && <p className={`message message--${message.type}`}>{message.text}</p>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-block" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Update password'}
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
