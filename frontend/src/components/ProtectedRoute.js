import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (adminOnly && user.role !== 'Admin' && user.role !== 'HR') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;

