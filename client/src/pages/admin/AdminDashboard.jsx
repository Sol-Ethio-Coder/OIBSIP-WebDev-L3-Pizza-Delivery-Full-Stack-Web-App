import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const TYPES = ['base', 'sauce', 'cheese', 'vegetable'];

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  function loadInventory() {
    api.get('/admin/inventory').then(res => setItems(res.data));
  }

  useEffect(() => {
    loadInventory();
  }, []);

  function handleLogout() {
    logoutAdmin();
    navigate('/admin/login');
  }

  async function updateStock(id, stockCount) {
    setSavingId(id);
    try {
      await api.patch(`/admin/inventory/${id}`, { stockCount: Number(stockCount) });
      loadInventory();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">🍕 Forno Admin</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link className="btn btn-outline" to="/admin/orders">Orders</Link>
          <span style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{admin?.name}</span>
          <button className="btn btn-outline" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {TYPES.map(type => (
        <div key={type} style={{ marginBottom: 32 }}>
          <h2 className="section-title" style={{ textTransform: 'capitalize' }}>{type}s</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.filter(i => i.type === type).map(item => (
                <InventoryRow
                  key={item._id}
                  item={item}
                  saving={savingId === item._id}
                  onSave={updateStock}
                />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function InventoryRow({ item, saving, onSave }) {
  const [stock, setStock] = useState(item.stockCount);

  return (
    <tr>
      <td>{item.name}</td>
      <td>₹{item.price}</td>
      <td>
        <input
          type="number"
          min="0"
          value={stock}
          onChange={e => setStock(e.target.value)}
          style={{ width: 80 }}
        />
      </td>
      <td>{item.lowStockThreshold}</td>
      <td>
        <button
          className="btn btn-outline"
          disabled={saving || Number(stock) === item.stockCount}
          onClick={() => onSave(item._id, stock)}
        >
          {saving ? 'Saving…' : 'Update'}
        </button>
      </td>
    </tr>
  );
}
