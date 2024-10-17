import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Banner from '../components/Banner'; 
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard'; 
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchOrders } from '../redux/slices/orderSlice';
import D1 from '../assets/images/1608888571-banner-thoi-trang-2.jpg';
import D2 from '../assets/images/banner-thoi-trang-bi-an.jpg';

const HomePage = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products) || [];
  const orders = useSelector((state) => state.order.orders) || [];
  const productStatus = useSelector((state) => state.product.status);
  const orderStatus = useSelector((state) => state.order.status);
  const featuredProductsRef = useRef(null);

  useEffect(() => {
    // Đưa người dùng lên đầu trang mỗi khi trang được tải hoặc thay đổi
    window.scrollTo(0, 0);
    
    if (productStatus === 'idle') {
      dispatch(fetchProducts());
    }
    if (orderStatus === 'idle') {
      dispatch(fetchOrders());
    }
  }, [dispatch, productStatus, orderStatus]);

  // Logging để kiểm tra dữ liệu
  useEffect(() => {
    console.log('Products:', products);
    console.log('Orders:', orders);
  }, [products, orders]);

  // Kiểm tra trạng thái tải dữ liệu
  if (productStatus === 'loading' || orderStatus === 'loading') {
    return (
      <>
        <div className="container mx-auto px-4">Đang tải dữ liệu...</div>
        <Footer />
      </>
    );
  }

  if (productStatus === 'failed' || orderStatus === 'failed') {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4">Đã xảy ra lỗi khi tải dữ liệu.</div>
        <Footer />
      </>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4">Không có sản phẩm để hiển thị.</div>
        <Footer />
      </>
    );
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4">Không có đơn hàng để hiển thị.</div>
        <Footer />
      </>
    );
  }

  const productSales = products.map(product => {
    const totalSales = orders.reduce((count, order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      const productItems = items.filter(item => item.productId === product.id);
      const productQuantity = productItems.reduce((sum, item) => sum + item.quantity, 0);
      return count + productQuantity;
    }, 0);
    return { ...product, totalSales };
  });

  const bestSellingProducts = productSales
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 8);

  const productRatings = products.map(product => {
    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    const fiveStarReviews = reviews.filter(review => review.rating === 5).length;
    return { ...product, fiveStarReviews };
  });

  const topRatedProducts = productRatings
    .sort((a, b) => b.fiveStarReviews - a.fiveStarReviews)
    .slice(0, 8);

  const scrollToFeaturedProducts = () => {
    if (featuredProductsRef.current) {
      featuredProductsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Banner scrollToRef={scrollToFeaturedProducts} />
      <div ref={featuredProductsRef} className="pt-8 max-w-1200 mx-auto">
  <h2 className="text-4xl text-center font-bold text-blue-600 mb-12">
    Sản phẩm bán chạy
  </h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4">
    {bestSellingProducts.map((product) => (
      <ProductCard 
        key={product.id} 
        product={product} 
        isBestSeller={true} 
        className="max-w-xs bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105"
      />
    ))}
  </div>
</div>


      <div className="my-12">
        <img 
          src={D1} 
          alt="Banner 1" 
          className="w-full h-72 object-cover rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl" 
        />
      </div>
      <div className="pt-12 pb-16 bg-gray-100">
  <h2 className="text-4xl text-center font-bold text-red-600 my-8">Sản phẩm Hot</h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4">
    {topRatedProducts.map((product) => (
      <ProductCard 
        key={product.id} 
        product={product} 
        isHot={true} 
        className="max-w-xs bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105"
      />
    ))}
  </div>
</div>


      <div className="my-12">
        <img 
          src={D2} 
          alt="Banner 2" 
          className="w-full h-72 object-cover rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl" 
        />
      </div>
    </>
  );
};

export default HomePage;
