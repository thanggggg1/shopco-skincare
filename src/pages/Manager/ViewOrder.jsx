import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport } from 'react-icons/fa';
import { Box } from '@mui/material';
import orderService from '../../apis/orderService'; // Import orderService
import './Manager.css';

const ViewOrder = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeItem, setActiveItem] = useState('');
  const [orders, setOrders] = useState([]); // State to hold orders
  const [loading, setLoading] = useState(true); // State to manage loading
  const navigate = useNavigate();

  const sidebarItems = [
    // { id: 'revenue', name: 'Doanh thu', icon: '📊' },
    // { id: 'staff', name: 'Nhân viên', icon: '👤' },
    { id: 'viewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'product', name: 'Sản phẩm', icon: '📦' },
    { id: 'viewCustomer', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'viewSupport', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucher', name: 'Vouchers', icon: '🎫' },
    { id: 'feedback', name: 'Feedback', icon: '📢' },
  ];

  const tabs = ['Tất cả', 'Đơn hàng đang xử lý', 'Đơn hàng bị hủy', 'Giao thành công'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const allOrders = await orderService.getOrders(); // Call API to get all orders

        console.log("allOrders", allOrders);
        setOrders(allOrders);

      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userid");
    window.location.href = "/";
  };
  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <div className="manager-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            <div className="logo">
              <img src="/images/logo.png" alt="Beauty Cosmetics" />
            </div>
            <div className="brand">
              <div>BEAUTY</div>
              <div>COSMETICS</div>
            </div>
          </div>
          
          <div className="sidebar-title">MANAGER</div>
          
          <div className="sidebar-menu">
            {sidebarItems.map((item) => (
              <div key={item.id} className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`} onClick={() => { setActiveItem(item.id); navigate(`/${item.id}`); }} style={{ cursor: 'pointer' }}>
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </div>
            ))}
          </div>
          
          <div className="logout-button" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span>Đăng Xuất</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="dashboard-header">
            <div className="search-bar">
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          
          {/* Dashboard Title and Actions */}
          <div className="dashboard-title-bar">
            <h1>Đơn Hàng</h1>
            <div className="dashboard-actions">
              <button className="btn-filter">
                <FaFilter /> Filter <span className="notification">1</span>
              </button>
              <button className="btn-export">
                <FaFileExport /> Export
              </button>

            </div>
          </div>
          
          {/* Tabs */}
          <div className="dashboard-tabs">
            {tabs.map((tab) => (
              <div 
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>

            {/* "$id": "2",
      "orderId": 14,
      "userId": 1,
      "orderDate": "2025-03-05T15:37:02.253",
      "orderStatus": "Paid",
      "deliveryStatus": "Not Delivered",
      "deliveryAddress": null,
      "totalAmount": 498000, */}
          {/* Table */}
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>OrderID</th>
                  <th>UserID</th>
                  <th>OrderDate</th>
                  <th>OrderStatus</th>
                  <th>DeliveryStatus</th>
                  <th>DeliveryAddress</th>
                  <th>TotalAmount</th>
                  
 
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" className="empty-data-message">
                      Đang tải dữ liệu đơn hàng...
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={order.orderId}>
                      <td>{index + 1}</td>
                      <td>{order.orderId}</td>
                      <td>{order.userId}</td>
                      <td>{order.orderDate}</td>
                      <td>{order.orderStatus}</td>
                      <td>{order.deliveryStatus}</td>
                      <td>{order.deliveryAddress}</td>
                      <td>{order.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="empty-data-message">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default ViewOrder;
