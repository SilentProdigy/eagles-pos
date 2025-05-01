import React, { useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Box,
  ButtonGroup,
  Button,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

function Cart({ cartItems, onRemoveItem, categories = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Filter cart items by selected category
  const filteredItems = selectedCategory === 'all' 
    ? cartItems 
    : cartItems.filter(item => item.categoryId === selectedCategory);

  // Calculate total for displayed items
  const calculateTotal = () => {
    return filteredItems.reduce((total, item) => {
      const itemPrice = item.variants?.[0]?.price || item.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Shopping Cart ({cartItems.length})
      </Typography>

      {/* Category Filter Buttons */}
      {categories.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Filter by:
          </Typography>
          <ButtonGroup variant="outlined" size="small" fullWidth>
            <Button 
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
              sx={{ flex: 1 }}
            >
              All
              <Chip 
                label={cartItems.length} 
                size="small" 
                sx={{ ml: 1, bgcolor: selectedCategory === 'all' ? 'white' : 'default' }}
              />
            </Button>
            
            {categories.map(category => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                sx={{ flex: 1 }}
              >
                {category.name}
                <Chip 
                  label={cartItems.filter(i => i.categoryId === category.id).length} 
                  size="small" 
                  sx={{ ml: 1, bgcolor: selectedCategory === category.id ? 'white' : 'default' }}
                />
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      )}

      {/* Cart Items List */}
      {filteredItems.length === 0 ? (
        <Box textAlign="center" py={2} flexGrow={1} display="flex" alignItems="center" justifyContent="center">
          <Typography color="textSecondary">
            {selectedCategory === 'all' 
              ? 'Your cart is empty' 
              : `No ${categories.find(c => c.id === selectedCategory)?.name} items in cart`}
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: '300px', overflow: 'auto', flexGrow: 1 }}>
          {filteredItems.map(item => (
            <React.Fragment key={`${item.id}-${item.variantId || ''}`}>
              <ListItem>
                <ListItemText
                  primary={`${item.name} (x${item.quantity})`}
                  secondary={`₱${(item.variants?.[0]?.price || item.price || 0).toFixed(2)} each`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => onRemoveItem(item.id)} sx={{ color: 'error.main' }}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Total Section */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle1">Total:</Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            ₱{calculateTotal().toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default Cart;