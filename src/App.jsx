import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import MobileBottomBar from './components/MobileBottomBar';

// Customer Store Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import UserProfile from './pages/UserProfile';
import MyOrders from './pages/MyOrders';
import NotFound from './pages/NotFound';

// Admin Portal Pages (Ice Creams, Flavors, Customers)
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import ManageIceCreams from './admin/ManageIceCreams';
import ManageFlavors from './admin/ManageFlavors';
import ManageCustomers from './admin/ManageCustomers';
import AdminSettings from './admin/AdminSettings';

// Styles
import './styles/global.css';

// Customer Layout Wrapper
const StorefrontLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <Navbar />
      <main className="storefront-main">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <Routes>
              {/* Customer Facing Storefront */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Dedicated Admin Authentication Route */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Portal (Ice Creams, Flavors & Customer Management) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="icecreams" element={<ManageIceCreams />} />
                <Route path="flavors" element={<ManageFlavors />} />
                <Route path="customers" element={<ManageCustomers />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="products" element={<ManageIceCreams />} />
                <Route path="categories" element={<ManageFlavors />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
