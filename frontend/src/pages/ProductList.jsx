import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import StarBadge from '../components/StarBadge';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Food', 'Books', 'Sports', 'Beauty'];

const CAT_COLORS = {
  Electronics: 'linear-gradient(135deg,#667eea,#764ba2)',
  Fashion:     'linear-gradient(135deg,#f093fb,#f5576c)',
  Food:        'linear-gradient(135deg,#4facfe,#00f2fe)',
  Books:       'linear-gradient(135deg,#43e97b,#38f9d7)',
  Sports:      'linear-gradient(135deg,#fa709a,#fee140)',
  Beauty:      'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  All:         'linear-gradient(135deg,#f7971e,#ffd200)',
};

export default function ProductList() {
  const [products, setProducts]   = useState([]);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [loading, setLoading]     = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      const { data } = await api.get('/api/products', { params });
      setProducts(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCartCount = async () => {
    try {
      const { data } = await api.get('/api/cart');
      setCartCount(Array.isArray(data) ? data.reduce((s, i) => s + i.quantity, 0) : 0);
    } catch {}
  };

  useEffect(() => { fetchProducts(); fetchCartCount(); }, [category]); // eslint-disable-line

  const addToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await api.post('/api/cart', { productId, quantity: 1 });
      setCartCount(c => c + 1);
    } catch {}
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div style={s.page}>
      <div style={s.bgBlob1} />
      <div style={s.bgBlob2} />
      <div style={s.bgBlob3} />

      <header style={s.header}>
        <div style={s.logo}>
          <span style={s.logoIcon}>🛍</span>
          <span style={s.logoText}>ShopApp</span>
        </div>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchProducts()}
          />
        </div>
        <div style={s.headerRight}>
          <span style={s.userName}>Hi, {user.name?.split(' ')[0]} 👋</span>
          {user.role === 'ADMIN' && (
            <button style={s.adminBtn} onClick={() => navigate('/admin')}>⚙️ Admin</button>
          )}
          <button style={s.ordersBtn} onClick={() => navigate('/orders')}>📦 Orders</button>
          <button style={s.cartBtn} onClick={() => navigate('/cart')}>
            🛒 {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
          </button>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </header>

      <div style={s.hero}>
        <h1 style={s.heroTitle}>Find Everything<br /><span style={s.heroAccent}>You Love</span></h1>
        <p style={s.heroSub}>Electronics · Fashion · Food · Books · Sports · Beauty</p>
      </div>

      <div style={s.catRow}>
        {CATEGORIES.map(cat => (
          <button key={cat}
            style={{ ...s.catPill, background: category === cat || (cat === 'All' && !category) ? CAT_COLORS[cat] : '#fff', color: category === cat || (cat === 'All' && !category) ? '#fff' : '#555', boxShadow: category === cat || (cat === 'All' && !category) ? '0 4px 15px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)', transform: category === cat || (cat === 'All' && !category) ? 'scale(1.07)' : 'scale(1)' }}
            onClick={() => setCategory(cat === 'All' ? '' : cat)}
          >{cat}</button>
        ))}
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={s.loadingWrap}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={s.skeleton} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: '48px' }}>🔍</p>
            <p style={{ fontSize: '18px', fontWeight: 500 }}>No products found</p>
          </div>
        ) : (
          <div style={s.grid}>
            {products.map(p => (
              <div key={p.id} style={s.card} onClick={() => navigate(`/products/${p.id}`)}>
                <div style={{ ...s.cardImg, background: CAT_COLORS[p.category] || CAT_COLORS.All }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} style={s.img} />
                    : <span style={{ fontSize: '48px' }}>📦</span>}
                  <div style={s.cardBadge}>{p.category}</div>
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.cardName}>{p.name}</h3>
                  <p style={s.cardDesc}>{p.description?.slice(0, 60)}...</p>
                  {/* ⭐ Star rating badge */}
                  <div style={{ marginBottom: '8px' }}>
                    <StarBadge productId={p.id} />
                  </div>
                  <div style={s.cardFooter}>
                    <span style={s.cardPrice}>₹{p.price?.toLocaleString()}</span>
                    <button style={{ ...s.addBtn, opacity: p.stock === 0 ? 0.5 : 1 }}
                      onClick={e => addToCart(e, p.id)} disabled={p.stock === 0}>
                      {p.stock === 0 ? 'Out' : '+ Cart'}
                    </button>
                  </div>
                  {p.stock <= 5 && p.stock > 0 && (
                    <p style={s.lowStock}>⚡ Only {p.stock} left!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', background: '#f0f2ff', position: 'relative', overflow: 'hidden', fontFamily: "'Nunito', sans-serif" },
  bgBlob1:    { position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(102,126,234,0.15),transparent)', pointerEvents: 'none' },
  bgBlob2:    { position: 'fixed', bottom: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,147,251,0.15),transparent)', pointerEvents: 'none' },
  bgBlob3:    { position: 'fixed', top: '40%', left: '40%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(67,233,123,0.08),transparent)', pointerEvents: 'none' },
  header:     { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 2rem', height: '64px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' },
  logo:       { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  logoIcon:   { fontSize: '24px' },
  logoText:   { fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#f5576c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  searchWrap: { flex: 1, display: 'flex', alignItems: 'center', background: '#f4f4f8', borderRadius: '50px', padding: '0 16px', gap: '8px', maxWidth: '480px' },
  searchIcon: { fontSize: '14px', opacity: 0.5 },
  searchInput:{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: '14px', outline: 'none' },
  headerRight:{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' },
  userName:   { fontSize: '13px', color: '#555', whiteSpace: 'nowrap' },
  adminBtn:   { padding: '6px 14px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
  ordersBtn:  { padding: '6px 14px', background: '#f4f4f8', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#555' },
  cartBtn:    { position: 'relative', padding: '8px 14px', background: 'linear-gradient(135deg,#f7971e,#ffd200)', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 },
  cartBadge:  { position: 'absolute', top: '-4px', right: '-4px', background: '#f5576c', color: '#fff', fontSize: '10px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoutBtn:  { padding: '6px 14px', background: '#fff', border: '1px solid #eee', borderRadius: '50px', cursor: 'pointer', fontSize: '12px', color: '#888' },
  hero:       { textAlign: 'center', padding: '3rem 1rem 1.5rem', position: 'relative' },
  heroTitle:  { fontSize: '42px', fontWeight: 900, color: '#1a1a2e', margin: '0 0 8px', lineHeight: 1.2 },
  heroAccent: { background: 'linear-gradient(135deg,#667eea,#f5576c,#f7971e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub:    { fontSize: '15px', color: '#888', margin: 0 },
  catRow:     { display: 'flex', gap: '10px', padding: '0 2rem 1.5rem', overflowX: 'auto', scrollbarWidth: 'none' },
  catPill:    { padding: '8px 20px', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s' },
  content:    { maxWidth: '1300px', margin: '0 auto', padding: '0 2rem 4rem' },
  loadingWrap:{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '20px' },
  skeleton:   { height: '320px', borderRadius: '20px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' },
  empty:      { textAlign: 'center', padding: '4rem', color: '#888' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '20px' },
  card:       { background: '#fff', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.2s,box-shadow 0.2s' },
  cardImg:    { height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  img:        { width: '100%', height: '100%', objectFit: 'cover' },
  cardBadge:  { position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '50px', color: '#333' },
  cardBody:   { padding: '14px' },
  cardName:   { fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: '#1a1a2e' },
  cardDesc:   { fontSize: '12px', color: '#888', margin: '0 0 6px', lineHeight: 1.5 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardPrice:  { fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  addBtn:     { padding: '7px 16px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 },
  lowStock:   { fontSize: '11px', color: '#f5576c', fontWeight: 600, margin: '6px 0 0' },
};