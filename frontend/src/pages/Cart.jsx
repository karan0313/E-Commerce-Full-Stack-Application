import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/api/cart');
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (itemId, quantity) => {
    if (quantity < 1) return removeItem(itemId);
    await api.put(`/api/cart/${itemId}`, { quantity });
    setItems(items.map(i => i.id === itemId ? { ...i, quantity } : i));
  };

  const removeItem = async (itemId) => {
    await api.delete(`/api/cart/${itemId}`);
    setItems(items.filter(i => i.id !== itemId));
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate('/')}>← Continue Shopping</button>
        <span style={s.brand}>ShopApp</span>
        <span />
      </div>

      <div style={s.content}>
        <h2 style={s.title}>Your Cart</h2>

        {loading ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : items.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: '48px' }}>🛒</p>
            <p>Your cart is empty</p>
            <button style={s.shopBtn} onClick={() => navigate('/')}>Browse Products</button>
          </div>
        ) : (
          <div style={s.layout}>
            <div style={s.itemsList}>
              {items.map(item => (
                <div key={item.id} style={s.card}>
                  <div style={s.imgBox}>
                    {item.product.imageUrl
                      ? <img src={item.product.imageUrl} alt={item.product.name} style={s.img} />
                      : <span style={{ fontSize: '28px' }}>📦</span>}
                  </div>
                  <div style={s.info}>
                    <p style={s.name}>{item.product.name}</p>
                    <p style={s.price}>₹{item.product.price?.toFixed(2)}</p>
                  </div>
                  <div style={s.qtyRow}>
                    <button style={s.qtyBtn} onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                    <span style={s.qty}>{item.quantity}</span>
                    <button style={s.qtyBtn} onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <p style={s.subtotal}>₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  <button style={s.removeBtn} onClick={() => removeItem(item.id)}>✕</button>
                </div>
              ))}
            </div>

            <div style={s.summary}>
              <h3 style={s.summaryTitle}>Order Summary</h3>
              <div style={s.summaryRow}>
                <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div style={s.summaryRow}>
                <span>Shipping</span>
                <span style={{ color: 'green' }}>Free</span>
              </div>
              <div style={{ ...s.summaryRow, fontWeight: 600, fontSize: '16px', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '6px' }}>
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button style={s.checkoutBtn} onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:         { minHeight: '100vh', background: '#f5f5f5' },
  header:       { background: '#fff', borderBottom: '1px solid #eee', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:        { fontSize: '16px', fontWeight: 600 },
  back:         { fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', color: '#555' },
  content:      { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' },
  title:        { fontSize: '22px', fontWeight: 600, marginBottom: '1.5rem' },
  empty:        { textAlign: 'center', padding: '4rem', color: '#888' },
  shopBtn:      { marginTop: '1rem', padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  layout:       { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  itemsList:    { flex: 1 },
  card:         { background: '#fff', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  imgBox:       { width: '64px', height: '64px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  img:          { width: '100%', height: '100%', objectFit: 'cover' },
  info:         { flex: 1 },
  name:         { fontSize: '14px', fontWeight: 500, margin: '0 0 4px' },
  price:        { fontSize: '13px', color: '#888', margin: 0 },
  qtyRow:       { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn:       { width: '28px', height: '28px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '16px' },
  qty:          { fontSize: '14px', minWidth: '20px', textAlign: 'center' },
  subtotal:     { fontSize: '14px', fontWeight: 600, minWidth: '80px', textAlign: 'right' },
  removeBtn:    { background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '16px' },
  summary:      { width: '280px', background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 },
  summaryTitle: { fontSize: '16px', fontWeight: 600, margin: '0 0 1rem' },
  summaryRow:   { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555', marginBottom: '8px' },
  checkoutBtn:  { width: '100%', marginTop: '1.2rem', padding: '12px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
};