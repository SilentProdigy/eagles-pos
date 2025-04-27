import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Box
} from '@mui/material';

function ProductList({ products = [], onAddToCart, loading = false }) {
  // Handle loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle empty products
  if (!products || products.length === 0) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="h6" color="textSecondary">
          No Products Available
        </Typography>
        <Typography variant="body2">
          Please add products to this store
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ padding: 2 }}>
      {products.map(product => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{product.name}</Typography>
              <Typography>${product.price?.toFixed(2)}</Typography>
              <Typography>Stock: {product.stock || 0}</Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => onAddToCart(product)}
                disabled={(product.stock || 0) <= 0}
              >
                Add to Cart
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default ProductList;