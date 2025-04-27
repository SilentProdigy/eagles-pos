import React, { useState } from 'react';
import { useAuth } from '../services/auth';
import { db } from '../services/db';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore'; // Added collection import
import { 
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';

const MAX_STORES_PER_USER = 5;

function AddStore() {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      return setError('You must be logged in to add stores');
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Check store count
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const storeCount = userDoc.exists() ? (userDoc.data().stores || []).length : 0;

      if (storeCount >= MAX_STORES_PER_USER) {
        return setError(`Maximum ${MAX_STORES_PER_USER} stores allowed per account`);
      }

      // Add store
      const storeRef = doc(collection(db, 'stores'));
      await setDoc(storeRef, {
        name,
        location,
        ownerId: currentUser.uid,
        createdAt: new Date()
      });

      // Update user's store list
      await setDoc(userRef, {
        stores: [...(userDoc.data()?.stores || []), storeRef.id]
      }, { merge: true });

      setSuccess('Store added successfully!');
      setName('');
      setLocation('');
    } catch (err) {
      setError('Failed to add store: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Store
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Store Name"
          fullWidth
          margin="normal"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Location"
          fullWidth
          margin="normal"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Store'}
        </Button>
      </form>
    </Box>
  );
}

export default AddStore;