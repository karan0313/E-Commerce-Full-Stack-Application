import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TABS = ['Overview', 'Orders', 'Products', 'Users'];
const STATUS_OPTIONS = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_COLOR = {
  PLACED: '#185FA5', PROCESSING: '#854F0B',
  SHIPPED: '#533AB7', DELIVERED: '#639922', CANCELLED: '#c0392b'
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Guard — only ADMIN
  useEffect(() => {
    if (user.role !== 'ADMIN') navigate('/');
  }, []);

  useEffect(() => {
    api.get('/api/admin/stats').then(r => setStats(r.data));
    api.get('/api/admin/orders').then(r => setOrders(Array.isArray(r.data) ? r.data : []));
    api.get('/api/admin/products').then(r => setProducts(Array.isArray(r.data) ? r.data : []));
    api.get('/api/admin/users').then(r => setUsers(Array.isArray(r.data) ? r.data : []));
  }, []);

  const updateStatus = async (orderId, status) => {
    await api.put(`/api/admin/orders/${orderId}/status`, { status });
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const openAdd = () => {
    setEditProduct(null);
    setProductForm({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
    setShowAddProduct(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setProductForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, imageUrl: p.imageUrl || '' });
    setShowAddProduct(true);
  };

  const saveProduct = async () => {
    try {
      const payload = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) };
      if (editProduct) {
        const { data } = await api.put(`/api/admin/products/${editProduct.id}`, payload);
        setProducts(products.map(p => p.id === editProduct.id ? data : p));
        setMsg('Product updated!');
      } else {
        const { data } = await api.post('/api/admin/products', payload);
        setProducts([...products, data]);
        setMsg('Product added!');
      }
      setShowAddProduct(false);
      setTimeout(() => setMsg(''), 2000);
    } catch (e) {
      setMsg('Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/api/admin/products/${id}`);
    setProducts(products.filter(p => p.id !== id));
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.brand}>⚙️ Admin</div>
        {TABS.map(t => (
          <div key={t} style={{ ...s.navItem, background: tab === t ? '#2a2a2a' : 'transparent', color: tab === t ? '#fff' : '#aaa' }}
            onClick={() => setTab(t)}>{t}</div>
        ))}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ ...s.navItem, color: '#aaa' }} onClick={() => navigate('/')}>← Back to Shop</div>
          <div style={{ ...s.navItem, color: '#e74c3c' }} onClick={logout}>Logout</div>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={s.topbar}>
          <h2 style={s.pageTitle}>{tab}</h2>
          {msg && <span style={s.msg}>{msg}</span>}
        </div>

        {/* OVERVIEW */}
        {tab === 'Overview' && stats && (
          <div>
            <div style={s.statGrid}>
              {[
                { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: '#185FA5' },
                { label: 'Total Products', value: stats.totalProducts, icon: '🛍️', color: '#639922' },
                { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#854F0B' },
                { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toFixed(2)}`, icon: '💰', color: '#533AB7' },
              ].map(s2 => (
                <div key={s2.label} style={s.statCard}>
                  <div style={{ fontSize: '28px' }}>{s2.icon}</div>
                  <div style={{ ...s.statVal, color: s2.color }}>{s2.value}</div>
                  <div style={s.statLabel}>{s2.label}</div>
                </div>
              ))}
            </div>

            <h3 style={s.sectionTitle}>Recent Orders</h3>
            <table style={s.table}>
              <thead><tr style={s.th}>
                <th style={s.td}>Order ID</th><th style={s.td}>Customer</th>
                <th style={s.td}>Total</th><th style={s.td}>Status</th>
              </tr></thead>
              <tbody>
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id} style={s.tr}>
                    <td style={s.td}>#{o.id}</td>
                    <td style={s.td}>{o.user?.name}</td>
                    <td style={s.td}>₹{o.totalAmount?.toFixed(2)}</td>
                    <td style={s.td}><span style={{ ...s.badge, background: STATUS_COLOR[o.status] + '22', color: STATUS_COLOR[o.status] }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'Orders' && (
          <div>
            <table style={s.table}>
              <thead><tr style={s.th}>
                <th style={s.td}>ID</th><th style={s.td}>Customer</th>
                <th style={s.td}>Items</th><th style={s.td}>Total</th>
                <th style={s.td}>Date</th><th style={s.td}>Status</th>
              </tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={s.tr}>
                    <td style={s.td}>#{o.id}</td>
                    <td style={s.td}>{o.user?.name}<br /><span style={{ fontSize: '11px', color: '#888' }}>{o.user?.email}</span></td>
                    <td style={s.td}>{o.items?.length} items</td>
                    <td style={s.td}>₹{o.totalAmount?.toFixed(2)}</td>
                    <td style={s.td}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={s.td}>
                      <select style={s.select} value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value)}>
                        {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'Products' && (
          <div>
            <button style={s.addBtn} onClick={openAdd}>+ Add Product</button>
            <table style={s.table}>
              <thead><tr style={s.th}>
                <th style={s.td}>ID</th><th style={s.td}>Name</th><th style={s.td}>Category</th>
                <th style={s.td}>Price</th><th style={s.td}>Stock</th><th style={s.td}>Actions</th>
              </tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={s.tr}>
                    <td style={s.td}>{p.id}</td>
                    <td style={s.td}>{p.name}</td>
                    <td style={s.td}>{p.category}</td>
                    <td style={s.td}>₹{p.price}</td>
                    <td style={s.td}>{p.stock}</td>
                    <td style={s.td}>
                      <button style={s.editBtn} onClick={() => openEdit(p)}>Edit</button>
                      <button style={s.delBtn} onClick={() => deleteProduct(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* USERS */}
        {tab === 'Users' && (
          <table style={s.table}>
            <thead><tr style={s.th}>
              <th style={s.td}>ID</th><th style={s.td}>Name</th>
              <th style={s.td}>Email</th><th style={s.td}>Role</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>{u.id}</td>
                  <td style={s.td}>{u.name}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}><span style={{ ...s.badge, background: u.role === 'ADMIN' ? '#EEEDFE' : '#f0f0f0', color: u.role === 'ADMIN' ? '#533AB7' : '#555' }}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddProduct && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={{ margin: '0 0 1rem' }}>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
            {['name', 'description', 'price', 'stock', 'category', 'imageUrl'].map(field => (
              <input key={field} style={s.input}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={productForm[field]}
                onChange={e => setProductForm({ ...productForm, [field]: e.target.value })}
              />
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button style={s.addBtn} onClick={saveProduct}>{editProduct ? 'Update' : 'Add'}</button>
              <button style={s.delBtn} onClick={() => setShowAddProduct(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:       { display: 'flex', minHeight: '100vh', background: '#f5f5f5', fontFamily: 'inherit' },
  sidebar:    { width: '200px', background: '#1a1a1a', display: 'flex', flexDirection: 'column', padding: '1rem 0', flexShrink: 0 },
  brand:      { fontSize: '16px', fontWeight: 600, color: '#fff', padding: '0 1rem 1.5rem' },
  navItem:    { padding: '10px 1rem', cursor: 'pointer', fontSize: '14px', borderRadius: '6px', margin: '2px 8px' },
  main:       { flex: 1, padding: '1.5rem', overflow: 'auto' },
  topbar:     { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  pageTitle:  { fontSize: '20px', fontWeight: 600, margin: 0 },
  msg:        { fontSize: '13px', color: 'green' },
  statGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' },
  statCard:   { background: '#fff', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  statVal:    { fontSize: '26px', fontWeight: 600, margin: '6px 0 2px' },
  statLabel:  { fontSize: '12px', color: '#888' },
  sectionTitle:{ fontSize: '15px', fontWeight: 600, margin: '0 0 10px' },
  table:      { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th:         { background: '#f8f8f8', textAlign: 'left' },
  tr:         { borderTop: '0.5px solid #f0f0f0' },
  td:         { padding: '10px 14px', fontSize: '13px' },
  badge:      { fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: 500 },
  select:     { fontSize: '12px', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '6px' },
  addBtn:     { padding: '8px 16px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginBottom: '1rem' },
  editBtn:    { padding: '4px 10px', background: '#E6F1FB', color: '#185FA5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' },
  delBtn:     { padding: '4px 10px', background: '#FCEBEB', color: '#c0392b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:      { background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' },
  input:      { display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box' },
};