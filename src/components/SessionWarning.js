import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  LinearProgress
} from '@mui/material';
import { useAuth } from '../services/auth';

function SessionWarning() {
  const { 
    showWarning, 
    timeLeft, 
    extendSession, 
    logout 
  } = useAuth();

  return (
    <Dialog open={showWarning} onClose={extendSession}>
      <DialogTitle>Session About to Expire</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your session will expire in {timeLeft} seconds. Do you want to continue?
        </DialogContentText>
        <LinearProgress 
          variant="determinate" 
          value={(timeLeft / 120) * 100} 
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={logout} color="error">
          Log Out Now
        </Button>
        <Button onClick={extendSession} color="primary" variant="contained">
          Continue Working
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SessionWarning;