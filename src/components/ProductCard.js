import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, notification } from 'antd';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';

const ProductCard = React.memo(({ product, isBestSeller, isHot }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialSelectedColor = localStorage.getItem(`selectedColor-${product.id}`) || product.colors[0];
  const initialSelectedSize = localStorage.getItem(`selectedSize-${product.id}`) || product.sizes[0];

  const [selectedSize, setSelectedSize] = useState(initialSelectedSize);
  const [selectedColor, setSelectedColor] = useState(initialSelectedColor);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    localStorage.setItem(`selectedSize-${product.id}`, selectedSize);
    localStorage.setItem(`selectedColor-${product.id}`, selectedColor);
  }, [selectedSize, selectedColor, product.id]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor || !product.sizes.includes(selectedSize)) {
      notification.error({ message: 'Kích cỡ này hiện không có sẵn!' });
      return;
    }
    dispatch(addToCart({ ...product, selectedSize, selectedColor, quantity }));
    notification.success({ message: 'Sản phẩm đã được thêm vào giỏ hàng!' });
    navigate('/cart');
  };

  const increaseQuantity = () => {
    setQuantity(prevQuantity => Math.min(prevQuantity + 1, 100));
  };

  const decreaseQuantity = () => {
    setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));
  };

  const viewProductDetails = () => {
    navigate(`/product/${product.id}`);
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleSizeClick = (size) => {
    if (!product.sizes.includes(size)) {
      notification.warning({ message: 'Kích cỡ này hiện không có sẵn!' });
    } else {
      setSelectedSize(size);
    }
  };

  return (
    <div className='max-w-xs bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-4'>
      <Card
        hoverable
        cover={
          <div className="relative">
            <img
              alt={product.name}
              src={product.imagesByColor[selectedColor] || product.image}
              className="object-cover h-64 w-full rounded-lg"
            />
            {isBestSeller && (
              <Tag color="purple" className="absolute top-2 left-2 text-sm font-bold uppercase">
                Bán chạy
              </Tag>
            )}
            {isHot && (
              <Tag color="red" className="absolute top-2 left-2 text-sm font-bold uppercase">
                Hot
              </Tag>
            )}
          </div>
        }
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          <p className="text-xl font-bold text-red-500">{product.price.toLocaleString()} VND</p>

          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-600">Chọn kích cỡ:</p>
            <div className="flex justify-center mt-1 space-x-2">
              {['S', 'M', 'L'].map((size) => (
                <Button
                  key={size}
                  onClick={() => handleSizeClick(size)}
                  className={`py-1 px-3 border rounded-lg transition duration-300 
                    ${selectedSize === size ? 'bg-blue-500 text-white' : product.sizes.includes(size) ? 'bg-gray-200 text-black' : 'font-bold text-red-500 border-red-500 cursor-not-allowed'}`}
                  disabled={!product.sizes.includes(size)} // Disable button if size is not available
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-600">Chọn màu:</p>
            <div className="flex justify-center mt-2 space-x-2">
              {Object.keys(product.imagesByColor).map((color) => (
                <div
                  key={color}
                  onClick={() => handleColorClick(color)}
                  className={`w-6 h-6 rounded-full border-2 cursor-pointer 
                    ${selectedColor === color ? 'border-black' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-600">Chọn số lượng:</p>
            <div className="flex items-center justify-center space-x-2">
              <Button
                type="default"
                icon={<MinusOutlined />}
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              />
              <span className="text-lg">{quantity}</span>
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={increaseQuantity}
                disabled={quantity >= 100}
              />
            </div>
          </div>

          <Button
            size="large"
            type="primary"
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
            onClick={handleAddToCart}
            disabled={!product.sizes.includes(selectedSize)} // Disable the add-to-cart button if the selected size is not available
          >
            Mua hàng
          </Button>

          <Button
            size="large"
            type="default"
            className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg"
            onClick={viewProductDetails}
          >
            Xem chi tiết
          </Button>
        </div>
      </Card>
    </div>
  );
});

export default ProductCard;
