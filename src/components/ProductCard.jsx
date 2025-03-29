import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, IconButton, Checkbox, Tooltip } from '@mui/material';
import { useState, useContext } from 'react';
import CompareIcon from '@mui/icons-material/Compare';
import PropTypes from 'prop-types';

// Assuming you'll create a context for managing products to compare
import { CompareContext } from '../pages/Compare/context';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  // Get context safely with default values if context is not available yet
  const compareContext = useContext(CompareContext);
  const addToCompare = compareContext?.addToCompare || (() => {});
  const removeFromCompare = compareContext?.removeFromCompare || (() => {});
  const isInCompareList = compareContext?.isInCompareList || (() => false);
  
  const isProductInCompare = isInCompareList(product.productId);

  const handleProductClick = () => {
    const id = product.id || product.productId;
    navigate(`/product/${id}`);
  };

  const handleCompareClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the compare button
    
    if (isProductInCompare) {
      removeFromCompare(product.productId);
    } else {
      addToCompare(product);
    }
  };

  return (
    <Card 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ 
        cursor: 'pointer',
        position: 'relative',
        '&:hover': { 
          boxShadow: 3,
          transform: 'translateY(-4px)',
          transition: 'all 0.3s ease-in-out'
        }
      }}
      onClick={handleProductClick}
    >
      <div style={{ position: 'relative' }}>
        <img 
          src={product?.imageUrls?.[0] || ''} 
          alt={product.productName || 'Product image'} 
          style={{width: '100%', height: '233px', objectFit: 'cover'}} 
        />
        
        {/* Compare Button - Only visible on hover or if already in compare list */}
        <Tooltip title={isProductInCompare ? "Bỏ so sánh" : "Thêm vào so sánh"}>
          <IconButton 
            onClick={handleCompareClick}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              opacity: isHovered || isProductInCompare ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
            }}
          >
            <Checkbox 
              icon={<CompareIcon />} 
              checkedIcon={<CompareIcon color="primary" />} 
              checked={isProductInCompare}
            />
          </IconButton>
        </Tooltip>
      </div>
      
      {/* Product name in truncated format */}
      <div style={{ padding: '8px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {product.name || product.productName || ''}
      </div>

      <CardContent>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.productName || ''}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" color="error" fontWeight="bold">
            {product.price?.toLocaleString() || 0}đ
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'line-through' }}
          >
            {product.price?.toLocaleString() || 0}đ
          </Typography>
        </Box>

        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={product.rating || 0} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            Đã bán {product?.totalSold || 0}
          </Typography>
        </Box> */}
      </CardContent>
    </Card>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productName: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number,
    rating: PropTypes.number,
    totalSold: PropTypes.number,
    imageUrls: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};