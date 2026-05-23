import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_COLOR = {
  PLACED: '#185FA5', PROCESSING: '#854F0B',
  SHIPPED: '#533AB7', DELIVERED: '#639922', CANCELLED: '#c0392b'
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/orders')
      .then(r => {
        const data = r.data;
        setOrders(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate('/')}>← Shop</button>
        <span style={s.brand}>ShopApp</span>
        <button style={s.cartBtn} onClick={() => navigate('/cart')}>🛒 Cart</button>
      </div>

      <div style={s.content}>
        <h2 style={s.title}>My Orders</h2>

        {loading ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : orders.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: '48px' }}>📦</p>
            <p>No orders yet</p>
            <button style={s.shopBtn} onClick={() => navigate('/')}>Start Shopping</button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={s.card} onClick={() => navigate(`/orders/${order.id}`)}>
              <div style={s.cardTop}>
                <div>
                  <p style={s.orderId}>Order #{order.id}</p>
                  <p style={s.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span style={{ ...s.badge, background: STATUS_COLOR[order.status] + '22', color: STATUS_COLOR[order.status] }}>
                  {order.status}
                </span>
              </div>
              <div style={s.itemsRow}>
                {order.items?.slice(0, 3).map(item => (
                  <span key={item.id} style={s.itemChip}>{item.product?.name} × {item.quantity}</span>
                ))}
                {order.items?.length > 3 && <span style={s.itemChip}>+{order.items.length - 3} more</span>}
              </div>
              <div style={s.cardBottom}>
                <span style={s.total}>Total: ₹{order.totalAmount?.toFixed(2)}</span>
                <span style={s.viewBtn}>View details →</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight: '100vh', background: '#f5f5f5' },
  header:    { background: '#fff', borderBottom: '1px solid #eee', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:     { fontSize: '16px', fontWeight: 600 },
  back:      { fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', color: '#555' },
  cartBtn:   { fontSize: '13px', padding: '6px 14px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer' },
  content:   { maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' },
  title:     { fontSize: '22px', fontWeight: 600, marginBottom: '1.5rem' },
  empty:     { textAlign: 'center', padding: '4rem', color: '#888' },
  shopBtn:   { marginTop: '1rem', padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  card:      { background: '#fff', borderRadius: '12px', padding: '1rem 1.2rem', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' },
  cardTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  orderId:   { fontSize: '15px', fontWeight: 600, margin: '0 0 2px' },
  orderDate: { fontSize: '12px', color: '#888', margin: 0 },
  badge:     { fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: 500 },
  itemsRow:  { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' },
  itemChip:  { fontSize: '12px', background: '#f5f5f5', padding: '3px 10px', borderRadius: '999px', color: '#555' },
  cardBottom:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid #f0f0f0', paddingTop: '10px' },
  total:     { fontSize: '14px', fontWeight: 600 },
  viewBtn:   { fontSize: '13px', color: '#185FA5' },
};