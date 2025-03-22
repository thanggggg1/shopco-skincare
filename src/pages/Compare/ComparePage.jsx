import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Box,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import productService from '../../apis/productService';

const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Clean up function
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const productIds = searchParams.get('products')?.split(',') || [];
      
      if (productIds.length === 0) {
        navigate('/');
        return;
      }
      
      try {
        // Use productService to fetch products
        const fetchedProducts = await Promise.all(
            productIds.map(async (id) => {
                const product = await productService.getProductById(id);
              // Add discounted price calculation if needed
            if (product) {
              return {
                ...product,
                discountedPrice: product.price - (product.price * 15 / 100)
              };
            }
            return null;
          })
        );
        
        // Filter out any null products (failed to fetch)
          const validProducts = fetchedProducts.filter(product => product !== null);
          setProducts(validProducts);
          if (isMounted.current) {
            console.log("validProducts", validProducts);
          }
      } catch (error) {
        console.error('Error fetching products for comparison:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
          setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchParams, navigate]);
    console.log("products", products);
  
  // Get all possible properties to compare
  const getComparisonProperties = () => {
    const properties = [
      { id: 'image', label: 'Hình ảnh', type: 'image' },
      { id: 'productName', label: 'Tên sản phẩm', type: 'text' },
      { id: 'price', label: 'Giá gốc', type: 'price' },
      { id: 'discountedPrice', label: 'Giá khuyến mãi', type: 'price' },
      { id: 'brand', label: 'Thương hiệu', type: 'text' },
      { id: 'origin', label: 'Xuất xứ', type: 'text' },
      { id: 'capacity', label: 'Dung tích', type: 'text' },
      { id: 'skinType', label: 'Loại da', type: 'text' },
      { id: 'totalSold', label: 'Đã bán', type: 'number' },
      { id: 'description', label: 'Mô tả', type: 'text' },
    ];
    
    return properties;
  };
  
  const handleAddToCart = (productId) => {
    // Implement your add to cart functionality
    console.log(`Adding product ${productId} to cart`);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải dữ liệu so sánh...</Typography>
      </Box>
    );
  }
  
  if (products.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h5" component="h1">
          Không tìm thấy sản phẩm để so sánh
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Quay về trang chủ
        </Button>
      </Container>
    );
  }
  
  const properties = getComparisonProperties();
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            underline="hover" 
            color="inherit" 
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Trang chủ
          </Link>
          <Typography color="text.primary">So sánh sản phẩm</Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          So sánh sản phẩm ({products.length})
        </Typography>
      </Box>
      
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="product comparison table">
          <TableHead>
            <TableRow>
              <TableCell width="15%" 
                sx={{ 
                  fontWeight: 'bold', 
                  backgroundColor: '#f5f5f5' 
                }}
              >
                So sánh
              </TableCell>
              {/* {products.map((product) => (
                <TableCell 
                  key={product.productId || product.id} 
                  align="center"
                  width={`${85 / products.length}%`}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    fullWidth
                    onClick={() => handleAddToCart(product.productId || product.id)}
                    sx={{ mb: 2 }}
                  >
                    Thêm vào giỏ
                  </Button>
                </TableCell>
              ))} */}
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id} hover>
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: '#f5f5f5' 
                  }}
                >
                  {property.label}
                </TableCell>
                {products.map((product) => (
                  <TableCell 
                    key={`${product.productId || product.id}-${property.id}`} 
                    align="center"
                  >
                    {property.type === 'image' ? (
                      <Box
                        component="img"
                        src={product.imageUrls?.[0] || ''}
                        alt={product.productName || product.name}
                        sx={{ 
                          width: 150, 
                          height: 150, 
                          objectFit: 'contain',
                          margin: 'auto'
                        }}
                      />
                    ) : property.type === 'price' ? (
                      <Typography color="error" fontWeight="bold">
                        {product[property.id]?.toLocaleString() || 0}đ
                      </Typography>
                    ) : (
                      product[property.id] || '-'
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ComparePage;