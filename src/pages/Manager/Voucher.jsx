import { useNavigate } from 'react-router-dom';
import { Box, Modal, TextField, Button, Typography, MenuItem } from '@mui/material';
import './Manager.css';
import { useState, useEffect } from 'react';
import voucherService from '../../apis/voucherService';

const Voucher = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [originalVouchers, setOriginalVouchers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    voucherName: '',
    discountPercent: '',
    minOrderAmount: '',
    startDate: '',
    endDate: '',
    quantity: '',
    status: 'Active',
    description: ''
  });

  const statusOptions = ['Active', 'Inactive', 'Expired'];

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

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await voucherService.getVouchers();
        if (response.$values) {
          setVouchers(response.$values);
          setOriginalVouchers(response.$values);
        } else {
          console.error('Dữ liệu không đúng định dạng:', response);
          setVouchers([]);
          setOriginalVouchers([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách voucher:', error);
        setError('Không thể tải dữ liệu voucher. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setVouchers(originalVouchers);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredVouchers = originalVouchers.filter(voucher => {
      const voucherName = (voucher.voucherName || '').toLowerCase();
      const description = (voucher.description || '').toLowerCase();
      const status = (voucher.status || '').toLowerCase();

      return voucherName.includes(searchTermLower) ||
             description.includes(searchTermLower) ||
             status.includes(searchTermLower);
    });

    setVouchers(filteredVouchers);
  }, [searchTerm, originalVouchers]);

  const handleClear = () => {
    setSearchTerm('');
    setVouchers(originalVouchers);
  };

  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        voucherName: voucher.voucherName,
        discountPercent: voucher.discountPercent,
        minOrderAmount: voucher.minOrderAmount,
        startDate: new Date(voucher.startDate).toISOString().split('T')[0],
        endDate: new Date(voucher.endDate).toISOString().split('T')[0],
        quantity: voucher.quantity,
        status: voucher.status,
        description: voucher.description
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        voucherName: '',
        discountPercent: '',
        minOrderAmount: '',
        startDate: '',
        endDate: '',
        quantity: '',
        status: 'Active',
        description: ''
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingVoucher(null);
    setFormData({
      voucherName: '',
      discountPercent: '',
      minOrderAmount: '',
      startDate: '',
      endDate: '',
      quantity: '',
      status: 'Active',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the data according to API requirements
      const formattedData = {
        voucherName: formData.voucherName,
        discountPercent: Number(formData.discountPercent),
        minOrderAmount: Number(formData.minOrderAmount),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        quantity: Number(formData.quantity),
        status: formData.status,
        description: formData.description
      };

      if (editingVoucher) {
        await voucherService.updateVoucher(editingVoucher.voucherId, formattedData);
        setVouchers(vouchers.map(v => 
          v.voucherId === editingVoucher.voucherId ? { ...v, ...formattedData } : v
        ));
        setOriginalVouchers(originalVouchers.map(v => 
          v.voucherId === editingVoucher.voucherId ? { ...v, ...formattedData } : v
        ));
      } else {
        const response = await voucherService.createVoucher(formattedData);
        setVouchers([...vouchers, response]);
        setOriginalVouchers([...originalVouchers, response]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert('Có lỗi xảy ra khi lưu voucher. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (voucherId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      try {
        await voucherService.deleteVoucher(voucherId);
        setVouchers(vouchers.filter(v => v.voucherId !== voucherId));
        setOriginalVouchers(originalVouchers.filter(v => v.voucherId !== voucherId));
      } catch (error) {
        console.error('Lỗi khi xóa voucher:', error);
        alert('Không thể xóa voucher. Vui lòng thử lại sau.');
      }
    }
  };

  const handleAdd = () => {
    handleOpenModal();
  };

  const handleEdit = (voucherId) => {
    const voucher = vouchers.find(v => v.voucherId === voucherId);
    if (voucher) {
      handleOpenModal(voucher);
    }
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
          
          <div className="logout-button" onClick={() => navigate('/')}>
            <span className="logout-icon">🚪</span>
            <span>Đăng Xuất</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="dashboard-header">
            <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên voucher, mô tả, trạng thái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              />
              {searchTerm && (
                <button
                  onClick={handleClear}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
          
          {/* Dashboard Title and Actions */}
          <div className="dashboard-title-bar">
            <h1>Vouchers</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {searchTerm && vouchers.length > 0 && (
                <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>
                  Tìm thấy: {vouchers.length} voucher
                </div>
              )}
              <button
                onClick={handleAdd}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                + Thêm Voucher
              </button>
            </div>
          </div>
          
          {/* Table */}
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>VoucherID</th>
                  <th>Tên Voucher</th>
                  <th>Giảm giá (%)</th>
                  <th>Đơn tối thiểu</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Số lượng</th>
                  <th>Trạng thái</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="empty-data-message">
                      Đang tải dữ liệu voucher...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="10" className="empty-data-message error-message">
                      {error}
                    </td>
                  </tr>
                ) : vouchers.length > 0 ? (
                  vouchers.map((voucher) => (
                    <tr key={voucher.voucherId}>
                      <td>{voucher.voucherId}</td>
                      <td>{voucher.voucherName}</td>
                      <td>{voucher.discountPercent}%</td>
                      <td>{voucher.minOrderAmount.toLocaleString()}đ</td>
                      <td>{new Date(voucher.startDate).toLocaleDateString('vi-VN')}</td>
                      <td>{new Date(voucher.endDate).toLocaleDateString('vi-VN')}</td>
                      <td>{voucher.quantity}</td>
                      <td>{voucher.status}</td>
                      <td>{voucher.description}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleEdit(voucher.voucherId)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.voucherId)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="empty-data-message">
                      Không có dữ liệu voucher
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit Voucher */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="voucher-modal-title"
        aria-describedby="voucher-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1
        }}>
          <Typography id="voucher-modal-title" variant="h6" component="h2" gutterBottom>
            {editingVoucher ? 'Chỉnh sửa Voucher' : 'Thêm Voucher Mới'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Tên Voucher"
              name="voucherName"
              value={formData.voucherName}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phần trăm giảm giá"
              name="discountPercent"
              type="number"
              value={formData.discountPercent}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Đơn tối thiểu"
              name="minOrderAmount"
              type="number"
              value={formData.minOrderAmount}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Ngày bắt đầu"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Ngày kết thúc"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Số lượng"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Trạng thái"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              margin="normal"
              required
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCloseModal}>Hủy</Button>
              <Button type="submit" variant="contained" color="primary">
                {editingVoucher ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default Voucher;
