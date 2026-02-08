import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Admin panel content is now shown on the Dashboard for admin users.
 * This route redirects to /dashboard so admins see the full admin screen there.
 */
export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user?.role, navigate]);

  return null;
}
