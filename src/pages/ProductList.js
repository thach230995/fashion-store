import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = axios.get('/categories');
    const fetchProducts = axios.get('/products');

    axios.all([fetchCategories, fetchProducts])
      .then(axios.spread((categoriesRes, productsRes) => {
        setCategories(categoriesRes.data);
        setProducts(productsRes.data)
        const filteredHotProducts = productsRes.data.filter(product => 
          product.viewsCount > 300 || product.favoritesCount > 50 || product.isHot === true
        ).slice(0, 8);
        setHotProducts(filteredHotProducts);
        const filteredBestSellers = productsRes.data.filter(product => 
          product.salesCount > 100 || product.ratings > 4.5 || product.isBestSeller === true
        ).slice(0, 8);
        setBestSellers(filteredBestSellers);

        setLoading(false);
      }))
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Đã xảy ra lỗi khi tải dữ liệu.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="container max-w-screen-xl mx-auto px-4">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="container max-w-screen-xl mx-auto px-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4">
      {/* Hiển thị sản phẩm Hot */}
      <h2 className="text-2xl font-bold mb-4">Sản phẩm Hot</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {hotProducts.length > 0 ? (
          hotProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p>Không có sản phẩm Hot nào.</p>
        )}
      </div>

      {/* Hiển thị sản phẩm Bán Chạy */}
      <h2 className="text-2xl font-bold mt-8 mb-4">Sản phẩm Bán Chạy</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {bestSellers.length > 0 ? (
          bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p>Không có sản phẩm Bán Chạy nào.</p>
        )}
      </div>
      {categories.map(category => {
        const categoryProducts = products.filter(product => product.categoryId === category.id);
        if (categoryProducts.length === 0) return null;
        return (
          <div key={category.id} className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {categoryProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
