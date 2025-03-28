import { useState, useEffect, useMemo } from 'react';
import { FaFilter } from 'react-icons/fa';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, Pagination, CircularProgress, TextField, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Manager.css';
import productService from '../../apis/productService';
import categoryService from '../../apis/categoryService';

const Product = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // State cho modals và form
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    productCode: '',
    categoryId: '',
    productName: '',
    quantity: 0,
    capacity: '',
    price: 0,
    brand: '',
    origin: '',
    status: 'Available',
    imageUrls: [],
    skinType: '',
    description: '',
    ingredients: '',
    usageInstructions: '',
    manufactureDate: '',
    ngayNhapKho: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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

  const tabs = ['Tất cả', 'Hàng mới nhập', 'Hàng sắp hết'];

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      
      const map = {};
      
      // Kiểm tra cấu trúc response
      if (Array.isArray(response)) {
        // Nếu response là mảng trực tiếp
        response.forEach(category => {
          if (category && category.categoryId !== undefined) {
            map[category.categoryId] = {
              categoryType: category.categoryType || 'Unknown',
              categoryName: category.categoryName || 'Unknown'
            };
          }
        });
      } else if (response && response.$values && Array.isArray(response.$values)) {
        // Nếu response có cấu trúc $values
        response.$values.forEach(category => {
          if (category && category.categoryId !== undefined) {
            map[category.categoryId] = {
              categoryType: category.categoryType || 'Unknown',
              categoryName: category.categoryName || 'Unknown'
            };
          }
        });
      }
      
      console.log('Category mapping:', map);
      return map;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {};
    }
  };

  // Xử lý sản phẩm với danh mục đã biết
  const processProducts = (productsArray, categories) => {
    return productsArray.map(product => ({
      ProductID: product.productId,
      ProductCode: product.productCode,
      categoryType: categories[product.categoryId]?.categoryType || 'Unknown',
      categoryName: categories[product.categoryId]?.categoryName || 'Unknown',
      categoryDisplay: `${categories[product.categoryId]?.categoryType || 'Unknown'} - ${categories[product.categoryId]?.categoryName || 'Unknown'}`,
      ProductName: product.productName,
      Quantity: product.quantity,
      Capacity: product.capacity,
      Price: product.price,
      Brand: product.brand,
      Origin: product.origin,
      Status: product.status,
      ImgURL: product?.imageUrls?.[0],
      SkinType: product.skinType,
      Description: product.description,
      Ingredients: product.ingredients,
      UsageInstructions: product.usageInstructions,
      ManufactureDate: product.manufactureDate,
      ngayNhapKho: product.ngayNhapKho
    }));
  };

  // Lấy danh sách sản phẩm
  const fetchProducts = async (categories = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Nếu chưa có danh mục, lấy danh mục trước
      const categoryData = categories || await fetchCategories();
      
      // Lấy sản phẩm với phân trang (nếu API hỗ trợ)
      // Nếu API không hỗ trợ phân trang, lấy tất cả và xử lý phân trang ở client
      const response = await productService.getAllProducts();
      const productsArray = response.$values || [];
      
      // Xử lý sản phẩm với danh mục
      const processedProducts = processProducts(productsArray, categoryData);
      
      setProducts(processedProducts);
      setOriginalProducts(processedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Đã xảy ra lỗi khi tải dữ liệu sản phẩm');
      setLoading(false);
    }
  };

  // Gọi lần đầu khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const categoriesResponse = await categoryService.getCategories();
        const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : 
          (categoriesResponse.$values || []);
        console.log("categoriesData", categoriesData);
        setCategories(categoriesData);
        
        // Fetch products
        await fetchProducts();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProducts(originalProducts);
      // Reset thông báo số lượng lọc khi xóa tìm kiếm
      setFilteredCount(0);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredProducts = originalProducts.filter(product => {
      const productName = (product.ProductName || '').toLowerCase();
      const productCode = (product.ProductCode || '').toLowerCase();
      const brand = (product.Brand || '').toLowerCase();
      const categoryType = (product.categoryType || '').toLowerCase();
      const categoryName = (product.categoryName || '').toLowerCase();

      return productName.includes(searchTermLower) ||
             productCode.includes(searchTermLower) ||
             brand.includes(searchTermLower) ||
             categoryType.includes(searchTermLower) ||
             categoryName.includes(searchTermLower);
    });

    setProducts(filteredProducts);
    // Cập nhật thông báo số lượng lọc khi tìm kiếm
    setFilteredCount(filteredProducts.length !== originalProducts.length ? filteredProducts.length : 0);
  }, [searchTerm, originalProducts]);

  // Sử dụng useMemo để tính toán sản phẩm hiển thị theo tab và phân trang
  const displayedProducts = useMemo(() => {
    let filtered = products;
    
    // Lọc theo tab
    if (activeTab === 'Hàng sắp hết') {
      filtered = products.filter(product => product.Quantity < 9);
    }
    
    // Phân trang ở client (nếu API không hỗ trợ phân trang)
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return filtered.slice(startIndex, endIndex);
  }, [products, activeTab, page, pageSize]);

  // Xử lý thay đổi trang
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleAdd = () => {
    setProductForm({
      productCode: '',
      categoryId: '',
      productName: '',
      quantity: 0,
      capacity: '',
      price: 0,
      brand: '',
      origin: '',
      status: 'Available',
      imageUrls: [],
      skinType: '',
      description: '',
      ingredients: '',
      usageInstructions: '',
      manufactureDate: '',
      ngayNhapKho: ''
    });
    setOpenAddModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    console.log("product", product);
    const category = categories.find(category => category.categoryType === product.categoryType);
    setProductForm({
      productCode: product.ProductCode,
      categoryId: category.categoryId,
      productName: product.ProductName,
      quantity: product.Quantity,
      capacity: product.Capacity,
      price: product.Price,
      brand: product.Brand,
      origin: product.Origin,
      status: product.Status,
      imageUrls: product.ImgURL ? [product.ImgURL] : [],
      skinType: product.SkinType,
      description: product.Description,
      ingredients: product.Ingredients,
      usageInstructions: product.UsageInstructions,
      manufactureDate: product.ManufactureDate,
      ngayNhapKho: product.ngayNhapKho
    });
    setOpenEditModal(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await productService.deleteProduct(selectedProduct.ProductID);
      setSnackbar({
        open: true,
        message: 'Xóa sản phẩm thành công',
        severity: 'success'
      });
      fetchProducts(); // Refresh danh sách sản phẩm
      setOpenDeleteDialog(false);
    } catch {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi xóa sản phẩm',
        severity: 'error'
      });
    }
  };

  console.log("selectedProduct", selectedProduct);

  const handleSubmit = async (isEdit = false) => {
    try {
      // Ensure categoryId is a number
      const formattedData = {
        ...productForm,
        ImgUrl:"",
        categoryId: parseInt(productForm.categoryId)
      };



      if (isEdit) {
        await productService.updateProduct(selectedProduct.ProductID, formattedData);
        setSnackbar({
          open: true,
          message: 'Cập nhật sản phẩm thành công',
          severity: 'success'
        });
      } else {
        await productService.createProduct(formattedData);
        setSnackbar({
          open: true,
          message: 'Thêm sản phẩm thành công',
          severity: 'success'
        });
      }
      fetchProducts(); // Refresh danh sách sản phẩm
      setOpenAddModal(false);
      setOpenEditModal(false);
    } catch {
      setSnackbar({
        open: true,
        message: `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'thêm'} sản phẩm`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilterClick = () => {
    // Reset filter selections
    setSelectedCategory('');
    setSelectedSkinType('');
    setOpenFilterDialog(true);
  };

  const handleFilterApply = () => {
    console.log('Selected Category:', selectedCategory);
    console.log('Selected SkinType:', selectedSkinType);
    
    // Nếu không có bộ lọc nào được chọn, reset về danh sách gốc
    if (!selectedCategory && !selectedSkinType) {
      setProducts(originalProducts);
      setFilteredCount(0);
      setOpenFilterDialog(false);
      return;
    }
    
    const filtered = originalProducts.filter(product => {
      // Nếu có chọn danh mục
      let categoryMatch = true;
      if (selectedCategory) {
        // Tìm thông tin danh mục đã chọn từ categoryOptions
        const selectedCategoryInfo = categoryOptions.find(cat => cat.id === selectedCategory);
        if (selectedCategoryInfo) {
          categoryMatch = product.categoryType === selectedCategoryInfo.categoryType && 
                          product.categoryName === selectedCategoryInfo.categoryName;
        }
      }
      
      // Lọc theo loại da
      const skinTypeMatch = selectedSkinType ? product.SkinType === selectedSkinType : true;
      
      return categoryMatch && skinTypeMatch;
    });

    console.log('Filtered Products:', filtered);
    // Chỉ hiển thị thông báo nếu có sản phẩm được lọc và khác với danh sách gốc
    setFilteredCount(filtered.length !== originalProducts.length ? filtered.length : 0);
    setProducts(filtered);
    setPage(1); // Reset về trang đầu tiên khi lọc
    setOpenFilterDialog(false);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSkinTypeChange = (event) => {
    setSelectedSkinType(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setProducts(originalProducts);
    // Reset thông báo số lượng lọc khi xóa tìm kiếm
    setFilteredCount(0);
  };

  // Tạo danh sách danh mục kết hợp cho bộ lọc
  const categoryOptions = useMemo(() => {
    const uniqueCategories = {};
    
    originalProducts.forEach(product => {
      const key = `${product.categoryType}-${product.categoryName}`;
      if (!uniqueCategories[key]) {
        uniqueCategories[key] = {
          id: key,
          categoryType: product.categoryType,
          categoryName: product.categoryName,
          display: `${product.categoryType} - ${product.categoryName}`
        };
      }
    });
    
    return Object.values(uniqueCategories);
  }, [originalProducts]);
  
  const skinTypes = useMemo(() => {
    return [...new Set(originalProducts.map(product => product.SkinType))];
  }, [originalProducts]);

  // Thêm hàm để xóa bộ lọc
  const handleClearFilters = () => {
    setProducts(originalProducts);
    setFilteredCount(0);
    setSelectedCategory('');
    setSelectedSkinType('');
    setSearchTerm('');
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
              <div key={item.id} className="sidebar-item" onClick={() => navigate(`/${item.id}`)}>
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
            <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm, mã sản phẩm, thương hiệu..."
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
            <h1>Sản Phẩm</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {searchTerm && products.length > 0 && (
                <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>
                  Tìm thấy: {products.length} sản phẩm
                </div>
              )}
               <button className="btn-filter" onClick={handleFilterClick}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaFilter /> 
                  <span>Lọc</span>
                  {filteredCount > 0 && <span className="notification">{filteredCount}</span>}
                </div>
              </button>
              {filteredCount > 0 && (
                <button
                  onClick={handleClearFilters}
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
                  Xóa bộ lọc
                </button>
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
                + Thêm sản phẩm
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
          
          {/* Table */}
          <div className="dashboard-table">
            <table style={{ 
              tableLayout: 'fixed', 
              width: '100%', 
              borderCollapse: 'separate', 
              borderSpacing: '0',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', height: '50px' }}>
                  <th style={{ width: '60px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>ID</th>
                  <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>PRODUCT CODE</th>
                  <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>PHÂN LOẠI</th>
                  <th style={{ width: '150px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TÊN SẢN PHẨM</th>
                  <th style={{ width: '80px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>SỐ LƯỢNG</th>
                  {activeTab === 'Hàng sắp hết' && (
                    <>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>DUNG TÍCH</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>GIÁ TIỀN</th>
                      <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THƯƠNG HIỆU</th>
                      <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THAO TÁC</th>
                    </>
                  )}
                  {activeTab !== 'Hàng sắp hết' && (
                    <>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>DUNG TÍCH</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>GIÁ TIỀN</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THƯƠNG HIỆU</th>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>XUẤT XỨ</th>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TRẠNG THÁI</th>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>HÌNH ẢNH</th>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>LOẠI DA</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>NGÀY SẢN XUẤT</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>NGÀY NHẬP KHO</th>
                      <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THAO TÁC</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td 
                      colSpan={activeTab === 'Hàng sắp hết' ? "9" : "18"} 
                      style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#6c757d', 
                        fontSize: '16px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        <CircularProgress size={24} />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td 
                      colSpan={activeTab === 'Hàng sắp hết' ? "9" : "18"} 
                      style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#dc3545', 
                        fontSize: '16px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      {error}
                    </td>
                  </tr>
                ) : displayedProducts.length > 0 ? (
                  displayedProducts.map((product, index) => (
                    <tr 
                      key={product.ProductID} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        transition: 'all 0.2s',
                        ':hover': { backgroundColor: '#f1f3f5' }
                      }}
                    >
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.ProductID}</td>
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.ProductCode}</td>
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{product.categoryDisplay}</td>
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left', fontWeight: '500' }}>{product.ProductName}</td>
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Quantity}</td>
                      {activeTab === 'Hàng sắp hết' && (
                        <>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Capacity}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'right', fontWeight: '500' }}>{product.Price ? `${product.Price.toLocaleString()}đ` : ''}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{product.Brand}</td>
                          <td style={{ whiteSpace: 'nowrap', overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                            <button
                              onClick={() => handleEdit(product)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                marginRight: '5px',
                                transition: 'background-color 0.2s',
                                ':hover': { backgroundColor: '#0069d9' }
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                ':hover': { backgroundColor: '#c82333' }
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </>
                      )}
                      {activeTab !== 'Hàng sắp hết' && (
                        <>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Capacity}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'right', fontWeight: '500' }}>{product.Price ? `${product.Price.toLocaleString()}đ` : ''}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{product.Brand}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Origin}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Status}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>
                            <img src={product.ImgURL} alt={product.ProductName} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                          </td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.SkinType}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.ManufactureDate}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.ngayNhapKho}</td>
                          <td style={{ whiteSpace: 'nowrap', overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                            <button
                              onClick={() => handleEdit(product)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                marginRight: '5px',
                                transition: 'background-color 0.2s',
                                ':hover': { backgroundColor: '#0069d9' }
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                ':hover': { backgroundColor: '#c82333' }
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan={activeTab === 'Hàng sắp hết' ? "9" : "18"} 
                      className="empty-data-message"
                      style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#6c757d', 
                        fontSize: '16px',
                        fontStyle: 'italic',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Phân trang */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <Pagination
                count={Math.ceil(products.length / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </div>
          </div>
        </div>
      </div>
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)}>
        <DialogTitle>Lọc sản phẩm</DialogTitle>
        <DialogContent>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            displayEmpty
            fullWidth
            style={{ marginBottom: '10px', marginTop: '10px' }}
          >
            <MenuItem value=""><em>Danh mục sản phẩm</em></MenuItem>
            {categoryOptions.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.display}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={selectedSkinType}
            onChange={handleSkinTypeChange}
            displayEmpty
            fullWidth
            style={{ marginTop: '10px' }}
          >
            <MenuItem value=""><em>Loại da</em></MenuItem>
            {skinTypes.map((skinType, index) => (
              <MenuItem key={index} value={skinType}>{skinType}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilterDialog(false)}>Hủy</Button>
          <Button onClick={handleFilterApply} color="primary">Áp dụng</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Modal */}
      <Dialog 
        open={openAddModal || openEditModal} 
        onClose={() => {
          setOpenAddModal(false);
          setOpenEditModal(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {openAddModal ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              label="Mã sản phẩm"
              value={productForm.productCode}
              onChange={(e) => setProductForm({ ...productForm, productCode: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Tên sản phẩm"
              value={productForm.productName}
              onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
              fullWidth
              required
            />
            <Select
              value={productForm.categoryId}
              onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
              displayEmpty
              fullWidth
              required
            >
              <MenuItem value="" disabled>
                <em>Chọn danh mục</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.categoryId} value={category.categoryId}>
                  {category.categoryType} - {category.categoryName}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Số lượng"
              type="number"
              value={productForm.quantity}
              onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Dung tích"
              value={productForm.capacity}
              onChange={(e) => setProductForm({ ...productForm, capacity: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Giá"
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              label="Thương hiệu"
              value={productForm.brand}
              onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Xuất xứ"
              value={productForm.origin}
              onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Loại da"
              value={productForm.skinType}
              onChange={(e) => setProductForm({ ...productForm, skinType: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Ngày sản xuất"
              type="date"
              value={productForm.manufactureDate}
              onChange={(e) => setProductForm({ ...productForm, manufactureDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Ngày nhập kho"
              type="date"
              value={productForm.ngayNhapKho}
              onChange={(e) => setProductForm({ ...productForm, ngayNhapKho: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Mô tả"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="Thành phần"
              value={productForm.ingredients}
              onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="Hướng dẫn sử dụng"
              value={productForm.usageInstructions}
              onChange={(e) => setProductForm({ ...productForm, usageInstructions: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenAddModal(false);
            setOpenEditModal(false);
          }}>
            Hủy
          </Button>
          <Button onClick={() => handleSubmit(openEditModal)} variant="contained" color="primary">
            {openAddModal ? 'Thêm' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa sản phẩm &quot;{selectedProduct?.ProductName}&quot;?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Product;
