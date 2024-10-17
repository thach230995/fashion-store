import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons'; 
import Logo from '../assets/images/logo (2).webp';
import { useSelector } from 'react-redux'; 
import { Menu, Dropdown } from 'antd';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const totalItems = useSelector((state) => state.cart.totalItems);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/UserProfile');
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={handleProfileClick}>
        <UserOutlined /> Trang cá nhân
      </Menu.Item>
      <Menu.Item key="2" onClick={handleLogout}>
        <LogoutOutlined /> Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src={Logo} alt="Fashion Store Logo" className="h-10 mr-3" />
          <span className="text-xl font-bold hover:text-yellow-400 transition duration-300">
            Fashion Store
          </span>
        </Link>
        <div className="hidden md:flex space-x-8">
          <Link to="/" className="flex items-center hover:text-yellow-400 transition duration-300">
            <HomeOutlined className="mr-1" /> Trang chủ
          </Link>
          <Link to="/category/Áo Nam" className="hover:text-yellow-400 transition duration-300">
            Áo Nam
          </Link>
          <Link to="/category/Quần Nam" className="hover:text-yellow-400 transition duration-300">
            Quần Nam
          </Link>
          <Link to="/category/Giày Nam" className="hover:text-yellow-400 transition duration-300">
            Giày Nam
          </Link>
          <Link to="/cart" className="relative flex items-center hover:text-yellow-400 transition duration-300">
            <ShoppingCartOutlined className="mr-1" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <Dropdown overlay={menu} trigger={['click']}>
              <span className="flex items-center cursor-pointer hover:text-yellow-400 transition duration-300">
                <UserOutlined className="mr-1" /> Xin chào, {user.username}
              </span>
            </Dropdown>
          ) : (
            <Link to="/login" className="flex items-center hover:text-yellow-400 transition duration-300">
              <UserOutlined className="mr-1" /> Đăng nhập
            </Link>
          )}
        </div>
        <div className="md:hidden">
          <button className="text-xl focus:outline-none text-white">
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
