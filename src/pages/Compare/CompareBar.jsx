import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Slide, 
  Stack, 
  Divider,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { CompareContext } from './context';

const CompareBar = () => {
  const navigate = useNavigate();
  const { 
    productsToCompare, 
    showCompareBar, 
    removeFromCompare, 
    clearCompare 
  } = useContext(CompareContext);
  
  const handleCompare = () => {
    // Create a query string with product IDs
    const productIds = productsToCompare.map(p => p.productId || p.id).join(',');
    navigate(`/compare?products=${productIds}`);
  };
  
  return (
    <Slide direction="up" in={showCompareBar && productsToCompare.length > 0}>
      <Paper 
        elevation={3}
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1100,
          padding: 2,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          backgroundColor: '#f8f8f8'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CompareArrowsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              So sánh sản phẩm ({productsToCompare.length}/4)
            </Typography>
          </Box>
          
          <Box>
            <Button 
              color="error" 
              startIcon={<DeleteOutlineIcon />} 
              onClick={clearCompare}
              sx={{ mr: 1 }}
            >
              Xóa tất cả
            </Button>
            <IconButton onClick={() => clearCompare()}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              flex: 1, 
              overflowX: 'auto', 
              pb: 1 
            }}
          >
            {productsToCompare.map((product) => (
              <Paper 
                key={product.productId || product.id} 
                elevation={1}
                sx={{ 
                  p: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  width: 120,
                  position: 'relative'
                }}
              >
                <IconButton 
                  size="small"
                  onClick={() => removeFromCompare(product.productId || product.id)}
                  sx={{ 
                    position: 'absolute', 
                    top: -10, 
                    right: -10,
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                
                <Avatar 
                  src={product.imageUrls?.[0] || ''} 
                  alt={product.productName}
                  variant="rounded"
                  sx={{ width: 80, height: 80, mb: 1 }}
                />
                
                <Typography 
                  variant="body2" 
                  noWrap 
                  align="center"
                  sx={{ 
                    maxWidth: '100%',
                    mb: 0.5
                  }}
                >
                  {product.productName}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="error" 
                  fontWeight="bold"
                >
                  {product.price?.toLocaleString()}đ
                </Typography>
              </Paper>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 4 - productsToCompare.length }, (_, i) => (
              <Paper 
                key={`empty-${i}`} 
                variant="outlined"
                sx={{ 
                  p: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 120,
                  height: 147, // Match height of product cards
                  backgroundColor: '#f1f1f1',
                  border: '1px dashed #bdbdbd'
                }}
              >
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  align="center"
                >
                  Thêm sản phẩm
                </Typography>
              </Paper>
            ))}
          </Stack>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              ml: 2 
            }}
          >
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<CompareArrowsIcon />}
              onClick={handleCompare}
              disabled={productsToCompare.length < 2}
            >
              So sánh ngay
            </Button>
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
};

export default CompareBar;