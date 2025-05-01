import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../services/auth'; // Assuming you have an auth context
import { 
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  Paper,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function StoreSelector() {
  const { currentUser } = useAuth(); // Get current authenticated user
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', location: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [creatingStore, setCreatingStore] = useState(false); // Loading state for creation
  const navigate = useNavigate();

  // Load user's stores with ownership filter
  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'stores'), (snapshot) => {
      const storesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(store => store.ownerId === currentUser.uid); // Only show user's stores
      
      setStores(storesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  const handleStoreSelect = () => {
    if (selectedStore) {
      navigate(`/pos/${selectedStore}`);
    }
  };

  const handleCreateStore = async () => {
    try {
      setCreatingStore(true);
      
      // Add new store with owner information
      const docRef =await addDoc(collection(db, 'stores'), {
        name: newStore.name,
        location: newStore.location,
        ownerId: currentUser.uid,
        isPublic: false, // or true for public stores
        staffIds: [], // Initialize with no staff
        createdAt: serverTimestamp()
      });
      
      setSnackbar({
        open: true,
        message: 'Store created successfully!',
        severity: 'success'
      });
      
      // Reset form and close dialog
      setNewStore({ name: '', location: '' });
      setOpenDialog(false);
      
      // Auto-select and redirect to new store
      setSelectedStore(docRef.id);
      navigate(`/pos/${docRef.id}`); // Auto-redirect after creation
    } catch (error) {
      console.error("Error creating store:", error);
      setSnackbar({
        open: true,
        message: 'Failed to create store. Please try again.',
        severity: 'error'
      });
    } finally {
      setCreatingStore(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Empty state for new users
  if (stores.length === 0) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8, p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Eagles POS
          </Typography>
          <Typography sx={{ mb: 3 }}>
            You don't have any stores yet. Create your first store to get started.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ mt: 2 }}
          >
            Create Your First Store
          </Button>
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Create New Store</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Store Name"
              fullWidth
              value={newStore.name}
              onChange={(e) => setNewStore({...newStore, name: e.target.value})}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="dense"
              label="Location"
              fullWidth
              value={newStore.location}
              onChange={(e) => setNewStore({...newStore, location: e.target.value})}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDialog(false)}
              disabled={creatingStore}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateStore}
              disabled={!newStore.name || !newStore.location || creatingStore}
              variant="contained"
              endIcon={creatingStore ? <CircularProgress size={20} /> : null}
            >
              {creatingStore ? 'Creating...' : 'Create Store'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Normal state when stores exist
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Select Your Store
      </Typography>
      
      <FormControl fullWidth sx={{ mt: 3, mb: 2 }}>
        <InputLabel>Choose a store</InputLabel>
        <Select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          label="Choose a store"
        >
          {stores.map(store => (
            <MenuItem key={store.id} value={store.id}>
              {store.name} - {store.location}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleStoreSelect}
          disabled={!selectedStore}
        >
          Continue to POS
        </Button>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add New Store
        </Button>
      </Stack>

      <Dialog open={openDialog} onClose={() => !creatingStore && setOpenDialog(false)}>
        <DialogTitle>Create New Store</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Store Name"
            fullWidth
            value={newStore.name}
            onChange={(e) => setNewStore({...newStore, name: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={newStore.location}
            onChange={(e) => setNewStore({...newStore, location: e.target.value})}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            disabled={creatingStore}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateStore}
            disabled={!newStore.name || !newStore.location || creatingStore}
            variant="contained"
            endIcon={creatingStore ? <CircularProgress size={20} /> : null}
          >
            {creatingStore ? 'Creating...' : 'Create Store'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StoreSelector;