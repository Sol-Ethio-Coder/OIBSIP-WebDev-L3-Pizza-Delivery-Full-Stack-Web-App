import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL_MS = 5000;

function statusClass(status) {
  if (status === 'In Kitchen') return 'status-pill--kitchen';
  if (status === 'Sent to Delivery') return 'status-pill--delivery';
  return 'status-pill--received';
}

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const [bases, setBases] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/inventory').then(res => {
      setBases(res.data.filter(item => item.type === 'base'));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      try {
        const res = await api.get('/orders/my');
        if (!cancelled) setOrders(res.data);
      } catch (err) {
        // silent — polling, don't spam the UI with transient errors
      }
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function handleLogout() {
    logoutUser();
    navigate('/login');
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">🍕 Forno</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
            Hi, {user?.name}
          </span>
          <button className="btn btn-outline" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <h2 style={{ marginBottom: 16 }}>Available bases</h2>
      <div className="option-grid">
        {bases.map(b => (
          <div className="option-card" key={b._id}>
            <div className="option-card__name">{b.name}</div>
            <div className="option-card__price">₹{b.price}</div>
          </div>
        ))}
      </div>

      <Link className="btn" to="/build" style={{ marginBottom: 36, display: 'inline-block' }}>
        Build a pizza
      </Link>

      <h2 style={{ margin: '20px 0 16px' }}>Your orders</h2>
      {orders.length === 0 && <p className="empty-note">No orders yet — build your first pizza above.</p>}

      {orders.map(order => (
        <div className="order-card" key={order._id}>
          <div className="order-card__head">
            <strong>{order.base?.name || 'Pizza'}</strong>
            <span className={`status-pill ${statusClass(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
          </div>
          <div style={{ color: 'var(--text-soft)', fontSize: '0.88rem' }}>
            {order.sauce?.name} · {order.cheese?.name}
            {order.vegetables?.length > 0 && ` · ${order.vegetables.map(v => v.name).join(', ')}`}
          </div>
          <div style={{ marginTop: 8, fontSize: '0.9rem' }}>
            ₹{order.totalAmount} · {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
          </div>
        </div>
      ))}
    </div>
  );
}
