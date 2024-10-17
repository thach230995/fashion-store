import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Card, List, Steps } from 'antd';

const { Step } = Steps;

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const orders = useSelector((state) => state.order.orders);
  const order = orders.find(o => o.id === parseInt(orderId));

  if (!order) {
    return <p className="text-red-500">Đơn hàng không tồn tại.</p>;
  }

  const getStatusStep = (status) => {
    switch (status) {
      case 0:
        return 0;
      case 1:
        return 1;
      case 2:
        return 2;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-1200 container mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Chi tiết đơn hàng #{order.id}</h2>
      
      <Card 
        title="Sản phẩm trong đơn hàng" 
        className="shadow-md mb-6"
        headStyle={{ fontSize: '1.25rem', fontWeight: '600' }}
      >
        <List
          itemLayout="horizontal"
          dataSource={order.items}
          renderItem={item => (
            <List.Item className="border-b border-gray-300">
              <List.Item.Meta
                title={<span className="text-lg font-semibold">{item.name}</span>}
                description={
                  <div>
                    <p className="text-sm">Giá: {item.price.toLocaleString()} VND</p>
                    <p className="text-sm">Số lượng: {item.quantity}</p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h3>
        <Steps current={getStatusStep(order.status)} className="site-navigation-steps">
          <Step title="Đang xử lý" />
          <Step title="Đang vận chuyển" />
          <Step title="Đã giao hàng" />
        </Steps>
      </div>

      <div className="text-2xl font-bold text-gray-800">Tổng giá trị: {order.total.toLocaleString()} VND</div>
    </div>
  );
};

export default OrderDetailPage;
