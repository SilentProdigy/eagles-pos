import { useAuth } from '../services/auth';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}