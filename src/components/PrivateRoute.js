import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/auth';

function PrivateRoute() {
  const { currentUser } = useAuth();
  
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;