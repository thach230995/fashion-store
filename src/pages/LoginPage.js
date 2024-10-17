import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { TabPane } = Tabs;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('/api/auth/status'); 
      return response.data; 
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      const user = await checkLoginStatus();
      if (user) {
        navigate('/UserProfile');
      }
    };
    checkStatus();
  }, [navigate]);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/users?username=${values.username}&password=${values.password}`);
      const user = response.data[0];
      if (user) {
        message.success('Đăng nhập thành công!');
        localStorage.setItem('user', JSON.stringify(user));
        window.location.reload( navigate('/UserProfile'));
       
      } else {
        message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/users', {
        username: values.username,
        password: values.password,
        role: 'user',
        email: values.email,
        phone: values.phone,
        address: values.address
      });
  
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      window.location.href = '/login'; // Điều hướng người dùng đến trang UserProfile mà không cần tải lại trang
    } catch (error) {
      message.error('Đã xảy ra lỗi khi đăng ký, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div
      className="max-w-1200 flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/1231234/pexels-photo-1231234.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
    >
      <div className="w-full max-w-md bg-white bg-opacity-60 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <Tabs defaultActiveKey="1" centered>
            <TabPane tab="Đăng nhập" key="1">
              <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">Đăng nhập</h2>
              <Form onFinish={handleLogin} layout="vertical">
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                >
                  <Input
                    className="border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                  <Input.Password
                    className="border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-300"
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Đăng ký" key="2">
              <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">Đăng ký</h2>
              <Form onFinish={handleRegister} layout="vertical">
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                >
                  <Input
                    className="border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
                >
                  <Input
                    className="border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input
                    className="border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </Form.Item>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                  <Input
                    className="border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                  <Input.Password
                    className="border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject('Mật khẩu không khớp!');
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    className="border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-300"
                  >
                    Đăng ký
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
