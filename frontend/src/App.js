import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import RestaurantOrders from './pages/RestaurantOrders';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCart([]);
  };

  const addToCart = (item, restaurantId) => {
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      if (window.confirm("Adding items from a different restaurant will clear your current cart. Continue?")) {
        setCart([{ ...item, quantity: 1, restaurantId }]);
      }
    } else {
      const existingItem = cart.find(i => i._id === item._id);
      if (existingItem) {
        setCart(cart.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        setCart([...cart, { ...item, quantity: 1, restaurantId }]);
      }
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i._id !== itemId));
  };

  const clearCart = () => setCart([]);

  return (
    <Router>
      <div className="App">
        {user && (
          <nav className="navbar">
            <Link to="/" className="nav-logo">CAMPUS CAFETERIA</Link>
            <div className="nav-links">
              {user.role === 'user' && (
                <>
                  <Link to="/">Cafeterias</Link>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/cart">Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})</Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/">Cafeterias</Link>
                  <Link to="/dashboard">Admin Dashboard</Link>
                </>
              )}
              {user.role === 'restaurant' && (
                <>
                  <Link to="/restaurant-orders">Manage Orders</Link>
                </>
              )}
              <button onClick={handleLogout} className="button button-outline" style={{ color: 'white', borderColor: 'white', marginLeft: '2rem', padding: '0.4rem 1rem' }}>LOGOUT</button>
            </div>
            <span className="user-info">{user.name} ({user.role.toUpperCase()})</span>
          </nav>
        )}

        <main className="container">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            
            {/* Protected Routes */}
            <Route path="/" element={user ? (user.role === 'restaurant' ? <Navigate to="/restaurant-orders" /> : <Home />) : <Navigate to="/login" />} />
            <Route path="/restaurant/:id" element={user ? <Menu addToCart={addToCart} /> : <Navigate to="/login" />} />
            <Route path="/cart" element={user && user.role === 'user' ? <Cart cart={cart} user={user} removeFromCart={removeFromCart} clearCart={clearCart} /> : <Navigate to="/login" />} />
            <Route path="/orders" element={user && user.role === 'user' ? <OrderHistory user={user} /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={user && user.role === 'admin' ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/restaurant-orders" element={user && user.role === 'restaurant' ? <RestaurantOrders user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
