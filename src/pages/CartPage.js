import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, List, message, Input, Form, Radio, Typography, Divider, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateCartQuantity, clearCart, restoreCartFromLocalStorage } from '../redux/slices/cartSlice';
import { createOrder } from '../redux/slices/orderSlice';
import { CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;
const { Option } = Select;

const CartPage = () => {
  const { items = [], totalAmount = 0, totalItems = 0 } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Thông tin khách hàng
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    paymentMethod: 'COD',
    cardInfo: {
      name: '',
      number: '',
      expiry: '',
      cvv: ''
    },
    note: ''
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [manualInput, setManualInput] = useState(false); 
  useEffect(() => {
    axios.get('https://provinces.open-api.vn/api/p/')
      .then(response => setProvinces(response.data))
      .catch(error => {
        console.error('Error fetching provinces:', error);
        setManualInput(true); 
      });
  }, []);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      axios.get(`http://localhost:5000/users/${user.id}`)
        .then(response => {
          const userData = response.data;
          setCustomerInfo(prevInfo => ({
            ...prevInfo,
            name: userData.username || prevInfo.name,
            email: userData.email || prevInfo.email,
            phone: userData.phone || prevInfo.phone,
            address: userData.addressDetail || prevInfo.address,
            city: userData.province || prevInfo.city,
            district: userData.district || prevInfo.district,
            postalCode: userData.postalCode || prevInfo.postalCode
          }));
        })
        .catch(error => console.error('Error fetching customer info:', error));
    } else {
      console.error('No user found in localStorage');
    }
  }, []);
  useEffect(() => {
    dispatch(restoreCartFromLocalStorage());
  }, [dispatch]);
  const handleProvinceChange = (value) => {
    setCustomerInfo({ ...customerInfo, city: value, district: '' });
    axios.get(`https://provinces.open-api.vn/api/p/${value}?depth=2`)
      .then(response => setDistricts(response.data.districts))
      .catch(error => {
        console.error('Error fetching districts:', error);
        setManualInput(true); 
      });
  };

  const handleRemoveFromCart = (productId, selectedSize, selectedColor) => {
    dispatch(removeFromCart({ productId, selectedSize, selectedColor }));
  };

  const handleIncreaseQuantity = (productId, selectedSize, selectedColor) => {
    const item = items.find(item => item.productId === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor);
    if (item) {
      dispatch(updateCartQuantity({ productId, selectedSize, selectedColor, quantity: item.quantity + 1 }));
    }
  };

  const handleDecreaseQuantity = (productId, selectedSize, selectedColor) => {
    const item = items.find(item => item.productId === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor);
    if (item && item.quantity > 1) {
      dispatch(updateCartQuantity({ productId, selectedSize, selectedColor, quantity: item.quantity - 1 }));
    }
  };

  const calculateTotalAmount = () => {
    if (items.length === 0) {
      return 0;  Nếu 
    }
    return totalAmount;
  };

  const validateCustomerInfo = () => {
    const { name, email, phone, address, city, district, paymentMethod, cardInfo } = customerInfo;
    if (!name || !email || !phone || !address || !city || !district) {
      message.error('Vui lòng nhập đầy đủ thông tin cá nhân.');
      return false;
    }
    if (paymentMethod === 'Online') {
      if (!cardInfo.name || !cardInfo.number || !cardInfo.expiry || !cardInfo.cvv) {
        message.error('Vui lòng nhập đầy đủ thông tin thẻ tín dụng.');
        return false;
      }
    }
    return true;
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      message.warning('Giỏ hàng của bạn đang trống.');
      return;
    }

    if (!validateCustomerInfo()) {
      return;
    }

    setLoading(true);

    const orderData = {
      userId: JSON.parse(localStorage.getItem('user')).id,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        imageUrl: item.imagesByColor[item.selectedColor],
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      })),
      total: calculateTotalAmount(),
      date: new Date().toISOString(),
      status: 'Pending',
      customerInfo
    };

    try {
      const response = await axios.post('http://localhost:5000/orders', orderData);
      dispatch(createOrder(response.data)); 
      setLoading(false);
      setOrderSuccess(true);
      message.success({
        content: (
          <>
            Đơn hàng đã được đặt thành công! <CheckCircleOutlined />
          </>
        ),
        duration: 3,
      });
      dispatch(clearCart()); 
      navigate('/'); 
    } catch (error) {
      setLoading(false);
      message.error('Đã xảy ra lỗi khi đặt hàng, vui lòng thử lại.');
      console.error('Error saving order:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen w-full">
      <Title level={2} className="text-center text-gray-900 mb-8">Giỏ hàng của bạn</Title>
      <div className="flex flex-col lg:flex-row gap-8 w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-300">
        <div className="lg:w-1/2 p-6 w-full">
          <Form layout="vertical">
            <Form.Item label="Họ và tên" required>
              <Input
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </Form.Item>
            <Form.Item label="Email" required>
              <Input
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </Form.Item>
            <Form.Item label="Số điện thoại" required>
              <Input
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </Form.Item>
            <Form.Item label="Địa chỉ" required>
              <Input
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </Form.Item>
            <Form.Item label="Thành phố/Tỉnh" required>
              {manualInput ? (
                <Input
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                  className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                />
              ) : (
                <Select
                  value={customerInfo.city}
                  onChange={handleProvinceChange}
                  className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                >
                  {provinces.map((province) => (
                    <Option key={province.code} value={province.code}>
                      {province.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="Quận/Huyện" required>
              {manualInput ? (
                <Input
                  value={customerInfo.district}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, district: e.target.value })}
                  className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                />
              ) : (
                <Select
                  value={customerInfo.district}
                  onChange={(value) => setCustomerInfo({ ...customerInfo, district: value })}
                  className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                  disabled={!districts.length}
                >
                  {districts.map((district) => (
                    <Option key={district.code} value={district.name}>
                      {district.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="Mã bưu điện (optional)">
              <Input
                value={customerInfo.postalCode}
                onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </Form.Item>
            <Form.Item label="Ghi chú đơn hàng (optional)">
              <Input.TextArea
                value={customerInfo.note}
                onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
              />
            </Form.Item>
            <Form.Item label="Phương thức thanh toán" required>
              <Radio.Group
                value={customerInfo.paymentMethod}
                onChange={(e) => setCustomerInfo({ ...customerInfo, paymentMethod: e.target.value })}
                className="flex flex-col gap-2"
              >
                <Radio value="COD" className="text-gray-800">
                  Thanh toán khi nhận hàng
                </Radio>
                <Radio value="Online" className="text-gray-800">
                  Thanh toán trực tuyến
                </Radio>
              </Radio.Group>
            </Form.Item>
            {customerInfo.paymentMethod === 'Online' && (
              <>
                <Divider className="my-4" />
                <Form.Item label="Tên trên thẻ" required>
                  <Input
                    value={customerInfo.cardInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, cardInfo: { ...customerInfo.cardInfo, name: e.target.value } })}
                    className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                  />
                </Form.Item>
                <Form.Item label="Số thẻ" required>
                  <Input
                    value={customerInfo.cardInfo.number}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, cardInfo: { ...customerInfo.cardInfo, number: e.target.value } })}
                    className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                  />
                </Form.Item>
                <Form.Item label="Ngày hết hạn" required>
                  <Input
                    value={customerInfo.cardInfo.expiry}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, cardInfo: { ...customerInfo.cardInfo, expiry: e.target.value } })}
                    className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                  />
                </Form.Item>
                <Form.Item label="CVV" required>
                  <Input
                    value={customerInfo.cardInfo.cvv}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, cardInfo: { ...customerInfo.cardInfo, cvv: e.target.value } })}
                    className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                  />
                </Form.Item>
              </>
            )}
          </Form>
        </div>

        <div className="lg:w-1/2 p-6 border-l border-gray-300 w-full">
          <Title level={3} className="text-gray-900 mb-8">Giỏ hàng</Title>
          <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    onClick={() => handleRemoveFromCart(item.productId, item.selectedSize, item.selectedColor)}
                  >
                    Xóa
                  </Button>,
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleDecreaseQuantity(item.productId, item.selectedSize, item.selectedColor)}
                      className="px-2"
                    >
                      -
                    </Button>,
                    <Text>{item.quantity}</Text>
                    <Button
                      onClick={() => handleIncreaseQuantity(item.productId, item.selectedSize, item.selectedColor)}
                      className="px-2"
                    >
                      +
                    </Button>
                  </div>
                ]}
                className="border border-gray-300 rounded-lg p-2 mb-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
              >
                <List.Item.Meta
                  title={<Text className="text-lg font-semibold text-gray-900">{item.name}</Text>}
                  description={
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Text>Màu sắc: {item.selectedColor}</Text><br />
                        <Text>Kích cỡ: {item.selectedSize}</Text><br />
                      </div>
                      <span className="font-semibold text-gray-700">{(item.price * item.quantity).toLocaleString()} VND</span>
                    </div>
                  }
                />
                <img
                  src={item.imagesByColor[item.selectedColor]} 
                  alt={item.name}
                  className="w-36 h-36 object-contain rounded-lg overflow-hidden"
                />
              </List.Item>
            )}
          />
          <div className="mt-4 border-t border-gray-300 pt-4">
            <Text className="text-lg font-semibold">Tổng cộng:</Text>
            <Text className="text-2xl font-bold block mt-2 text-blue-600">{calculateTotalAmount().toLocaleString()} VND</Text>
            <Text className="text-lg font-semibold mt-2">Tổng số sản phẩm: {totalItems}</Text>
          </div>
          <Button
            type="primary"
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-lg"
            onClick={handleCheckout}
            loading={loading}
          >
            Đặt hàng
          </Button>
        </div>
      </div>

      {orderSuccess && (
        <div className="mt-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-300">
          <Title level={3} className="text-center text-gray-900 mb-4">Thông tin đơn hàng</Title>
          <div>
            <Text strong>Khách hàng: </Text><Text>{customerInfo.name}</Text><br />
            <Text strong>Email: </Text><Text>{customerInfo.email}</Text><br />
            <Text strong>Số điện thoại: </Text><Text>{customerInfo.phone}</Text><br />
            <Text strong>Địa chỉ: </Text><Text>{customerInfo.address}, {customerInfo.district}, {customerInfo.city}</Text><br />
            <Text strong>Ghi chú: </Text><Text>{customerInfo.note || 'Không có ghi chú'}</Text><br />
          </div>
          <Divider />
          <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item) => (
              <List.Item className="border border-gray-300 rounded-lg p-2 mb-4 shadow-sm">
                <List.Item.Meta
                  title={<Text className="text-lg font-semibold text-gray-900">{item.name}</Text>}
                  description={
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Text>Màu sắc: {item.selectedColor}</Text><br />
                        <Text>Kích cỡ: {item.selectedSize}</Text><br />
                      </div>
                      <span className="font-semibold text-gray-700">{(item.price * item.quantity).toLocaleString()} VND</span>
                    </div>
                  }
                />
                <img
                  src={item.imagesByColor[item.selectedColor]} // Hiển thị hình ảnh theo màu sắc đã chọn
                  alt={item.name}
                  className="w-36 h-36 object-contain rounded-lg"
                />
              </List.Item>
            )}
          />
          <div className="mt-4 border-t border-gray-300 pt-4">
            <Text className="text-lg font-semibold">Tổng cộng:</Text>
            <Text className="text-2xl font-bold block mt-2 text-blue-600">{calculateTotalAmount().toLocaleString()} VND</Text>
            <Text className="text-lg font-semibold mt-2">Tổng số sản phẩm: {totalItems}</Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
