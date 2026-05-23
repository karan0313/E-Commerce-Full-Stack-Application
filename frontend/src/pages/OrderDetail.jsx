import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_STEPS = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_COLOR = {
  PLACED: '#185FA5', PROCESSING: '#854F0B',
  SHIPPED: '#533AB7', DELIVERED: '#639922', CANCELLED: '#c0392b'
};

export default function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(!state?.order);
  const navigate = useNavigate();
  const isNew = state?.isNew;

  useEffect(() => {
    if (!order) {
      api.get(`/api/orders/${id}`)
        .then(r => setOrder(r.data))
        .catch(() => navigate('/orders'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (!order) return null;

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate('/orders')}>← My Orders</button>
        <span style={s.brand}>ShopApp</span>
        <span />
      </div>

      <div style={s.content}>
        {isNew && (
          <div style={s.successBanner}>
            <span style={{ fontSize: '24px' }}>🎉</span>
            <span>Order placed successfully!</span>
          </div>
        )}

        <div style={s.orderHeader}>
          <div>
            <h2 style={s.title}>Order #{order.id}</h2>
            <p style={s.meta}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span style={{ ...s.statusBadge, background: STATUS_COLOR[order.status] + '22', color: STATUS_COLOR[order.status] }}>
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        {order.status !== 'CANCELLED' && (
          <div style={s.card}>
            <div style={s.tracker}>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} style={s.stepWrapper}>
                  <div style={{ ...s.stepDot, background: i <= stepIndex ? '#1a1a1a' : '#e0e0e0' }}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span style={{ ...s.stepLabel, color: i <= stepIndex ? '#1a1a1a' : '#aaa' }}>{step}</span>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ ...s.stepLine, background: i < stepIndex ? '#1a1a1a' : '#e0e0e0' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={s.layout}>
          <div style={s.left}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Items</h3>
              {order.items?.map(item => (
                <div key={item.id} style={s.itemRow}>
                  <div style={s.imgBox}>
                    {item.product?.imageUrl
                      ? <img src={item.product.imageUrl} alt={item.product.name} style={s.img} />
                      : <span style={{ fontSize: '20px' }}>📦</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={s.itemName}>{item.product?.name}</p>
                    <p style={s.itemMeta}>Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                  </div>
                  <span style={s.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <h3 style={s.cardTitle}>Shipping Address</h3>
              <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>{order.shippingAddress}</p>
            </div>
          </div>

          <div style={s.summary}>
            <h3 style={s.cardTitle}>Payment Summary</h3>
            <div style={s.row}><span>Subtotal</span><span>₹{(order.totalAmount / 1.18).toFixed(2)}</span></div>
            <div style={s.row}><span>GST (18%)</span><span>₹{(order.totalAmount - order.totalAmount / 1.18).toFixed(2)}</span></div>
            <div style={s.row}><span>Shipping</span><span style={{ color: 'green' }}>Free</span></div>
            <div style={{ ...s.row, fontWeight: 600, fontSize: '16px', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '6px' }}>
              <span>Total Paid</span><span>₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:          { minHeight: '100vh', background: '#f5f5f5' },
  header:        { background: '#fff', borderBottom: '1px solid #eee', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:         { fontSize: '16px', fontWeight: 600 },
  back:          { fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', color: '#555' },
  content:       { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
  successBanner: { background: '#EAF3DE', border: '1px solid #c3e6a1', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 500, color: '#3B6D11', marginBottom: '1.5rem' },
  orderHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  title:         { fontSize: '22px', fontWeight: 600, margin: '0 0 4px' },
  meta:          { fontSize: '13px', color: '#888', margin: 0 },
  statusBadge:   { fontSize: '12px', padding: '4px 12px', borderRadius: '999px', fontWeight: 500 },
  card:          { background: '#fff', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1rem' },
  tracker:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' },
  stepWrapper:   { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  stepDot:       { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '6px', zIndex: 1 },
  stepLabel:     { fontSize: '11px', fontWeight: 500, textAlign: 'center' },
  stepLine:      { position: 'absolute', top: '16px', left: '60%', width: '80%', height: '2px', zIndex: 0 },
  layout:        { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  left:          { flex: 1 },
  cardTitle:     { fontSize: '15px', fontWeight: 600, margin: '0 0 12px' },
  itemRow:       { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '0.5px solid #f0f0f0' },
  imgBox:        { width: '48px', height: '48px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  img:           { width: '100%', height: '100%', objectFit: 'cover' },
  itemName:      { fontSize: '14px', fontWeight: 500, margin: '0 0 2px' },
  itemMeta:      { fontSize: '12px', color: '#888', margin: 0 },
  itemTotal:     { fontSize: '14px', fontWeight: 600 },
  summary:       { width: '260px', background: '#fff', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 },
  row:           { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555', marginBottom: '8px' },
};