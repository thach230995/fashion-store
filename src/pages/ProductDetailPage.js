import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { Form, Input, Button, Rate, List, message, Select, InputNumber, Modal } from 'antd';
import ProductCard from '../components/ProductCard';
import { addToCart } from '../redux/slices/cartSlice';

const { Option } = Select;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [popularProducts, setPopularProducts] = useState([]);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [reviews, setReviews] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(''); 
  const [quantity, setQuantity] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); 

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const productResponse = await axios.get(`http://localhost:5000/products/${id}`);
        setProduct(productResponse.data);
        setSelectedSize(productResponse.data.sizes ? productResponse.data.sizes[0] : '');
        setSelectedColor(productResponse.data.colors ? productResponse.data.colors[0] : '');

        const reviewsResponse = await axios.get(`http://localhost:5000/reviews?productId=${id}`);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu sản phẩm hoặc đánh giá:', error);
      }
    };

    const fetchPopularProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/products?isPopular=true');
        setPopularProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu sản phẩm nổi bật:', error);
      }
    };

    fetchProductAndReviews();
    fetchPopularProducts();
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!isLoggedIn) {
      message.warning('Bạn cần đăng nhập để đánh giá sản phẩm.');
      return;
    }

    if (review.rating === 0 || review.comment.trim() === '') {
      message.warning('Vui lòng chọn đánh giá sao và nhập bình luận.');
      return;
    }

    try {
      const newReview = { 
        ...review, 
        username: user.username, 
        productId: id 
      }; 

      await axios.post(`http://localhost:5000/reviews`, newReview);
      setReviews(prevReviews => [...prevReviews, newReview]);
      setReview({ rating: 0, comment: '' });
      message.success('Cảm ơn bạn đã đánh giá!');
    } catch (error) {
      message.error('Đã xảy ra lỗi khi gửi đánh giá.');
      console.error('Chi tiết lỗi:', error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      message.warning('Vui lòng chọn kích cỡ sản phẩm.');
      return;
    }

    if (!product.sizes.includes(selectedSize)) {
      message.error('Kích cỡ này hiện không có sẵn.');
      return;
    }

    const cartItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity,
    };

    dispatch(addToCart(cartItem));
    message.success('Sản phẩm đã được thêm vào giỏ hàng!');
  };

  const handleCheckout = async () => {
    if (quantity <= 0 || !selectedSize) {
      message.warning('Vui lòng chọn số lượng và kích cỡ sản phẩm.');
      return;
    }

    handleAddToCart();

    const order = {
      productId: product.id,
      quantity,
      size: selectedSize,
      color: selectedColor,
      total: product.price * quantity,
      status: 'pending',
    };

    try {
      const response = await axios.post('http://localhost:5000/orders', order);
      if (response.status === 201) {
        navigate('/cart');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra trong quá trình thanh toán.');
      console.error('Chi tiết lỗi:', error);
    }
  };

  if (!product) return <div>Đang tải...</div>;

  return (
    <div className="max-w-1200 container mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center">
          <img src={product.image} alt={product.name} className="rounded-lg shadow-lg max-w-full h-auto" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl text-red-500 font-semibold mb-6">{product.price.toLocaleString()} VND</p>
          <p className="mb-6 text-gray-700">{product.description}</p>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-2">Chọn màu sắc</label>
            <Select 
              value={selectedColor} 
              onChange={setSelectedColor} 
              className="w-full mb-4"
              placeholder="Chọn màu sắc"
              size="large"
            >
              {product.colors && product.colors.map(color => (
                <Option key={color} value={color}>{color}</Option>
              ))}
            </Select>

            <label className="block font-medium text-gray-700 mb-2">Chọn kích cỡ</label>
            <Select 
              value={selectedSize} 
              onChange={setSelectedSize} 
              className="w-full mb-4"
              placeholder="Chọn kích cỡ"
              size="large"
            >
              {product.sizes && product.sizes.map(size => (
                <Option key={size} value={size}>{size}</Option>
              ))}
            </Select>

            <Button 
              type="link" 
              onClick={() => setIsModalVisible(true)} 
              className="underline text-blue-600 mb-4"
            >
              Xem bảng kích thước
            </Button>

            <label className="block font-medium text-gray-700 mb-2">Số lượng</label>
            <InputNumber 
              min={1} 
              value={quantity} 
              onChange={setQuantity} 
              className="w-full mb-4" 
              size="large"
            />
            <Button
              type="primary"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 mb-4"
              onClick={handleAddToCart}
              size="large"
            >
              Thêm vào giỏ hàng
            </Button>
            <Button
              type="primary"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
              onClick={handleCheckout}
              size="large"
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Đánh giá</h2>
        <List
          itemLayout="horizontal"
          dataSource={reviews}
          renderItem={item => (
            <List.Item className="border-b border-gray-200 pb-4 mb-4">
              <List.Item.Meta
                title={<span className="text-lg font-semibold">{item.username}</span>}
                description={(
                  <>
                    <Rate disabled value={item.rating} className="text-yellow-400 mb-2" />
                    <p className="text-gray-700">{item.comment}</p>
                  </>
                )}
              />
            </List.Item>
          )}
        />
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Gửi đánh giá của bạn</h2>
        {isLoggedIn ? (
          <Form layout="vertical" onFinish={handleReviewSubmit}>
            <Form.Item label="Đánh giá" className="mb-4">
              <Rate
                value={review.rating}
                onChange={value => setReview(prev => ({ ...prev, rating: value }))}
                className="text-yellow-400"
              />
            </Form.Item>
            <Form.Item label="Bình luận" className="mb-4">
              <Input.TextArea
                value={review.comment}
                onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                placeholder="Nhập bình luận của bạn"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700 transition duration-300">Gửi đánh giá</Button>
            </Form.Item>
          </Form>
        ) : (
          <p className="text-red-500">Bạn cần <a href="/login" className="underline">đăng nhập</a> để gửi đánh giá.</p>
        )}
      </div>

      <div className="mt-12 max-w-1200 mx-auto">
        <h2 className="text-4xl font-bold text-center text-yellow-500 mb-12">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4">
          {popularProducts.map((p) => (
            <ProductCard 
              key={p.id} 
              product={p} 
              className="bg-white p-4 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            />
          ))}
        </div>
      </div>

      {/* Modal để hiển thị bảng kích thước */}
      <Modal
        title="Bảng kích thước"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <img src={product.sizeChartImage} alt="Size Chart" className="w-full" />
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
