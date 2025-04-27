import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { db } from '../services/db';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { 
  Box, Button, TextField, Typography, 
  CircularProgress, Alert
} from '@mui/material';

const MAX_STORES = 5;

function AddStore() {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return setError('Authentication required');
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Check store count
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const storeCount = userDoc.data()?.stores?.length || 0;

      if (storeCount >= MAX_STORES) {
        return setError(`Maximum ${MAX_STORES} stores allowed per account`);
      }

      // Create store
      const storeRef = doc(collection(db, 'stores'));
      await setDoc(storeRef, {
        name,
        location,
        ownerId: currentUser.uid,
        createdAt: new Date()
      });

      // Update user's stores list
      await setDoc(userRef, {
        stores: [...(userDoc.data()?.stores || []), storeRef.id]
      }, { merge: true });

      setSuccess('Store created successfully!');
      setName('');
      setLocation('');

      // Redirect after first store creation
      if (locationState?.firstStore) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {locationState?.firstStore ? 'Create Your First Store' : 'Add New Store'}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
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
          {loading ? <CircularProgress size={24} /> : 'Create Store'}
        </Button>
      </form>
    </Box>
  );
}

export default AddStore;