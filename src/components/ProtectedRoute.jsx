import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-6 p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <div className="space-y-2">
          <p className="text-slate-800 font-bold text-lg">Setting up your workspace...</p>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">This usually takes a few seconds.</p>
        </div>
        <button onClick={signOut} className="text-primary font-bold text-sm hover:underline">
          Sign Out & Try Again
        </button>
      </div>
    );
  }

  // Superuser can access everything — bypass role check
  if (profile.role === 'superuser') {
    return children;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // If a patient tries to access admin routes, send them to /patient
    if (profile.role === 'patient') {
      return <Navigate to="/patient" replace />;
    }
    // If an admin/doctor tries to access patient routes, send them to /admin
    if (profile.role === 'admin' || profile.role === 'doctor') {
      return <Navigate to="/admin" replace />;
    }
    // Otherwise, send to login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
