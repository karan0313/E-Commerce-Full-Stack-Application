import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/AdminDashboard';
import Payment from './pages/Payment';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/"                element={<PrivateRoute><ProductList /></PrivateRoute>} />
        <Route path="/products/:id"    element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
        <Route path="/cart"            element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/checkout"        element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/payment/:orderId" element={<PrivateRoute><Payment /></PrivateRoute>} />
        <Route path="/orders"          element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
        <Route path="/orders/:id"      element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
        <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;