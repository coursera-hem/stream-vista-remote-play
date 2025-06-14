
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!currentUser) {
      toast({
        title: "Access Denied",
        description: "Please sign in to access this page.",
        variant: "destructive"
      });
      navigate('/signin', { replace: true });
      return;
    }

    if (requireAdmin && !userData?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      navigate('/', { replace: true });
      return;
    }
  }, [currentUser, userData, loading, requireAdmin, navigate, toast]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Verifying access...</div>
      </div>
    );
  }

  // Don't render anything if not authorized - this prevents any flash of content
  if (!currentUser || (requireAdmin && !userData?.isAdmin)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
};
