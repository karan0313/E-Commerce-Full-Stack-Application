import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const CAT_COLORS = {
  Electronics: 'linear-gradient(135deg,#667eea,#764ba2)',
  Fashion:     'linear-gradient(135deg,#f093fb,#f5576c)',
  Food:        'linear-gradient(135deg,#4facfe,#00f2fe)',
  Books:       'linear-gradient(135deg,#43e97b,#38f9d7)',
  Sports:      'linear-gradient(135deg,#fa709a,#fee140)',
  Beauty:      'linear-gradient(135deg,#a18cd1,#fbc2eb)',
};

function StarRating({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}
          style={{ fontSize: size, cursor: onChange ? 'pointer' : 'default', color: star <= (hover || value) ? '#f7971e' : '#e0e0e0', transition: 'color 0.1s' }}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
        >★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review, onDelete, isOwn }) {
  return (
    <div style={s.reviewCard}>
      <div style={s.reviewHeader}>
        <div style={s.avatar}>{review.user?.name?.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={s.reviewName}>{review.user?.name}</span>
            <StarRating value={review.rating} size={16} />
          </div>
          <span style={s.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        {isOwn && (
          <button style={s.deleteBtn} onClick={() => onDelete(review.id)}>✕</button>
        )}
      </div>
      {review.comment && <p style={s.reviewComment}>{review.comment}</p>}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct]       = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [stats, setStats]           = useState({ average: 0, count: 0 });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [myRating, setMyRating]     = useState(0);
  const [myComment, setMyComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState('');
  const [cartMsg, setCartMsg]       = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get(`/api/products/${id}`).then(r => setProduct(r.data)).catch(() => navigate('/'));
    api.get(`/api/reviews/product/${id}`).then(r => setReviews(Array.isArray(r.data) ? r.data : []));
    api.get(`/api/reviews/product/${id}/stats`).then(r => setStats(r.data));
    api.get(`/api/reviews/product/${id}/mine`).then(r => setHasReviewed(r.data.hasReviewed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post('/api/cart', { productId: product.id, quantity: 1 });
      setCartMsg('Added to cart!');
      setTimeout(() => setCartMsg(''), 2000);
    } catch { setCartMsg('Failed to add'); }
  };

  const submitReview = async () => {
    if (!myRating) return setMsg('Please select a rating');
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/reviews/product/${id}`, { rating: myRating, comment: myComment });
      setReviews(prev => [data, ...prev.filter(r => r.user?.email !== user.email)]);
      setStats(prev => ({ ...prev, count: hasReviewed ? prev.count : prev.count + 1 }));
      api.get(`/api/reviews/product/${id}/stats`).then(r => setStats(r.data));
      setHasReviewed(true);
      setMyRating(0);
      setMyComment('');
      setMsg('Review submitted!');
      setTimeout(() => setMsg(''), 2000);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const deleteReview = async (reviewId) => {
    await api.delete(`/api/reviews/${reviewId}`);
    setReviews(reviews.filter(r => r.id !== reviewId));
    setHasReviewed(false);
    api.get(`/api/reviews/product/${id}/stats`).then(r => setStats(r.data));
  };

  if (!product) return <p style={{ padding: '2rem' }}>Loading...</p>;

  const gradient = CAT_COLORS[product.category] || 'linear-gradient(135deg,#667eea,#764ba2)';

  return (
    <div style={s.page}>
      <div style={s.bgBlob1} /><div style={s.bgBlob2} />

      {/* Header */}
      <header style={s.header}>
        <button style={s.back} onClick={() => navigate('/')}>← Shop</button>
        <div style={s.logo}>🛍 <span style={s.logoText}>ShopApp</span></div>
        <button style={s.cartBtn} onClick={() => navigate('/cart')}>🛒 Cart</button>
      </header>

      <div style={s.content}>
        {/* Product section */}
        <div style={s.productCard}>
          <div style={{ ...s.imgBox, background: gradient }}>
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} style={s.img} />
              : <span style={{ fontSize: '80px' }}>📦</span>}
            <span style={s.catBadge}>{product.category}</span>
          </div>

          <div style={s.productInfo}>
            <h1 style={s.productName}>{product.name}</h1>

            {/* Rating summary */}
            <div style={s.ratingRow}>
              <StarRating value={Math.round(stats.average)} size={22} />
              <span style={s.ratingVal}>{stats.average > 0 ? stats.average.toFixed(1) : 'No ratings'}</span>
              <span style={s.ratingCount}>({stats.count} review{stats.count !== 1 ? 's' : ''})</span>
            </div>

            <p style={s.productDesc}>{product.description}</p>
            <p style={s.productPrice}>₹{product.price?.toLocaleString()}</p>
            <p style={s.stock}>{product.stock > 0 ? `✅ In stock (${product.stock})` : '❌ Out of stock'}</p>

            {cartMsg && <p style={s.cartMsg}>{cartMsg}</p>}
            <button
              style={{ ...s.addBtn, opacity: product.stock === 0 ? 0.5 : 1, background: gradient }}
              onClick={addToCart} disabled={product.stock === 0}
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>

        {/* Reviews section */}
        <div style={s.reviewsSection}>
          <h2 style={s.sectionTitle}>Customer Reviews</h2>

          {/* Rating breakdown */}
          {stats.count > 0 && (
            <div style={s.ratingBig}>
              <div style={s.ratingBigNum}>{stats.average.toFixed(1)}</div>
              <StarRating value={Math.round(stats.average)} size={32} />
              <div style={s.ratingBigCount}>{stats.count} reviews</div>
            </div>
          )}

          {/* Write review */}
          <div style={s.writeReview}>
            <h3 style={s.writeTitle}>{hasReviewed ? 'Update Your Review' : 'Write a Review'}</h3>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>Your rating</p>
              <StarRating value={myRating} onChange={setMyRating} size={32} />
            </div>
            <textarea
              style={s.textarea}
              placeholder="Share your experience with this product... (optional)"
              value={myComment}
              onChange={e => setMyComment(e.target.value)}
              rows={3}
            />
            {msg && <p style={{ fontSize: '13px', color: msg.includes('!') ? '#43e97b' : '#f5576c', margin: '6px 0' }}>{msg}</p>}
            <button
              style={{ ...s.submitBtn, background: gradient, opacity: submitting ? 0.7 : 1 }}
              onClick={submitReview} disabled={submitting}
            >
              {submitting ? 'Submitting...' : hasReviewed ? 'Update Review' : 'Submit Review'}
            </button>
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <div style={s.noReviews}>
              <p style={{ fontSize: '32px' }}>💬</p>
              <p>No reviews yet — be the first!</p>
            </div>
          ) : (
            reviews.map(r => (
              <ReviewCard key={r.id} review={r}
                isOwn={r.user?.email === user.email}
                onDelete={deleteReview}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:         { minHeight: '100vh', background: '#f0f2ff', fontFamily: "'Nunito', sans-serif", position: 'relative' },
  bgBlob1:      { position: 'fixed', top: '-200px', right: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(102,126,234,0.12),transparent)', pointerEvents: 'none' },
  bgBlob2:      { position: 'fixed', bottom: '-200px', left: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,147,251,0.12),transparent)', pointerEvents: 'none' },
  header:       { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '64px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' },
  back:         { fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontFamily: 'inherit' },
  logo:         { fontSize: '18px', fontWeight: 800 },
  logoText:     { background: 'linear-gradient(135deg,#667eea,#f5576c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  cartBtn:      { padding: '8px 18px', background: 'linear-gradient(135deg,#f7971e,#ffd200)', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit' },
  content:      { maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem 4rem' },
  productCard:  { background: '#fff', borderRadius: '24px', overflow: 'hidden', display: 'flex', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  imgBox:       { width: '380px', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 },
  img:          { width: '100%', height: '100%', objectFit: 'cover' },
  catBadge:     { position: 'absolute', top: '14px', left: '14px', background: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '50px', color: '#333' },
  productInfo:  { padding: '2rem', flex: 1 },
  productName:  { fontSize: '24px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 10px' },
  ratingRow:    { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  ratingVal:    { fontSize: '16px', fontWeight: 700, color: '#f7971e' },
  ratingCount:  { fontSize: '13px', color: '#888' },
  productDesc:  { fontSize: '14px', color: '#666', lineHeight: 1.7, margin: '0 0 16px' },
  productPrice: { fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 8px' },
  stock:        { fontSize: '13px', color: '#666', margin: '0 0 16px' },
  cartMsg:      { fontSize: '13px', color: '#43e97b', fontWeight: 600, margin: '0 0 8px' },
  addBtn:       { padding: '13px 32px', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  reviewsSection:{ background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
  sectionTitle: { fontSize: '20px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 1.5rem' },
  ratingBig:    { display: 'flex', alignItems: 'center', gap: '16px', background: '#f8f8ff', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem' },
  ratingBigNum: { fontSize: '48px', fontWeight: 900, background: 'linear-gradient(135deg,#f7971e,#ffd200)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 },
  ratingBigCount:{ fontSize: '13px', color: '#888' },
  writeReview:  { background: 'linear-gradient(135deg,rgba(102,126,234,0.05),rgba(240,147,251,0.05))', border: '1px solid rgba(102,126,234,0.15)', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem' },
  writeTitle:   { fontSize: '15px', fontWeight: 700, margin: '0 0 12px', color: '#1a1a2e' },
  textarea:     { width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: '12px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', margin: '10px 0', outline: 'none' },
  submitBtn:    { padding: '10px 24px', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  noReviews:    { textAlign: 'center', padding: '2rem', color: '#888' },
  reviewCard:   { border: '0.5px solid #eee', borderRadius: '16px', padding: '1rem', marginBottom: '10px' },
  reviewHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' },
  avatar:       { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0 },
  reviewName:   { fontSize: '14px', fontWeight: 700, color: '#1a1a2e' },
  reviewDate:   { fontSize: '11px', color: '#aaa' },
  deleteBtn:    { background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '14px', marginLeft: 'auto' },
  reviewComment:{ fontSize: '14px', color: '#555', lineHeight: 1.6, margin: 0 },
};
