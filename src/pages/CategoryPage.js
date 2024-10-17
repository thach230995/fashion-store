import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Checkbox, Button, Slider, message, Select, Rate } from 'antd';
import { CheckOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

const CategoryPage = () => {
  const { categoryName } = useParams(); 
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [sortOption, setSortOption] = useState('default');
  const [visibleProducts, setVisibleProducts] = useState(6);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/products?categoryName=${categoryName}`);
        const fetchedProducts = response.data;

        const filteredByCategory = fetchedProducts.filter(product => product.categoryName === categoryName);

        setProducts(filteredByCategory);
        setFilteredProducts(filteredByCategory.slice(0, visibleProducts));

        const sizesSet = new Set();
        const colorsSet = new Set();

        filteredByCategory.forEach(product => {
          product.sizes.forEach(size => sizesSet.add(size));
          product.colors.forEach(color => colorsSet.add(color));
        });

        setAvailableSizes([...sizesSet]);
        setAvailableColors([...colorsSet]);

        const initialSelectedOptions = {};
        filteredByCategory.forEach(product => {
          initialSelectedOptions[product.id] = {
            selectedColor: product.colors[0] || null,
            selectedSize: product.sizes[0] || null,
            imageUrl: product.imagesByColor[product.colors[0]] || product.defaultImage || 'fallbackImageUrl.jpg',
            quantity: 1,
          };
        });

        setSelectedOptions(initialSelectedOptions);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
      }
    };

    fetchProducts();
  }, [categoryName, visibleProducts]);

  useEffect(() => {
    let updatedProducts = [...products];

    if (Array.isArray(selectedColors) && selectedColors.length > 0) {
      updatedProducts = updatedProducts.filter(product =>
        selectedColors.some(color => product.colors.includes(color))
      );
    }

    if (Array.isArray(selectedSizes) && selectedSizes.length > 0) {
      updatedProducts = updatedProducts.filter(product =>
        selectedSizes.some(size => product.sizes.includes(size))
      );
    }

    updatedProducts = updatedProducts.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (ratingFilter > 0) {
      updatedProducts = updatedProducts.filter(product => product.rating >= ratingFilter);
    }

    switch (sortOption) {
      case 'priceHighLow':
        updatedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'priceLowHigh':
        updatedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'nameAZ':
        updatedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProducts(updatedProducts.slice(0, visibleProducts));
  }, [selectedColors, selectedSizes, priceRange, ratingFilter, sortOption, products, visibleProducts]);

  const handleColorFilterChange = color => {
    setSelectedColors(prevSelectedColors =>
      prevSelectedColors.includes(color)
        ? prevSelectedColors.filter(c => c !== color)
        : [...prevSelectedColors, color]
    );
  };

  const handleSizeFilterChange = checkedValues => {
    setSelectedSizes(checkedValues);
  };

  const handlePriceChange = value => {
    setPriceRange(value);
  };

  const handleRatingChange = value => {
    setRatingFilter(value);
  };

  const handleOptionChange = (productId, field, value) => {
    const updatedOptions = {
      ...selectedOptions,
      [productId]: {
        ...selectedOptions[productId],
        [field]: value,
      },
    };

    if (field === 'selectedColor') {
      updatedOptions[productId].imageUrl = products.find(p => p.id === productId).imagesByColor[value] || products.find(p => p.id === productId).defaultImage || 'fallbackImageUrl.jpg';
    }

    setSelectedOptions(updatedOptions);
  };

  const handleAddToCart = productId => {
    const product = products.find(p => p.id === productId);
    const selectedProductOptions = selectedOptions[productId];

    if (!selectedProductOptions) {
      alert('Vui lòng chọn màu sắc và kích cỡ trước khi mua hàng.');
      return;
    }

    const { selectedColor, selectedSize, quantity } = selectedProductOptions;

    if (!product.sizes.includes(selectedSize)) {
      message.error('Kích cỡ này hiện không có sẵn. Vui lòng chọn kích cỡ khác.');
      return;
    }

    dispatch(addToCart({ ...product, selectedColor, selectedSize, quantity }));
    message.success(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  const handleBuyNow = productId => {
    const product = products.find(p => p.id === productId);
    const selectedProductOptions = selectedOptions[productId];

    if (!selectedProductOptions) {
      alert('Vui lòng chọn màu sắc và kích cỡ trước khi mua hàng.');
      return;
    }

    const { selectedColor, selectedSize, quantity } = selectedProductOptions;

    if (!product.sizes.includes(selectedSize)) {
      message.error('Kích cỡ này hiện không có sẵn. Vui lòng chọn kích cỡ khác.');
      return;
    }

    dispatch(addToCart({ ...product, selectedColor, selectedSize, quantity }));
    navigate('/cart');
  };

  const handleResetFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 1000000]);
    setRatingFilter(0);
  };

  const handleViewDetails = productId => {
    navigate(`/product/${productId}`);
  };

  const handleSortChange = value => {
    setSortOption(value);
  };

  const toggleShowAllProducts = () => {
    if (showAllProducts) {
      setVisibleProducts(6);
    } else {
      setVisibleProducts(products.length);
    }
    setShowAllProducts(prevState => !prevState);
  };

  return (
    <div className="container mx-auto p-4 flex">
      <div className="w-1/4 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Lọc sản phẩm</h2>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Màu sắc</h3>
          <div className="flex space-x-2">
            {availableColors.map(color => (
              <div
                key={color}
                className={`w-8 h-8 rounded-full border-2 relative cursor-pointer transition-all duration-200 ${
                  selectedColors.includes(color) ? 'border-black' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorFilterChange(color)}
              >
                {selectedColors.includes(color) && (
                  <CheckOutlined
                    className="text-white absolute inset-0 flex items-center justify-center"
                    style={{ fontSize: '16px' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Kích cỡ</h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes
              .filter(size => size)
              .map(size => (
                <div
                  key={size}
                  className={`px-4 py-2 border rounded cursor-pointer text-center ${
                    selectedSizes.includes(size)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  } transition-all duration-200 hover:bg-blue-200`}
                  onClick={() =>
                    handleSizeFilterChange(
                      selectedSizes.includes(size)
                        ? selectedSizes.filter(s => s !== size)
                        : [...selectedSizes, size]
                    )
                  }
                >
                  {size}
                </div>
              ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Khoảng giá</h3>
          <Slider
            range
            defaultValue={priceRange}
            min={0}
            max={1000000}
            step={50000}
            onChange={handlePriceChange}
            value={priceRange}
            tipFormatter={value => `${value.toLocaleString()} VND`}
            className="slider-primary"
          />
          <div className="flex justify-between mt-2">
            <span className="font-semibold text-lg">{priceRange[0].toLocaleString()} VND</span>
            <span className="font-semibold text-lg">{priceRange[1].toLocaleString()} VND</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Đánh giá</h3>
          <Rate
            allowHalf
            onChange={handleRatingChange}
            value={ratingFilter}
            className="custom-rate text-yellow-400 text-4xl hover:text-yellow-500 transform hover:scale-125 transition-all duration-200"
          />
        </div>

        <Button type="default" onClick={handleResetFilters}>
          Xóa bộ lọc
        </Button>
      </div>

      <div className="w-3/4 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Danh mục: {categoryName}</h2>
          <Select defaultValue="default" style={{ width: 200 }} onChange={handleSortChange}>
            <Select.Option value="default">Sắp xếp</Select.Option>
            <Select.Option value="nameAZ">Tên từ A-Z</Select.Option>
            <Select.Option value="priceLowHigh">Giá thấp đến cao</Select.Option>
            <Select.Option value="priceHighLow">Giá cao đến thấp</Select.Option>
          </Select>
        </div>

        {filteredProducts.length === 0 ? (
          <p>Không có sản phẩm nào phù hợp với bộ lọc.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const selectedProductOptions = selectedOptions[product.id] || {
                selectedColor: product.colors[0],
                selectedSize: product.sizes[0],
                quantity: 1,
                imageUrl: product.imagesByColor[product.colors[0]] || product.defaultImage || 'fallbackImageUrl.jpg',
              };

              const { selectedColor, selectedSize, quantity, imageUrl } = selectedProductOptions;

              // Kiểm tra danh mục Giày Nam để hiển thị kích cỡ theo số
              const sizeOptions = product.categoryName === 'Giày Nam' ? ['40', '41', '42'] : ['S', 'M', 'L'];

              return (
                <div
                  key={product.id}
                  className="border p-4 rounded-lg shadow-lg flex flex-col transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-yellow-100 hover:shadow-xl"
                >
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-64 object-cover mb-4 cursor-pointer rounded-lg hover:opacity-90 transition-opacity duration-300"
                    onClick={() => handleViewDetails(product.id)}
                  />
                  <h3 className="text-xl font-bold mb-2 text-gray-800 hover:text-yellow-500 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-xl text-red-500 font-bold mb-4">
                    {product.price.toLocaleString()} VND
                  </p>

                  <div className="mb-3">
                    <label className="block font-medium mb-1 text-gray-600">Chọn Màu sắc:</label>
                    <div className="flex space-x-2">
                      {product.colors.map(color => (
                        <div
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-300 ${
                            selectedColor === color ? 'border-black scale-110' : 'border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleOptionChange(product.id, 'selectedColor', color)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block font-medium mb-1 text-gray-600">Kích cỡ:</label>
                    <div className="flex space-x-2">
                      {sizeOptions.map(size => (
                        <div
                          key={size}
                          className={`px-3 py-1 border-2 rounded-lg text-gray-800 cursor-pointer transition-all duration-300 ${
                            selectedSize === size ? 'border-black ' : product.sizes.includes(size) ? 'border-gray-300 hover:bg-yellow-100' : 'bg-red-200 cursor-not-allowed'
                          }`}
                          onClick={() => {
                            if (!product.sizes.includes(size)) {
                              message.error(`Kích cỡ ${size} hiện không có sẵn. Vui lòng chọn kích cỡ khác.`);
                            } else {
                              handleOptionChange(product.id, 'selectedSize', size);
                            }
                          }}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <label className="block font-medium mb-1 text-gray-600">Số lượng:</label>
                    <div className="flex items-center ml-2">
                      <Button
                        icon={<MinusOutlined />}
                        size="small"
                        className=" border-none rounded-md hover:bg-yellow-300"
                        onClick={() => handleOptionChange(product.id, 'quantity', Math.max(1, quantity - 1))}
                      />
                      <span className="mx-3 text-lg text-gray-700">{quantity}</span>
                      <Button
                        icon={<PlusOutlined />}
                        size="small"
                        className=" border-none rounded-md hover:bg-yellow-300"
                        onClick={() => handleOptionChange(product.id, 'quantity', quantity + 1)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      type="primary"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      Thêm vào giỏ hàng
                    </Button>
                    <Button
                      type="default"
                      className="w-full ml-3 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                      onClick={() => handleBuyNow(product.id)}
                    >
                      Mua ngay
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-6">
          <Button type="primary" onClick={toggleShowAllProducts}>
            {showAllProducts ? 'Thu gọn' : 'Xem thêm'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
