import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import StoreSelector from './components/StoreSelector';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import AddStore from './components/AddStore';
import PrivateRoute from './components/PrivateRoute';
import InventoryManagement from './components/InventoryManagement';
import LogoutButton from './components/LogoutButton';
import SessionWarning from './components/SessionWarning';

const theme = createTheme({
  palette: {
    primary: { main: '#4a90e2' },
    secondary: { main: '#f50057' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <SessionWarning />
          <LogoutButton />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-store" element={
              <PrivateRoute>
                <AddStore />
              </PrivateRoute>
            } />
            <Route path="/inventory" element={
              <PrivateRoute>
                <InventoryManagement />
              </PrivateRoute>
            } />
            <Route element={<PrivateRoute />}>
              <Route path="/" element={
                <div style={{ padding: '20px' }}>
                  <StoreSelector />
                  <div style={{ display: 'flex', marginTop: '20px' }}>
                    <ProductList />
                    <Cart />
                  </div>
                </div>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;