import React from 'react';
import { Typography, Button, Divider } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, LinkedinOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; 

const { Text, Title } = Typography;

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Liên hệ */}
          <div className="p-4 border-b lg:border-b-0 lg:border-r border-gray-700">
            <Title level={4} className="text-xl font-bold mb-4 text-yellow-400">Liên hệ</Title>
            <Text className="block mb-2 text-gray-300">
              Email: <a href="mailto:thachngocpham95@gmail.com" className="text-yellow-300 hover:text-yellow-500 transition-colors duration-300">thachngocpham95@gmail.com</a>
            </Text>
            <Text className="text-gray-300">
              Điện thoại: <a href="tel:0345616160" className="text-yellow-300 hover:text-yellow-500 transition-colors duration-300">0345616160</a>
            </Text>
          </div>

          {/* Điều hướng */}
          <div className="p-4 border-b lg:border-b-0 lg:border-r border-gray-700">
            <Title level={4} className="text-xl font-bold mb-4 text-yellow-400">Điều hướng</Title>
            <div className="flex flex-col space-y-3">
              <Button type="link" href="/" className="text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-105">Trang chủ</Button>
              <Button type="link" href="/" className="text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-105">Cửa hàng</Button>
              <Button type="link" href="/" className="text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-105">Liên hệ</Button>
            </div>
          </div>

          {/* Kết nối */}
          <div className="p-4 border-b lg:border-b-0 lg:border-r border-gray-700">
            <Title level={4} className="text-xl font-bold mb-4 text-yellow-400">Kết nối</Title>
            <div className="flex space-x-4">
              <Button type="link" href="https://facebook.com" target="_blank" className="text-3xl text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-110">
                <FacebookOutlined />
              </Button>
              <Button type="link" href="https://twitter.com" target="_blank" className="text-3xl text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-110">
                <TwitterOutlined />
              </Button>
              <Button type="link" href="https://instagram.com" target="_blank" className="text-3xl text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-110">
                <InstagramOutlined />
              </Button>
              <Button type="link" href="https://linkedin.com" target="_blank" className="text-3xl text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-110">
                <LinkedinOutlined />
              </Button>
            </div>
          </div>

          {/* Chính Sách */}
          <div className="p-4">
            <Title level={4} className="text-xl font-bold mb-4 text-yellow-400">Chính Sách</Title>
            <div className="flex flex-col space-y-2">
              <Text className="text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-105">
                <a href="/policy/customer">Chính sách khách hàng</a>
              </Text>
              <Text className="text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-105">
                <a href="/policy/return">Chính sách đổi trả</a>
              </Text>
              <Text className="text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-105">
                <a href="/policy/warranty">Chính sách bảo hành</a>
              </Text>
              <Text className="text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-105">
                <a href="/policy/privacy">Chính sách bảo mật</a>
              </Text>
            </div>
          </div>
        </div>

        {/* Thông Tin Cửa Hàng */}
        <div className="mb-8">
          <Title level={4} className="text-xl font-bold mb-4 text-yellow-400">Thông Tin Cửa Hàng</Title>
          <div className="flex flex-col space-y-2">
            <Text className="text-gray-300">Cửa hàng 1: 98 Phan Thanh, Đà Nẵng</Text>
            <Text className="text-gray-300">Cửa hàng 2: 809 Giải Phóng, TP Hà Nội</Text>
            <Text className="text-gray-300">Cửa hàng 3: 192 - 194 Hoa Lan, TP Hồ Chí Minh</Text>
            <Button type="link" className="text-gray-300 hover:text-yellow-300 transition duration-300 transform hover:scale-105">Xem tất cả các cửa hàng</Button>
          </div>
        </div>

        {/* Divider */}
        <Divider className="border-gray-700 my-4" />

        {/* Bản quyền */}
        <Text className="text-center text-gray-500 text-sm">© 2024 Fashion Store. All rights reserved.</Text>
      </div>
    </footer>
  );
};

export default Footer;
