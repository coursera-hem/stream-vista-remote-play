
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
      navigate('/signin');
      return;
    }

    if (requireAdmin && !userData?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  }, [currentUser, userData, loading, requireAdmin, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser || (requireAdmin && !userData?.isAdmin)) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
};
