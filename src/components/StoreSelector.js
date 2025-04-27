import React, { useEffect } from 'react';
import { db } from '../services/db';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { 
  Box, 
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography 
} from '@mui/material';

function StoreSelector({ currentStore, onStoreChange }) {
  const [stores, setStores] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const q = query(collection(db, "stores"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const storesData = [];
      querySnapshot.forEach((doc) => {
        storesData.push({ id: doc.id, ...doc.data() });
      });
      setStores(storesData);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (stores.length === 0) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="h6" color="textSecondary">
          No Stores Available
        </Typography>
        <Typography variant="body2">
          Please contact admin to add stores
        </Typography>
      </Box>
    );
  }

  return (
    <FormControl fullWidth variant="outlined" margin="normal">
      <InputLabel>Select Store</InputLabel>
      <Select
        value={currentStore || ''}
        onChange={(e) => onStoreChange(e.target.value)}
        label="Select Store"
      >
        <MenuItem value="">
          <em>Select a store</em>
        </MenuItem>
        {stores.map(store => (
          <MenuItem key={store.id} value={store.id}>
            {store.name} - {store.location}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default StoreSelector;