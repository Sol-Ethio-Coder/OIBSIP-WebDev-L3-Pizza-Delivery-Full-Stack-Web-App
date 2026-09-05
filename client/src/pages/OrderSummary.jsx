import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function OrderSummary() {
  const [selection, setSelection] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem('forno_builder_selection');
    if (!raw) {
      navigate('/build');
      return;
    }
    setSelection(JSON.parse(raw));
  }, [navigate]);

  if (!selection) return null;

  const items = [selection.base, selection.sauce, selection.cheese, ...selection.vegetable];
  const total = items.reduce((sum, item) => sum + (item?.price || 0), 0);

  async function handlePay() {
    setMessage(null);
    setLoading(true);
    try {
      const checkoutRes = await api.post('/orders/checkout', {
        baseId: selection.base._id,
        sauceId: selection.sauce._id,
        cheeseId: selection.cheese._id,
        vegetableIds: selection.vegetable.map(v => v._id)
      });

      const { orderId, razorpayOrderId, amount, currency, keyId } = checkoutRes.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'Forno Pizza',
        description: 'Pizza order',
        order_id: razorpayOrderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#D64545' },
        handler: async function (response) {
          try {
            await api.post('/orders/verify', {
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            sessionStorage.removeItem('forno_builder_selection');
            navigate('/dashboard');
          } catch (err) {
            setMessage({
              type: 'error',
              text: err.response?.data?.message || 'Payment could not be confirmed.'
            });
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      });

      rzp.open();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Checkout failed.' });
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">🍕 Forno</div>
      </div>

      <h2 className="section-title">Order summary</h2>

      {message && <p className="message message--error">{message.text}</p>}

      <div className="card" style={{ maxWidth: 480 }}>
        <div className="summary-row">
          <span>Base — {selection.base.name}</span>
          <span>₹{selection.base.price}</span>
        </div>
        <div className="summary-row">
          <span>Sauce — {selection.sauce.name}</span>
          <span>₹{selection.sauce.price}</span>
        </div>
        <div className="summary-row">
          <span>Cheese — {selection.cheese.name}</span>
          <span>₹{selection.cheese.price}</span>
        </div>
        {selection.vegetable.map(v => (
          <div className="summary-row" key={v._id}>
            <span>{v.name}</span>
            <span>₹{v.price}</span>
          </div>
        ))}
        <div className="summary-total">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button className="btn" style={{ marginTop: 24 }} onClick={handlePay} disabled={loading}>
        {loading ? 'Opening checkout…' : `Pay ₹${total} with Razorpay`}
      </button>
    </div>
  );
}
