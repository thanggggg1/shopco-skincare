import { Box, Button, Container, Typography, Tabs, Tab, Grid, Paper, Avatar, List, ListItem, ListItemIcon, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Person, Phone, Email, ExitToApp } from "@mui/icons-material";
import {Link, Breadcrumbs} from '@mui/material'
import Banner from "../../components/Banner";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header";
import userService from "../../apis/userService";
import orderService from "../../apis/orderService";
import { FaEye } from 'react-icons/fa';

const Order = () => {
  const [tabIndex, setTabIndex] = useState(0);  
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserInfo = () => {
      try {
        const currentUser = userService.getCurrentUser();
        if (currentUser) {
          setUserName(currentUser.name);
          setUserId(currentUser.userId);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      
      try {
        const allOrders = await orderService.getOrders();
        // Filter orders for current user
        const userOrders = allOrders.filter(order => order.userId === userId);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userid");
    window.location.href = "/";
  };

  const menuItems = [
    { text: "Thông tin tài khoản", icon: <Person />, action: () => navigate("/account") },
    { text: "Đơn hàng của tôi", icon: <Phone />, active: true },
    { text: "Hỏi đáp", icon: <Email /> },
    { text: "Đăng xuất", icon: <ExitToApp />, action: handleLogout },
  ];

  const tabs = [
    { value: 'Tất cả', label: 'Tất cả' },
    { value: 'Not Delivered', label: 'Đang xử lý' },
    { value: 'In Transit', label: 'Đang vận chuyển' },
  ];

  const filteredOrders = useMemo(() => {
    const currentTab = tabs[tabIndex].value;
    return orders.filter((order) => {
      if (currentTab === 'Tất cả') return true;
      return order.deliveryStatus === currentTab;
    });
  }, [orders, tabIndex]);

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

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <Header />
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3, ml: 10}}>
        <Link underline="hover" color="inherit" href="/" display="flex" alignItems="center">
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Trang chủ
        </Link>
        <Typography color="text.primary">Tài khoản</Typography>
      </Breadcrumbs>
      <Banner />
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: "#f5f5f5", textAlign: "center" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
                <Avatar src="/path-to-avatar.jpg" sx={{ width: 50, height: 50, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  {userName ? `Chào ${userName}!` : 'Chào bạn!'}
                </Typography>
              </Box>
              <List>
                {menuItems.map((item) => (
                  <ListItem
                    key={item.text}
                    button
                    onClick={item.action ? item.action : null}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: item.active ? '#e3f2fd' : 'transparent',
                      '&:hover': { bgcolor: '#e3f2fd' },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9} sx={{ display: "flex", flexDirection: "column" }}>
            <Paper elevation={0} sx={{ flexGrow: 1, p: 3, bgcolor: "white" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ĐƠN HÀNG CỦA TÔI
              </Typography>
              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2, mb: 3 }}>
                <Tabs
                  value={tabIndex}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ bgcolor: "white", color: "black", borderRadius: 2 }}
                  TabIndicatorProps={{ style: { backgroundColor: "#FF6600" } }}
                >
                  {tabs.map((tab) => (
                    <Tab key={tab.value} label={tab.label} sx={{ color: "black" }} />
                  ))}
                </Tabs>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : filteredOrders.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Mã đơn hàng</TableCell>
                        <TableCell>Ngày đặt hàng</TableCell>
                        <TableCell>Trạng thái đơn hàng</TableCell>
                        <TableCell>Trạng thái giao hàng</TableCell>
                        <TableCell>Địa chỉ giao hàng</TableCell>
                        <TableCell>Tổng tiền</TableCell>
                        <TableCell>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrders.map((order, index) => (
                        <TableRow key={order.orderId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{order.orderId}</TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell>
                          <TableCell>{order.orderStatus}</TableCell>
                          <TableCell>{order.deliveryStatus}</TableCell>
                          <TableCell>{order.deliveryAddress || 'N/A'}</TableCell>
                          <TableCell>{order.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<FaEye />}
                              onClick={() => navigate(`/viewOrder/${order.orderId}`)}
                            >
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ bgcolor: "#f5f5f5", p: 4, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography color="black" variant="h6" sx={{ mb: 2 }}>
                    Bạn chưa có đơn hàng nào
                  </Typography>
                  <Button variant="contained" color="success" size="large" onClick={() => navigate('/')}>
                    Tiếp tục mua sắm
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
};

export default Order;
