import React from 'react';
import { useAuth } from '../services/auth';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button
      variant="outlined"
      color='inherit'
      startIcon={<LogoutIcon />}
      onClick={logout}
      // sx={{ position: 'fixed', top: 16, right: 16 }}
    >
      Logout
    </Button>
  );
}

export default LogoutButton;