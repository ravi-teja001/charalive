import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/types/biochar';
import { Leaf } from 'lucide-react';
import { swal } from '@/lib/swal';

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'supervisor_stockpoint',
    label: 'Stock Point Supervisor',
    description: 'Raw biomass procurement',
  },
  {
    value: 'incharge',
    label: 'Incharge',
    description: 'Expenses & payment tracking',
  },
  {
    value: 'supervisor_plant',
    label: 'Plant Supervisor',
    description: 'Processing & deployment',
  },
];

export default function Index() {
  const { isAuthenticated, signup, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading indicator while checking authentication
  if (authLoading) {
    return (
      <>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .loading-spinner {
            animation: spin 1s linear infinite;
          }
        `}</style>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          backgroundColor: '#f5f5f5',
          fontFamily: 'sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              marginBottom: '16px'
            }}>
              <div className="loading-spinner" style={{
                width: '32px',
                height: '32px',
                border: '4px solid #3b82f6',
                borderTop: '4px solid transparent',
                borderRadius: '50%'
              }}></div>
            </div>
            <p style={{ color: '#666', fontWeight: 500, fontSize: '16px' }}>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !selectedRole) {
      swal.error('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      swal.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      swal.error('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      const result = await signup(email, password, email.split('@')[0] || 'User', selectedRole as UserRole);
      if (result.success) {
        swal.success(result.message);
        // Check if user is already logged in (auto-login after signup)
        setTimeout(() => {
          // If message says "logged in", go to dashboard, otherwise go to login
          if (result.message.includes('logged in')) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        }, 500);
      } else {
        swal.error(result.message || 'Signup failed. Try again.');
      }
    } catch (err: any) {
      swal.error(err.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
              <Leaf className="w-8 h-8 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground">Sowandreap Biochar</h1>
              <p className="text-primary-foreground/70">Management System</p>
            </div>
          </div>
          
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Transforming<br />
            Agricultural Waste<br />
            Into Sustainable<br />
            Solutions
          </h2>
          
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Track biomass procurement, manage processing plants, and monitor biochar deployment with our comprehensive management platform.
          </p>

          <div className="mt-12 flex gap-8">
            <div>
              <p className="font-display text-3xl font-bold text-accent">5+</p>
              <p className="text-sm text-primary-foreground/70">Stock Points</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-accent">2</p>
              <p className="text-sm text-primary-foreground/70">Processing Plants</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-accent">100+</p>
              <p className="text-sm text-primary-foreground/70">Farmers Reached</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Leaf className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Biochar</h1>
              <p className="text-sm text-muted-foreground">Management System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground">Create an account</h2>
            <p className="text-muted-foreground mt-2">Sign up to get started with your account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label>Select Your Role *</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
