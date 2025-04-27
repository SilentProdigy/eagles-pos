import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';

function UserManagement() {
  // You would fetch users from your backend here
  const [users, setUsers] = React.useState([]);

  return (
    <div>
      <Typography variant="h5" gutterBottom>User Management</Typography>
      <List>
        {users.map(user => (
          <ListItem key={user.id}>
            <ListItemText
              primary={user.email}
              secondary={`Last login: ${user.lastLogin}`}
            />
            <Chip 
              label={user.role} 
              color={user.role === 'admin' ? 'primary' : 'default'}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default UserManagement;