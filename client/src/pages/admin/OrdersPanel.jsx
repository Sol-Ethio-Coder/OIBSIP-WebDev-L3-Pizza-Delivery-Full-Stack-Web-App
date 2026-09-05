import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery'];

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  function loadOrders() {
    api.get('/admin/orders').then(res => setOrders(res.data));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function handleLogout() {
    logoutAdmin();
    navigate('/admin/login');
  }

  async function handleStatusChange(orderId, status) {
    await api.patch(`/admin/orders/${orderId}/status`, { status });
    loadOrders();
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">🍕 Forno Admin</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link className="btn btn-outline" to="/admin/inventory">Inventory</Link>
          <span style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{admin?.name}</span>
          <button className="btn btn-outline" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <h2 className="section-title">Incoming orders</h2>

      {orders.length === 0 && <p className="empty-note">No orders yet.</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Pizza</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order.user?.name}<br /><span style={{ color: 'var(--text-soft)', fontSize: '0.8rem' }}>{order.user?.email}</span></td>
              <td>
                {order.base?.name}, {order.sauce?.name}, {order.cheese?.name}
                {order.vegetables?.length > 0 && `, ${order.vegetables.map(v => v.name).join(', ')}`}
              </td>
              <td>₹{order.totalAmount}</td>
              <td>{order.paymentStatus}</td>
              <td>
                <select
                  value={order.orderStatus}
                  onChange={e => handleStatusChange(order._id, e.target.value)}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
