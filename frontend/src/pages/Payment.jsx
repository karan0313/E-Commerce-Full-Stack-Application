import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Payment() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Load order
    api.get(`/api/orders/${orderId}`)
      .then(r => setOrder(r.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));

    return () => document.body.removeChild(script);
  }, [orderId]);

  const handlePayment = async () => {
    setPaying(true);
    setError('');
    try {
      // Step 1 — create Razorpay order
      const { data } = await api.post('/api/payment/create-order', { orderId });

      // Step 2 — open Razorpay popup
      const options = {
        key:          data.keyId,
        amount:       data.amount,
        currency:     data.currency,
        name:         'ShopApp',
        description:  `Order #${data.orderId}`,
        order_id:     data.razorpayOrderId,
        prefill: {
          name:  data.customerName,
          email: data.customerEmail,
        },
        theme: { color: '#1a1a1a' },

        handler: async (response) => {
          try {
            // Step 3 — verify on backend
            await api.post('/api/payment/verify', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId:           String(data.orderId),
            });
            navigate(`/orders/${data.orderId}`, {
              state: { paymentSuccess: true }
            });
          } catch {
            setError('Payment verification failed. Contact support.');
          }
        },

        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(`Payment failed: ${resp.error.description}`);
        setPaying(false);
      });
      rzp.open();

    } catch (e) {
      setError(e.response?.data?.error || 'Failed to initiate payment');
      setPaying(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (!order) return null;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate('/orders')}>← My Orders</button>
        <span style={s.brand}>ShopApp</span>
        <span />
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <div style={s.iconRow}>🔒</div>
          <h2 style={s.title}>Complete Payment</h2>
          <p style={s.subtitle}>Order #{order.id} • Secure payment via Razorpay</p>

          <div style={s.summaryBox}>
            {order.items?.map(item => (
              <div key={item.id} style={s.itemRow}>
                <span>{item.product?.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={s.divider} />
            <div style={{ ...s.itemRow, fontWeight: 600, fontSize: '16px' }}>
              <span>Total</span>
              <span>₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button
            style={{ ...s.payBtn, opacity: paying ? 0.7 : 1 }}
            onClick={handlePayment}
            disabled={paying}
          >
            {paying ? 'Opening payment...' : `Pay ₹${order.totalAmount?.toFixed(2)}`}
          </button>

          <p style={s.note}>
            🔒 100% secure • Powered by Razorpay<br />
            <span style={{ fontSize: '11px', color: '#aaa' }}>
              Test card: 4111 1111 1111 1111 | Exp: any future date | CVV: any
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', background: '#f5f5f5' },
  header:     { background: '#fff', borderBottom: '1px solid #eee', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:      { fontSize: '16px', fontWeight: 600 },
  back:       { fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', color: '#555' },
  content:    { maxWidth: '440px', margin: '3rem auto', padding: '0 1rem' },
  card:       { background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' },
  iconRow:    { fontSize: '36px', marginBottom: '12px' },
  title:      { fontSize: '22px', fontWeight: 600, margin: '0 0 6px' },
  subtitle:   { fontSize: '13px', color: '#888', margin: '0 0 1.5rem' },
  summaryBox: { background: '#f8f8f8', borderRadius: '10px', padding: '1rem', marginBottom: '1.2rem', textAlign: 'left' },
  itemRow:    { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555', marginBottom: '6px' },
  divider:    { borderTop: '1px solid #eee', margin: '10px 0' },
  error:      { color: '#c0392b', fontSize: '13px', marginBottom: '10px' },
  payBtn:     { width: '100%', padding: '14px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 500, cursor: 'pointer', marginBottom: '12px' },
  note:       { fontSize: '12px', color: '#888', lineHeight: 1.6 },
};