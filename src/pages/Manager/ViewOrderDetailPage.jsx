import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Button, CircularProgress } from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';
import orderService from '../../apis/orderService';
import './Manager.css';

const ViewOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const requestInProgress = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    
    if (!requestInProgress.current && orderId) {
      fetchOrderDetails();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    
    try {
      setLoading(true);
      const response = await orderService.getOrderById(orderId);
      
      if (isMounted.current) {
        setOrder(response);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (isMounted.current) {
        setError('Failed to load order details. Please try again later.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      requestInProgress.current = false;
    }
  };

  const handleBack = () => {
    navigate('/viewOrder');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'N/A';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Order not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", p: 3,width:'99vw' }}>
      <Button
        startIcon={<FaArrowLeft />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Quay lại
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Chi tiết đơn hàng #{order.orderId}
        </Typography>

        <Grid container spacing={3}>
          {/* Order Status Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom>Trạng thái đơn hàng</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Trạng thái:</Typography>
                  <Typography>{order.orderStatus}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Trạng thái giao hàng:</Typography>
                  <Typography>{order.deliveryStatus}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Ngày đặt hàng:</Typography>
                  <Typography>{formatDate(order.orderDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tổng tiền:</Typography>
                  <Typography>{formatCurrency(order.totalAmount)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Delivery Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom>Thông tin giao hàng</Typography>
              <Typography variant="subtitle2" color="text.secondary">Địa chỉ giao hàng:</Typography>
              <Typography>{order.deliveryAddress || 'N/A'}</Typography>
              {order.user && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Người nhận:</Typography>
                  <Typography>{`${order.user.firstName} ${order.user.lastName}`}</Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Số điện thoại:</Typography>
                  <Typography>{order.user.phoneNumber}</Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom>Sản phẩm</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Sản phẩm</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Giá</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Số lượng</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.$values?.map((item, index) => (
                      <tr key={index}>
                        <td style={{ padding: '8px' }}>
                          {item.product?.productName || 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>
                          {formatCurrency(item.price)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>
                          {item.quantity}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Paper>
          </Grid>

          {/* Payment Information */}
          {order.payments?.$values?.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom>Thông tin thanh toán</Typography>
                {order.payments.$values.map((payment, index) => (
                  <div key={index}>
                    <Typography variant="subtitle2" color="text.secondary">Phương thức thanh toán:</Typography>
                    <Typography>{payment.paymentMethod}</Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Trạng thái:</Typography>
                    <Typography>{payment.status}</Typography>
                  </div>
                ))}
              </Paper>
            </Grid>
          )}

          {/* Voucher Information */}
          {order.voucher && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom>Thông tin Voucher</Typography>
                <Typography variant="subtitle2" color="text.secondary">Mã voucher:</Typography>
                <Typography>{order.voucher.voucherName}</Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Giảm giá:</Typography>
                <Typography>{order.voucher.discountPercent}%</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ViewOrderDetailPage; 