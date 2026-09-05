import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking'); // checking | success | error
  const [text, setText] = useState('Verifying your email…');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setText('Missing verification token.');
      return;
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setText(res.data.message);
      })
      .catch(err => {
        setStatus('error');
        setText(err.response?.data?.message || 'Verification failed.');
      });
  }, [searchParams]);

  return (
    <div className="center-card">
      <div>
        <div className="brand">🍕 Forno</div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.3rem', marginBottom: 14 }}>Email verification</h1>
          <p className={`message ${status === 'success' ? 'message--success' : status === 'error' ? 'message--error' : ''}`}>
            {text}
          </p>
          {status !== 'checking' && (
            <Link className="btn btn-block" to="/login">Go to login</Link>
          )}
        </div>
      </div>
    </div>
  );
}
