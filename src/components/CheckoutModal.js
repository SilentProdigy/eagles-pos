import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Divider,
  Box
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const CheckoutModal = ({ 
  open, 
  onClose, 
  cartItems, 
  onVoidItem,
  onCompleteSale,
  calculateTotal,
  onClearCart
}) => {
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    amount: 0,
    // customerName: '',
    // customerPhone: ''
  });
  
  const [change, setChange] = useState(0);
  const total = calculateTotal();

  useEffect(() => {
    const newChange = paymentInfo.amount - total;
    setChange(newChange >= 0 ? newChange : 0);
  }, [paymentInfo.amount, total]);

  const handlePaymentSubmit = () => {
    if (!paymentInfo.amount || paymentInfo.amount < total) {
      alert(`Amount must be at least $${total}`);
      return;
    }
    
    onCompleteSale({
      method: paymentInfo.method,
      amount: parseFloat(paymentInfo.amount),
      customerName: paymentInfo.customerName,
      customerPhone: paymentInfo.customerPhone,
      changeGiven: change
    });

    setPaymentInfo({
      method: 'cash',
      amount: 0
    });
    onClearCart();
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getItemPrice = (item) => {
    // First try variants array
    if (item.variants?.length > 0) {
      return item.variants[0].price;
    }
    // Fallback to direct price
    return item.price || 0;
  };

  const formatPrice = (price) => {
    return (price || 0).toFixed(2);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent dividers>
        <List>
          {cartItems.map(item => (
            <ListItem key={item.id}>
              <ListItemText 
                primary={item.name} 
                secondary={`${item.quantity} × $${formatPrice(getItemPrice(item))}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => onVoidItem(item.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6">${total.toFixed(2)}</Typography>
        </Box>

        {/* <TextField
          fullWidth
          label="Customer Name"
          name="customerName"
          value={paymentInfo.customerName}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Customer Phone"
          name="customerPhone"
          value={paymentInfo.customerPhone}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
        /> */}

        <TextField
          fullWidth
          label="Cash Received"
          name="amount"
          type="number"
          value={paymentInfo.amount}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: '$',
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Change:</Typography>
          <Typography 
            variant="h6"
            color={change >= 0 ? 'text.primary' : 'error'}
          >
            ${change.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handlePaymentSubmit}
          disabled={paymentInfo.amount <= 0 || change < 0}
        >
          Complete Sale
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutModal;