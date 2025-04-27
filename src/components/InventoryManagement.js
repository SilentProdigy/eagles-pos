import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { collection, addDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import {
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function InventoryManagement({ storeId }) {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0 });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (!storeId) return;

    const unsubscribe = onSnapshot(
      collection(db, 'stores', storeId, 'products'),
      (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => unsubscribe();
  }, [storeId]);

  const handleAddProduct = async () => {
    await addDoc(collection(db, 'stores', storeId, 'products'), newProduct);
    setNewProduct({ name: '', price: 0, stock: 0 });
    setOpenDialog(false);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Inventory Management</Typography>
      
      <Button 
        variant="contained" 
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
      >
        Add Product
      </Button>

      <List>
        {products.map(product => (
          <ListItem key={product.id}>
            <ListItemText
              primary={product.name}
              secondary={`Price: $${product.price} | Stock: ${product.stock}`}
            />
            <IconButton edge="end">
              <EditIcon />
            </IconButton>
            <IconButton edge="end" onClick={() => deleteDoc(doc(db, 'stores', storeId, 'products', product.id))}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Product Name"
            fullWidth
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={newProduct.price}
            onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
          />
          <TextField
            margin="dense"
            label="Stock"
            type="number"
            fullWidth
            value={newProduct.stock}
            onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddProduct}>Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default InventoryManagement;