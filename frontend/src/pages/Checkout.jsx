import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/cart')
      .then(r => setCartItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const total = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const placeOrder = async () => {
    if (!address.trim()) return setError('Please enter a shipping address');
    setPlacing(true);
    setError('');
    try {
      const { data } = await api.post('/api/orders', { shippingAddress: address });

      // Make sure we have a valid order id before navigating
      if (!data || !data.id) {
        setError('Order created but ID missing. Please try again.');
        setPlacing(false);
        return;
      }

      navigate(`/payment/${data.id}`);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to place order');
      setPlacing(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  if (cartItems.length === 0) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Your cart is empty.</p>
      <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '10px 20px', cursor: 'pointer' }}>
        Browse Products
      </button>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate('/cart')}>← Back to Cart</button>
        <span style={s.brand}>ShopApp</span>
        <span />
      </div>

      <div style={s.content}>
        <h2 style={s.title}>Checkout</h2>
        <div style={s.layout}>
          <div style={s.left}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Shipping Address</h3>
              <textarea
                style={s.textarea}
                placeholder="Enter full shipping address&#10;e.g. 123 Main Street, Chennai, Tamil Nadu 600001"
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={4}
              />
              {error && <p style={s.error}>{error}</p>}
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Order Items</h3>
              {cartItems.map(item => (
                <div key={item.id} style={s.itemRow}>
                  <span style={s.itemName}>{item.product.name}</span>
                  <span style={s.itemQty}>× {item.quantity}</span>
                  <span style={s.itemPrice}>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.summary}>
            <h3 style={s.cardTitle}>Order Summary</h3>
            <div style={s.row}><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
            <div style={s.row}><span>Shipping</span><span style={{ color: 'green' }}>Free</span></div>
            <div style={s.row}><span>Tax (18% GST)</span><span>₹{(total * 0.18).toFixed(2)}</span></div>
            <div style={{ ...s.row, fontWeight: 600, fontSize: '16px', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '6px' }}>
              <span>Total</span><span>₹{(total * 1.18).toFixed(2)}</span>
            </div>
            <button
              style={{ ...s.btn, opacity: placing ? 0.7 : 1 }}
              onClick={placeOrder}
              disabled={placing}
            >
              {placing ? 'Processing...' : 'Continue to Payment →'}
            </button>
            <p style={s.note}>You will be redirected to Razorpay secure payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight: '100vh', background: '#f5f5f5' },
  header:    { background: '#fff', borderBottom: '1px solid #eee', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:     { fontSize: '16px', fontWeight: 600 },
  back:      { fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', color: '#555' },
  content:   { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' },
  title:     { fontSize: '22px', fontWeight: 600, marginBottom: '1.5rem' },
  layout:    { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  left:      { flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' },
  card:      { background: '#fff', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '15px', fontWeight: 600, margin: '0 0 12px' },
  textarea:  { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  error:     { color: '#c0392b', fontSize: '13px', marginTop: '8px' },
  itemRow:   { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '0.5px solid #f0f0f0' },
  itemName:  { flex: 1, fontSize: '13px' },
  itemQty:   { fontSize: '13px', color: '#888' },
  itemPrice: { fontSize: '13px', fontWeight: 500 },
  summary:   { width: '280px', background: '#fff', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 },
  row:       { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555', marginBottom: '8px' },
  btn:       { width: '100%', marginTop: '1rem', padding: '12px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  note:      { fontSize: '11px', color: '#aaa', textAlign: 'center', marginTop: '8px' },
};