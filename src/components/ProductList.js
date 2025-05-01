import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  FormControlLabel,
  Switch,
  CardMedia,
  Divider
} from '@mui/material';
import PropTypes from 'prop-types';

const productImages = {
  '1': 'https://m.media-amazon.com/images/I/61-jBuhtgZL._AC_UY1100_.jpg',
  '2': 'https://m.media-amazon.com/images/I/71YXhAp+1xL._AC_UY1100_.jpg',
  '3': 'https://m.media-amazon.com/images/I/71z6zZwPoJL._AC_UY1000_.jpg',
  '4': 'https://m.media-amazon.com/images/I/61BvxKSpy3L._AC_UY1100_.jpg',
  '5': 'https://m.media-amazon.com/images/I/71xM+O+QTsL._AC_UY1100_.jpg',
  '6': 'https://m.media-amazon.com/images/I/81pK4w+ofQL._AC_UY1100_.jpg'
};

const sampleProducts = [
  { id: '1', name: 'Cotton T-Shirt', price: 19.99, stock: 25, categoryId: 'cat1' },
  { id: '2', name: 'Slim Fit Jeans', price: 49.99, stock: 15, categoryId: 'cat1' },
  { id: '3', name: 'Running Shoes', price: 89.99, stock: 10, categoryId: 'cat2' },
  { id: '4', name: 'Baseball Cap', price: 24.99, stock: 30, categoryId: 'cat3' },
  { id: '5', name: 'Ankle Socks', price: 9.99, stock: 50, categoryId: 'cat2' },
  { id: '6', name: 'Canvas Backpack', price: 39.99, stock: 12, categoryId: 'cat3' },
  { id: '7', name: 'Denim Jacket', price: 59.99, stock: 8, categoryId: 'cat1' },
  { id: '8', name: 'Sports Shorts', price: 29.99, stock: 18, categoryId: 'cat3' }
];

const sampleCategories = [
  { id: 'cat1', name: 'Clothing' },
  { id: 'cat2', name: 'Footwear' },
  { id: 'cat3', name: 'Accessories' }
];

function ProductList({ categories = [], products = [], onAddToCart, loading = false }) {
  const [useSampleData, setUseSampleData] = useState(false);

  const [selectedVariants, setSelectedVariants] = useState({});
  
  // Combine the products and categories data while preserving your original logic
  const getDisplayedData = () => {
    if (useSampleData) {
      // For sample data, combine categories with their products
      return sampleCategories.map(category => ({
        ...category,
        products: sampleProducts.filter(product => product.categoryId === category.id)
      }));
    }
    
    if (categories.length > 0) {
      // Group products by category if we have categories
      return categories.map(category => ({
        ...category,
        products: products.filter(product => product.categoryId === category.id)
      }));
    }
    
    // Fallback to flat products list if no categories (your original implementation)
    return [{
      id: 'all',
      name: 'All Products',
      products: useSampleData ? sampleProducts : products
    }];
  };

  const displayedData = getDisplayedData();

  // Preserve your original loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  // Preserve your original empty state with sample data toggle
  // if (!displayedData || displayedData.flatMap(cat => cat.products).length === 0) {
  //   return (
  //     <Box p={2} textAlign="center">
  //       <Typography variant="h6" color="textSecondary">
  //         No Products Available
  //       </Typography>
  //       <Typography variant="body2" sx={{ mb: 2 }}>
  //         Please add products to this store
  //       </Typography>
  //       <FormControlLabel
  //         control={
  //           <Switch
  //             checked={useSampleData}
  //             onChange={() => setUseSampleData(!useSampleData)}
  //             color="primary"
  //           />
  //         }
  //         label="Load Sample Products"
  //       />
  //     </Box>
  //   );
  // }

  // Preserve your original card styling and layout
  return (
    <Box sx={{ p: 2 }}>
      {/* {process.env.NODE_ENV === 'development' && (
        <FormControlLabel
          control={
            <Switch
              checked={useSampleData}
              onChange={() => setUseSampleData(!useSampleData)}
              color="primary"
            />
          }
          label="Using Sample Products"
          sx={{ mb: 2 }}
        />
      )} */}

      {displayedData.map(category => (
        <Box key={category.id} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {category.name}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3} sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 3
          }}>
            {category.products.map(product => (
              <Grid item key={product.id} sx={{ display: 'flex', minWidth: 0 }}>
                <Card
                  onClick={() => onAddToCart(product, selectedVariants[product.id])}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3
                    }
                  }}
                >
                  {product.variants?.length > 1 && (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Variant:
                      </Typography>
                      <select
                        value={selectedVariants[product.id] || product.variants[0].id}
                        onChange={(e) => setSelectedVariants({
                          ...selectedVariants,
                          [product.id]: e.target.value
                        })}
                        style={{ width: '100%', padding: '8px' }}
                      >
                        {product.variants.map(variant => (
                          <option key={variant.id} value={variant.id}>
                            {variant.name} - ₱{variant.price}
                          </option>
                        ))}
                      </select>
                    </Box>
                  )}
                  <CardMedia
                    component="img"
                    height="200"
                    image={productImages[product.id] || 'https://via.placeholder.com/300x200'}
                    alt={product.name}
                    sx={{
                      objectFit: 'contain',
                      p: 1,
                      height: 200,
                      width: '100%'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="h5" color="primary">
                      ₱{getProductPrice(product, selectedVariants[product.id])}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={product.stock <= 0 ? 'error' : 'text.secondary'}
                      sx={{ mt: 1 }}
                    >
                      {product.stock <= 0 ? 'Out of Stock' : `${product.stock} in stock`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}

const getProductPrice = (product, selectedVariantId) => {
  if (!product.variants || product.variants.length === 0) {
    return product.price || 0;
  }
  
  const variantId = selectedVariantId || product.variants[0].id;
  const variant = product.variants.find(v => v.id === variantId);
  return variant?.price || product.variants[0].price || 0;
};

// Preserve your original prop types
ProductList.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      stock: PropTypes.number,
      imageUrl: PropTypes.string,
      categoryId: PropTypes.string
    })
  ),
  onAddToCart: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

// Preserve your original default props
ProductList.defaultProps = {
  categories: [],
  products: []
};

export default ProductList;