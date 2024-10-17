import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../redux/slices/orderSlice';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser'; 

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const navigate = useNavigate();

  const handleFinish = (values) => {
    const orderId = Math.floor(Math.random() * 100000);
    dispatch(createOrder({
      id: orderId,
      items: cart,
      total,
      status: 0,
      customerInfo: values,
    }));
    emailjs.send('', '', {
      order_id: orderId,
      customer_name: values.name,
      customer_email: values.email,
      order_total: total,
    }, 'service_7zyez08')
    .then(() => {
      message.success('Đơn hàng của bạn đã được đặt thành công và email đã được gửi!');
    })
    .catch((error) => {
      console.error('Lỗi gửi email:', error);
      message.error('Đặt hàng thành công nhưng không thể gửi email!');
    });

    navigate(`/order/${orderId}`);  
  };

  return (
    <div className="container mx-auto max-w-1200 p-4 bg-gradient-to-r from-green-50 to-gray-50 min-h-screen">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-800">Thông tin khách hàng</h2>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              size="large" 
              htmlType="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-colors duration-300"
            >
              Đặt hàng
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CheckoutPage;
