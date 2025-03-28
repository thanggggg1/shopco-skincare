import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import orderService from '../../apis/orderService'; // Import orderService
import './Manager.css';

const ViewOrder = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeItem, setActiveItem] = useState('');
  const [orders, setOrders] = useState([]); // State to hold orders
  const [loading, setLoading] = useState(true); // State to manage loading
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
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

  // const tabs = ['Tất cả', 'Đơn hàng đang xử lý', 'Đơn hàng bị hủy', 'Giao thành công'];
  const tabs = [
    {
      value: 'Tất cả',
      label: 'Tất cả'
    },
    {
      value:'Not Delivered',
      label: 'Đang xử lý'
    },
    {
      value: 'Cancelled',
      label: 'Đã hủy'
    },
  ]

  const deliveryStatuses = [
    // 'Not Delivered',
    // 'In Transit',
    // 'Delivered'

    {
      value: 'Not Delivered',
      label: 'Chưa giao hàng'
    },
    {
      value: 'In Transit',
      label: 'Đang giao hàng'
    },
    {
      value: 'Delivered',
      label: 'Đã giao hàng'
    }
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab === 'Tất cả') return true;
      return order.deliveryStatus === activeTab;
    });
  }, [orders, activeTab]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const allOrders = await orderService.getOrders(); // Call API to get all orders
        setOrders(allOrders);

      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await orderService.updateOrderDeliveryStatus(selectedOrder.orderId, newStatus);
      // Refresh orders list
      const updatedOrders = await orderService.getOrders();
      setOrders(updatedOrders);
      setOpenStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;

    try {
      await orderService.deleteOrder(selectedOrder.orderId);
      // Refresh orders list
      const updatedOrders = await orderService.getOrders();
      setOrders(updatedOrders);
      setOpenDeleteModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

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
                key={tab.value}
                className={`tab ${activeTab === tab.value ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
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
                  <th>Mã đơn hàng</th>
                  <th>Người dùng</th>
                  <th>Ngày đặt hàng</th>
                  <th>Trạng thái đơn hàng</th>
                  <th>Trạng thái giao hàng</th>
                  <th>Địa chỉ giao hàng</th>
                  <th>Tổng tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" className="empty-data-message">
                      Đang tải dữ liệu đơn hàng...
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <tr key={order.orderId}>
                      <td>{index + 1}</td>
                      <td>{order.orderId}</td>
                      <td>{order.userId}</td>
                      <td>{order.orderDate}</td>
                      <td>{order.orderStatus}</td>
                      <td>{order.deliveryStatus}</td>
                      <td>{order.deliveryAddress}</td>
                      <td>{order.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="action-btn view-btn"
                            onClick={() => navigate(`/viewOrder/${order.orderId}`)}
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.deliveryStatus);
                              setOpenStatusModal(true);
                            }}
                            title="Cập nhật trạng thái"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenDeleteModal(true);
                            }}
                            title="Xóa đơn hàng"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
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

      {/* Status Update Modal */}
      <Dialog open={openStatusModal} onClose={() => setOpenStatusModal(false)}>
        <DialogTitle>Cập nhật trạng thái giao hàng</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Trạng thái"
            >
              {deliveryStatuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusModal(false)}>Hủy</Button>
          <Button onClick={handleStatusUpdate} variant="contained" color="primary">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Xác nhận xóa đơn hàng</DialogTitle>
        <DialogContent>
          <p>Bạn có chắc chắn muốn xóa đơn hàng #{selectedOrder?.orderId}?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewOrder;
