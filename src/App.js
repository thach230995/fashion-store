import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import UserProfile from './pages/UserProfile';
import LoginPage from './pages/LoginPage';
import OrderDetailPage from './pages/OrderDetailPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CheckoutPage from './pages/CheckoutPage';
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/order/:orderId" element={<OrderDetailPage />} />
       
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
