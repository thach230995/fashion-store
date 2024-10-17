import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, Button, message, Tabs, Table, Spin, Modal, Avatar, Select, Divider } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [manualInput, setManualInput] = useState(false); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const fetchProvinces = async () => {
      const cachedProvinces = localStorage.getItem('provinces');
      if (cachedProvinces) {
        setProvinces(JSON.parse(cachedProvinces));
      } else {
        try {
          const provincesResponse = await axios.get('https://provinces.open-api.vn/api/p/');
          
          if (provincesResponse.status === 200 && provincesResponse.data.length > 0) {
            setProvinces(provincesResponse.data);
            localStorage.setItem('provinces', JSON.stringify(provincesResponse.data));
          } else {
            message.error('API không trả về dữ liệu, chuyển sang nhập tay.');
            setManualInput(true);
          }
        } catch (error) {
          console.error('Lỗi khi gọi API:', error);
          message.error('API gặp lỗi, chuyển sang nhập tay.');
          setManualInput(true); 
        }
      }
    };
    const fetchData = async () => {
      setLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.id) {
          const [userResponse, ordersResponse] = await Promise.all([
            axios.get(`http://localhost:5000/users/${storedUser.id}`),
            axios.get(`http://localhost:5000/orders?userId=${storedUser.id}`)
          ]);

          setUser(userResponse.data);
          profileForm.setFieldsValue(userResponse.data);

          const sortedOrders = ordersResponse.data.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });
          setOrders(sortedOrders);
        } else {
          message.error('Không tìm thấy thông tin người dùng.');
        }
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
    fetchData();
  }, [profileForm]);

  const handleProvinceChange = async (provinceCode) => {
    try {
      const districtsResponse = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      if (districtsResponse.data && districtsResponse.data.districts.length > 0) {
        setDistricts(districtsResponse.data.districts);
        profileForm.setFieldsValue({ district: undefined });
      } else {
        message.warning('Không có dữ liệu quận/huyện cho tỉnh này.');
        setManualInput(true); 
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi lấy quận/huyện. Chuyển sang nhập tay.');
      setManualInput(true); 
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      Modal.confirm({
        title: 'Xác nhận cập nhật',
        content: 'Bạn có chắc chắn muốn cập nhật thông tin cá nhân?',
        onOk: async () => {
          setLoading(true);
          try {
            await axios.put(`http://localhost:5000/users/${user.id}`, values);
            setUser({ ...user, ...values });
            localStorage.setItem('user', JSON.stringify({ ...user, ...values }));
            message.success('Cập nhật thông tin thành công!');
            setIsEditingProfile(false);
          } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật thông tin.');
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      message.error('Vui lòng nhập đúng thông tin.');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('Mật khẩu xác nhận không khớp!');
        return;
      }
      setLoading(true);
      try {
        await axios.put(`http://localhost:5000/users/${user.id}`, {
          ...user,
          password: values.newPassword,
        });
        message.success('Cập nhật mật khẩu thành công!');
        passwordForm.resetFields();
      } catch (error) {
        message.error('Có lỗi xảy ra khi cập nhật mật khẩu.');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      message.error('Vui lòng nhập đúng thông tin.');
    }
  };

  const renderPaymentMethod = (paymentMethod) => {
    if (paymentMethod === "COD") {
      return 'Thanh toán khi nhận hàng';
    } else if (paymentMethod === 'Online') {
      return 'Thanh toán trực tuyến';
    } else {
      return 'Không xác định';
    }
  };

  const columns = useMemo(() => [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `ORD-${id}`,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `${total.toLocaleString()} VND`,
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'customerInfo',
      key: 'paymentMethod',
      render: (customerInfo) => renderPaymentMethod(customerInfo?.paymentMethod),
    },
    {
      title: 'Trạng thái vận chuyển',
      dataIndex: 'shippingStatus',
      key: 'shippingStatus',
      render: (shippingStatus) => {
        switch (shippingStatus) {
          case 'shipped':
            return 'Đang vận chuyển';
          case 'delivered':
            return 'Đã giao hàng';
          default:
            return 'Đang xử lý';
        }
      },
    },
  ], []);

  const handleOrderClick = (record) => {
    Modal.info({
      title: `Chi tiết đơn hàng ORD-${record.id}`,
      width: 1200,
      content: (
        <div>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Tên sản phẩm</th>
                <th className="border border-gray-300 p-2">Số lượng</th>
                <th className="border border-gray-300 p-2">Đơn giá</th>
                <th className="border border-gray-300 p-2">Kích cỡ</th>
                <th className="border border-gray-300 p-2">Màu sắc</th>
              </tr>
            </thead>
            <tbody>
              {record.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2">{item.quantity}</td>
                  <td className="border border-gray-300 p-2">{item.selectedSize}</td>
                  <td className="border border-gray-300 p-2">
                    <div
                      className="w-20 h-20"
                      style={{
                        backgroundColor: item.selectedColor,
                        border: '0.5px solid ',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Divider className="my-4" />

          <p><strong>Mã đơn hàng:</strong> ORD-{record.id}</p>
          <p><strong>Ngày đặt:</strong> {moment(record.date).format('DD/MM/YYYY HH:mm')}</p>
          <p><strong>Tổng giá trị:</strong> {record.total.toLocaleString()} VND</p>
          <p><strong>Phương thức thanh toán:</strong> {renderPaymentMethod(record.customerInfo.paymentMethod)}</p>
          <p><strong>Trạng thái vận chuyển:</strong> {record.status === 'shipped' ? 'Đang vận chuyển' : 'Đang xử lý'}</p>

          <Divider className="my-4" />

          <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
          <p><strong>Họ và tên:</strong> {record.customerInfo.name}</p>
          <p><strong>Email:</strong> {record.customerInfo.email}</p>
          <p><strong>Số điện thoại:</strong> {record.customerInfo.phone}</p>
          <p><strong>Địa chỉ giao hàng:</strong> {record.customerInfo.address}, {record.customerInfo.district}, {record.customerInfo.city}</p>
          <p><strong>Ghi chú:</strong> {record.customerInfo.note || 'Không có ghi chú'}</p>
        </div>
      ),
      maskClosable: true,
      onOk() {},
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const items = [
    {
      key: '1',
      label: 'Thông tin tài khoản',
      children: (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Form form={profileForm} layout="vertical">
            <Form.Item name="username" label="Tên đăng nhập">
              <Input disabled className="p-3 border border-gray-300 rounded-lg" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}>
              <Input disabled={!isEditingProfile} className="p-3 border border-gray-300 rounded-lg" />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
              <Input disabled={!isEditingProfile} className="p-3 border border-gray-300 rounded-lg" />
            </Form.Item>
            <Form.Item name="addressDetail" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
              <Input disabled={!isEditingProfile} className="p-3 border border-gray-300 rounded-lg" />
            </Form.Item>
            <Form.Item name="province" label="Thành phố/Tỉnh" rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}>
              {manualInput ? (
                <Input placeholder="Nhập tỉnh/thành phố" className="p-3 border border-gray-300 rounded-lg" />
              ) : (
                <Select disabled={!isEditingProfile} onChange={handleProvinceChange} placeholder="Chọn tỉnh/thành phố">
                  {provinces.map((province) => (
                    <Option key={province.code} value={province.code}>
                      {province.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}>
              {manualInput ? (
                <Input placeholder="Nhập quận/huyện" className="p-3 border border-gray-300 rounded-lg" />
              ) : (
                <Select disabled={!isEditingProfile} placeholder="Chọn quận/huyện">
                  {districts.map((district) => (
                    <Option key={district.code} value={district.name}>
                      {district.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            {isEditingProfile ? (
              <div className="flex space-x-4">
                <Button type="primary" onClick={handleUpdateProfile} className="bg-blue-500 text-white">
                  Lưu thông tin
                </Button>
                <Button onClick={() => setIsEditingProfile(false)} className="bg-gray-500 text-white">
                  Hủy bỏ
                </Button>
              </div>
            ) : (
              <Button type="primary" onClick={() => setIsEditingProfile(true)} className="bg-blue-500 text-white">
                Chỉnh sửa thông tin
              </Button>
            )}
          </Form>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Thay đổi mật khẩu',
      children: (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Form form={passwordForm} layout="vertical">
            <Form.Item name="oldPassword" label="Mật khẩu cũ" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}>
              <Input.Password className="p-3 border border-gray-300 rounded-lg" />
            </Form.Item>
            <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}>
              <Input.Password className="p-3 border border-gray-300 rounded-lg" />
            </Form.Item>
            <Form.Item name="confirmPassword" label="Xác nhận mật khẩu" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}>
              <Input.Password className="p-3 border border-gray-300 rounded-lg" />
            </Form.Item>
            <Button type="primary" onClick={handleUpdatePassword} className="bg-blue-500 text-white">
              Cập nhật mật khẩu
            </Button>
          </Form>
        </div>
      ),
    },
    {
      key: '3',
      label: 'Lịch sử đơn hàng',
      children: (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5, defaultCurrent: 1 }}
            onRow={(record) => ({
              onClick: () => handleOrderClick(record),
            })}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-lg my-10">
      <div className="flex items-center mb-6">
        <Avatar src="path_to_user_avatar" alt="Avatar" className="w-16 h-16 rounded-full mr-4" />
        <h1 className="text-3xl font-semibold text-gray-800">{user?.username}</h1>
      </div>
      <Tabs defaultActiveKey="1" centered items={items} />
    </div>
  );
};

export default UserProfile;
