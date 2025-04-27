import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Typography,
  Box
} from '@mui/material';

function Cart({ items = [], onRemove, onCheckout }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', p: 2 }}>
      <Typography variant="h6">Cart</Typography>
      <List>
        {items.length === 0 ? (
          <Typography variant="body2">Your cart is empty</Typography>
        ) : (
          items.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem secondaryAction={
                <Button onClick={() => onRemove(index)}>Remove</Button>
              }>
                <ListItemText
                  primary={item.name}
                  secondary={`$${item.price.toFixed(2)}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
      {items.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Total: ${total.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={onCheckout}
          >
            Checkout
          </Button>
        </>
      )}
    </Box>
  );
}

export default Cart;