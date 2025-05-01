import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { db } from '../services/db';
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  CircularProgress, 
  Alert,
  Grid,
  Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MAX_STORES_PER_USER = 5;

function AddStore() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isFirstStore = location.state?.firstStore;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Store name is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    if (!currentUser) return setError('Authentication required');

    try {
      setLoading(true);

      // Check store count limit
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userStores = userDoc.data()?.stores || [];
      
      if (userStores.length >= MAX_STORES_PER_USER) {
        throw new Error(`Maximum ${MAX_STORES_PER_USER} stores allowed per account`);
      }

      // Create new store document
      const storeRef = doc(collection(db, 'stores'));
      await setDoc(storeRef, {
        ...formData,
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      });

      // Update user's stores array
      await setDoc(userRef, {
        stores: [...userStores, storeRef.id]
      }, { merge: true });

      setSuccess('Store created successfully!');
      setFormData({
        name: '',
        location: '',
        description: ''
      });

      // Redirect if this was the first store
      if (isFirstStore) {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      console.error('Store creation error:', err);
      setError(err.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1
    }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {isFirstStore ? 'Create Your First Store' : 'Add New Store'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Store Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location *"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Create Store'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
        * Required fields
      </Typography>
    </Box>
  );
}

export default AddStore;