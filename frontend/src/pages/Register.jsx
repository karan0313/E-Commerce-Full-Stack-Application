import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.card}>
        <div style={s.logoRow}>
          <span style={s.logoIcon}>🛍</span>
          <span style={s.logoText}>ShopApp</span>
        </div>
        <h2 style={s.title}>Create Account</h2>
        <p style={s.sub}>Join thousands of happy shoppers</p>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.inputWrap}>
            <span style={s.inputIcon}>👤</span>
            <input style={s.input} type="text" name="name" placeholder="Full name"
              value={form.name} onChange={handleChange} required />
          </div>
          <div style={s.inputWrap}>
            <span style={s.inputIcon}>📧</span>
            <input style={s.input} type="email" name="email" placeholder="Email address"
              value={form.email} onChange={handleChange} required />
          </div>
          <div style={s.inputWrap}>
            <span style={s.inputIcon}>🔒</span>
            <input style={s.input} type="password" name="password" placeholder="Password (min 6 chars)"
              value={form.password} onChange={handleChange} minLength={6} required />
          </div>
          <button style={{ ...s.btn, opacity: loading ? 0.8 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <p style={s.link}>Already have an account? <Link to="/login" style={s.linkA}>Sign in</Link></p>
      </div>
    </div>
  );
}

const s = {
  page:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2ff', position: 'relative', overflow: 'hidden', fontFamily: "'Nunito', sans-serif" },
  blob1:    { position: 'fixed', top: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(67,233,123,0.2),transparent)', pointerEvents: 'none' },
  blob2:    { position: 'fixed', bottom: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(247,151,30,0.2),transparent)', pointerEvents: 'none' },
  card:     { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderRadius: '28px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', position: 'relative', zIndex: 1 },
  logoRow:  { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' },
  logoIcon: { fontSize: '28px' },
  logoText: { fontSize: '22px', fontWeight: 900, background: 'linear-gradient(135deg,#43e97b,#38f9d7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  title:    { fontSize: '26px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', textAlign: 'center' },
  sub:      { fontSize: '14px', color: '#888', margin: '0 0 1.5rem', textAlign: 'center' },
  error:    { background: 'rgba(245,87,108,0.1)', border: '1px solid rgba(245,87,108,0.3)', color: '#f5576c', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '1rem' },
  inputWrap:{ display: 'flex', alignItems: 'center', background: '#f4f4f8', borderRadius: '14px', padding: '0 16px', marginBottom: '12px', gap: '10px' },
  inputIcon:{ fontSize: '16px', opacity: 0.6 },
  input:    { flex: 1, border: 'none', background: 'transparent', padding: '13px 0', fontSize: '14px', outline: 'none', color: '#1a1a2e' },
  btn:      { width: '100%', padding: '14px', background: 'linear-gradient(135deg,#43e97b,#38f9d7)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' },
  link:     { textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '1rem' },
  linkA:    { color: '#43e97b', fontWeight: 700, textDecoration: 'none' },
};