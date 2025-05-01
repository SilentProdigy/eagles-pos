import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Divider,
  Button,
  IconButton,
  Badge,
  TextField,
  InputAdornment,
  CssBaseline,
  AppBar,
  Toolbar,
  Drawer,
  Stack,
  Snackbar
} from '@mui/material';
import {
  ShoppingCart,
  Receipt,
  Inventory,
  People,
  Search,
  Add,
  Remove,
  Clear,
  Menu
} from '@mui/icons-material';
import ProductList from './ProductList';
import Cart from './Cart';
import { db } from '../services/db';
import { doc, collection, getDocs, addDoc, writeBatch, increment, getDoc } from 'firebase/firestore';
import LogoutButton from './LogoutButton';
import CheckoutModal from './CheckoutModal';
import { getAuth } from 'firebase/auth';

export default function POSPage() {
  const auth = getAuth();

  const { storeId } = useParams();
  const [storeName, setStoreName] = useState('');
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);


  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [notify, setNotify] = useState({ open: false, message: '' });


  // Full-page styles
  const styles = {
    root: {
      display: 'flex',
      height: '100vh',
      overflow: 'hidden'
    },
    appBar: {
      zIndex: (theme) => theme.zIndex.drawer + 1
    },
    content: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    },
    main: {
      flex: 1,
      overflow: 'auto',
      display: 'flex'
    },
    productSection: {
      flex: 1,
      overflow: 'auto',
      p: 2
    },
    cartSection: {
      width: 380,
      borderLeft: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    customerInfo: {
      p: 2,
      borderBottom: '1px solid #e0e0e0'
    }
  };

  // Load products
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, `stores/${storeId}/categories`));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
  
        // Fetch products
        const productsSnapshot = await getDocs(
          collection(db, `stores/${storeId}/products`), 
          { source: "server" } // Bypasses cache
        );
        // In POSPage.js useEffect:
        const productsData = productsSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Process variants
          const variants = (data.variants || []).map(variant => ({
            ...variant,
            price: Number(variant.price) || 0,
            isAvailable: variant.isAvailable === 'true' || variant.isAvailable === true
          }));
        
          return {
            id: doc.id,
            ...data,
            variants,
            price: Number(data.price) || 0
          };
        });
        setProducts(productsData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      }

      const storeRef = doc(db, "stores", storeId);
      const storeDoc = await getDoc(storeRef);
      if (storeDoc.exists()) {
        setStoreName(storeDoc.data().name);
      }
    };
  
    fetchData();
  }, [storeId]);

  // const productsByCategory = categories.map(category => ({
  //   ...category,
  //   products: category.subcategories.length > 0 
  // ? category.subcategories.map(subcategory => ({
  //     ...subcategory,
  //     products: products.filter(product => 
  //       product.subcategoryId === subcategory.id)
  //   }))
  // : products.filter(product => product.categoryId === category.id)
  // }));
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  // const filteredProductsByCategory = productsByCategory.map(category => ({
  //   ...category,
  //   products: category.products.filter(product =>
  //     product.name.toLowerCase().includes(searchTerm.toLowerCase()))
  // })).filter(category => category.products.length > 0);

  // Cart functions
  const handleAddToCart = (product, selectedVariantId) => {
    setCartItems(prevItems => {
      // Find the selected variant
      const variant = product.variants?.find(v => v.id === selectedVariantId) || 
                     product.variants?.[0] || 
                     { id: 'default', price: product.price };
      
      // Create cart item key that combines product ID and variant ID
      const cartItemKey = `${product.id}_${variant.id}`;
      
      const existingItem = prevItems.find(item => 
        `${item.id}_${item.variantId}` === cartItemKey
      );
  
      if (existingItem) {
        return prevItems.map(item =>
          `${item.id}_${item.variantId}` === cartItemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, { 
        ...product,
        variantId: variant.id,
        variantName: variant.name || '',
        price: variant.price,
        quantity: 1
      }];
    });
  };

  const handleRemoveItem = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // const handleCheckout = () => {
  //   alert(`Order placed for ${customer.name || 'Guest'}! Total: $${calculateTotal()}`);
  //   setCartItems([]);
  //   setCustomer({ name: '', phone: '' });
  // };

  // Add this function to your POSPage.js
  const generateReceiptNumber = () => {
    const now = new Date();
    const datePart = [
      now.getFullYear().toString().slice(-2),
      (now.getMonth() + 1).toString().padStart(2, '0'),
      now.getDate().toString().padStart(2, '0')
    ].join('');
    
    const timePart = [
      now.getHours().toString().padStart(2, '0'),
      now.getMinutes().toString().padStart(2, '0'),
      now.getSeconds().toString().padStart(2, '0')
    ].join('');
    
    return `MH-${datePart}-${timePart}`;
  };

  const handleCheckout = () => {
    setCheckoutOpen(true);
  };
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  

  const handleCompleteSale = async (paymentInfo) => {
    try {
      // Validate payment info
      if (!paymentInfo.method || !paymentInfo.amount) {
        throw new Error("Payment method and amount are required");
      }
  
      // Generate receipt number (choose one method from previous examples)
      const receiptNumber = generateReceiptNumber();
      
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.12; // Adjust tax rate as needed
      const total = subtotal + tax;
      const change = paymentInfo.amount - total;
  
      // Create transaction data
      const transactionData = {
        storeId: storeId,
        storeName: storeName,
        customer: {
          name: customer.name.trim() || 'Guest',
          phone: customer.phone.trim() || ''
        },
        staffId: auth.currentUser.uid,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        payment: {
          method: paymentInfo.method, // 'cash', 'card', etc.
          amountTendered: paymentInfo.amount,
          subtotal: subtotal,
          tax: tax,
          total: total,
          change: change > 0 ? change : 0
        },
        receiptNumber: receiptNumber,
        status: "completed",
        createdAt: new Date()
      };
  
      // Add transaction to Firestore
      await addDoc(collection(db, `stores/${storeId}/transactions`), transactionData);
      
      // Update inventory
      const batch = writeBatch(db);
      cartItems.forEach(item => {
        const productRef = doc(db, `stores/${storeId}/products`, item.id);
        batch.update(productRef, {
          stock: increment(-item.quantity)
        });
      });
      await batch.commit();
      
      // Show success
      // alert(`Sale completed! Receipt #${receiptNumber}\nChange: $${change.toFixed(2)}`);
      
      // Reset cart and customer
      setCartItems([]);
      setCustomer({ name: '', phone: '' });
      setCheckoutOpen(false);

      setNotify({ open: true, message: 'Sale completed successfully!' });
      
    } catch (error) {
      console.error("Error completing sale:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const calculateTax = () => {
    // Implement your tax calculation logic
    return calculateSubtotal() * 0.12; // Example: 12% tax
  };

  const handleVoidItem = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleClearCart = () => {
    setCartItems([]); 
    // setPaymentInfo({ method: 'cash', amount: 0 });
  };

  return (
    <Box sx={styles.root}>
      <Snackbar
        open={notify.open}
        autoHideDuration={3000}
        onClose={() => setNotify({ ...notify, open: false })}
        message={notify.message}
      />
      <CssBaseline />
      
      {/* Top App Bar */}
      <AppBar position="fixed" sx={styles.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            POS System - {storeName}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            sx={{
              width: { xs: '100%', sm: 250, md: 250 },
              bgcolor: 'background.paper',
              borderRadius: 1,
              mr: { xs: 0, md: 2 },
              display: { xs: 'none', md: 'block' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
          {/* Updated Button Group with Stack */}
          <Stack direction="row" spacing={1}>
            <Button 
              color="inherit" 
              startIcon={<People />}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                minWidth: 'auto'
              }}
            >
              Customers
            </Button>
            <LogoutButton />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={styles.content}>
        <Toolbar /> {/* Spacer for app bar */}
        
        <Box sx={styles.main}>
          {/* Product Grid */}
          <Box sx={styles.productSection}>
            {/* <Grid container spacing={2}>
              {filteredProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <ProductList 
                        product={product}
                        onAddToCart={handleAddToCart}
                    />
                  <ProductCard 
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </Grid>
              ))}
            </Grid> */}
            <ProductList 
              products={filteredProducts}
              onAddToCart={handleAddToCart}
            />
          </Box>

          {/* Cart Sidebar - Desktop */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' },
            ...styles.cartSection
          }}>
            <Box sx={styles.customerInfo}>
              <Typography variant="subtitle1">Customer</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Name"
                value={customer.name}
                onChange={(e) => setCustomer({...customer, name: e.target.value})}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Cart 
                cartItems={cartItems}
                onRemoveItem={handleRemoveItem}
              />
            </Box>
            
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ textAlign: 'right', mb: 2 }}>
                Total: ${calculateTotal().toFixed(2)}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Complete Sale
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Mobile Cart Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: '100%' }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Cart 
            cartItems={cartItems}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            customer={customer}
            onCustomerChange={(field, value) => 
              setCustomer({...customer, [field]: value})}
            total={calculateTotal()}
          />
        </Box>
      </Drawer>

      {/* Mobile Cart Button */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16,
        display: { md: 'none' }
      }}>
        <Badge badgeContent={cartItems.length} color="primary">
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => setMobileOpen(true)}
            sx={{
              borderRadius: '50%',
              minWidth: 0,
              width: 56,
              height: 56
            }}
          />
        </Badge>
      </Box>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        onVoidItem={handleVoidItem}
        onCompleteSale={handleCompleteSale}
        calculateTotal={calculateTotal}
        onClearCart={handleClearCart}
      />
    </Box>
  );
}