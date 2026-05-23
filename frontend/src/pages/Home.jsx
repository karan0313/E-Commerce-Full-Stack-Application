import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.brand}>ShopApp</span>
        <div style={styles.userRow}>
          <span style={styles.userName}>Hello, {user.name || 'User'}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>
      <div style={styles.content}>
        <h2 style={{ fontWeight: 500 }}>Welcome back, {user.name}!</h2>
        <p style={{ color: '#666' }}>Product catalog coming in Phase 4.</p>
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight:'100vh', background:'#f5f5f5' },
  header:    { background:'#fff', borderBottom:'1px solid #eee', padding:'0 2rem', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  brand:     { fontSize:'16px', fontWeight:500 },
  userRow:   { display:'flex', alignItems:'center', gap:'12px' },
  userName:  { fontSize:'14px', color:'#444' },
  logoutBtn: { fontSize:'13px', padding:'6px 14px', border:'1px solid #ddd', borderRadius:'8px', background:'#fff', cursor:'pointer' },
  content:   { maxWidth:'800px', margin:'3rem auto', padding:'0 1rem' },
};