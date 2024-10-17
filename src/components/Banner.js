import React, { useEffect, useState } from 'react';
import Slider from "react-slick";
import A1 from "../assets/images/22 (1).webp";
import A2 from "../assets/images/00.webp";
import A3 from "../assets/images/mceclip1_41.webp";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { message } from 'antd';

const Banner = ({ scrollToRef }) => {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.username) {
        setUsername(storedUser.username);
      }
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
    }
  }, []);

  const handleAddToCart = () => {
    const product = {
      productId: 'product-id-123',
      name: 'Fashion Item',
      price: 500000,
      selectedSize: 'M',
      selectedColor: 'Red',
      quantity: 1,
      imageUrl: A1,
    };

    dispatch(addToCart(product));
    message.success('Sản phẩm đã được thêm vào giỏ hàng!');
  };

  const settings = React.useMemo(() => ({
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  }), []);

  return (
    <div className="relative max-w-1200 h-96 overflow-hidden">
      <Slider {...settings}>
        <div>
          <img src={A1} alt="Fashion Banner 1" className="w-full h-full object-cover" />
        </div>
        <div>
          <img src={A2} alt="Fashion Banner 2" className="w-full h-full object-cover" />
        </div>
        <div>
          <img src={A3} alt="Fashion Banner 3" className="w-full h-full object-cover" />
        </div>
      </Slider>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        <div className="relative z-10 text-center animate-fadeIn">
          <h1 className="text-5xl font-semibold text-white mb-4 animate-slideInDown">
            {username ? `Xin chào, ${username}!` : 'Khám Phá Bộ Sưu Tập Mới'}
          </h1>
          <p className="text-lg text-white mb-6 animate-slideInUp">
            {username ? 'Chào mừng bạn trở lại!' : 'Cập nhật những xu hướng mới nhất cho mùa này!'}
          </p>
          <button
            onClick={() => scrollToRef && typeof scrollToRef === 'function' && scrollToRef()}
            className="bg-yellow-500 text-black px-6 py-3 rounded-full text-lg font-semibold hover:bg-yellow-600 transition-transform transform hover:scale-105 duration-300"
          >
            Mua Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
