import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedSpinner } from './AnimatedComponents';

const ProtectedRoute = ({ children, requireAuth = true, requireRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/user-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
