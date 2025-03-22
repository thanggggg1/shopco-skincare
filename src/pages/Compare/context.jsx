import React, { createContext, useState, useEffect } from 'react';

export const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [productsToCompare, setProductsToCompare] = useState([]);
  const [showCompareBar, setShowCompareBar] = useState(false);
  
  // Load saved products from localStorage on initial render
  useEffect(() => {
    const savedProducts = localStorage.getItem('compareProducts');
    if (savedProducts) {
      setProductsToCompare(JSON.parse(savedProducts));
    }
  }, []);
  
  // Update localStorage when products to compare changes
  useEffect(() => {
    if (productsToCompare.length > 0) {
      localStorage.setItem('compareProducts', JSON.stringify(productsToCompare));
      setShowCompareBar(true);
    } else {
      localStorage.removeItem('compareProducts');
      setShowCompareBar(false);
    }
  }, [productsToCompare]);
  
  const addToCompare = (product) => {
    // Limit to maximum 4 products for comparison
    if (productsToCompare.length >= 4) {
      alert('Bạn chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc');
      return;
    }
    
    // Check if product is already in compare list
    if (!isInCompareList(product.productId)) {
      setProductsToCompare([...productsToCompare, product]);
    }
  };
  
  const removeFromCompare = (productId) => {
    setProductsToCompare(productsToCompare.filter(item => 
      (item.id || item.productId) !== productId
    ));
  };
  
  const clearCompare = () => {
    setProductsToCompare([]);
  };
  
  const isInCompareList = (productId) => {
    return productsToCompare.some(item => (item.id || item.productId) === productId);
  };
  
  const value = {
    productsToCompare,
    showCompareBar,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompareList
  };
  
  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};