import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { swal } from '@/lib/swal';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/biochar';
import { Leaf, Mail, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Initialize role as empty - user must select explicitly
  const [role, setRole] = useState<UserRole | ''>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
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
    // Validate form
    if (!email || !password || !confirmPassword || !role) {
      swal.error('Please fill in all fields');
      return;
    }
    
    // Validate role is selected (not empty string)
    if (role === '' || role === null) {
      swal.error('Please select a role');
      return;
    }
    if (password !== confirmPassword) {
      swal.error('Passwords do not match');
      return;
    }
    
    // Log the role being passed to signup
    console.log('=== SIGNUP FORM ===');
    console.log('Email:', email);
    console.log('Selected Role from form:', role);
    console.log('Role type:', typeof role);
    
    setLoading(true);
    try {
      const result = await signup(email, password, email, role);
      if (result.success) {
        swal.success(result.message || 'Signup successful!');
        
        // Check if user is automatically logged in
        if (isAuthenticated) {
          // Auto-redirect to dashboard if logged in
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          // Redirect to login if email verification needed
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        swal.error(result.message || 'Signup failed. Try again.');
      }
    } catch (err) {
      swal.error('Signup failed. Try again.');
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
            Join Us<br />
            In Building<br />
            A Sustainable<br />
            Future
          </h2>
          
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Create your account and start managing biomass procurement, processing, and biochar deployment with our comprehensive platform.
          </p>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Leaf className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Sowandreap Biochar</h1>
              <p className="text-sm text-muted-foreground">Management System</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-xl border-2 border-border/60 p-8 lg:p-10 backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-card-foreground mb-2">
                Sign Up
              </h2>
              <p className="text-muted-foreground">Create a new account</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <Select 
                  value={role || undefined} 
                  onValueChange={(value) => {
                    console.log('🔵 Role changed in Select component:', value);
                    const selectedRole = value as UserRole;
                    console.log('🔵 Setting role state to:', selectedRole);
                    setRole(selectedRole);
                  }}
                >
                  <SelectTrigger 
                    id="role"
                    className="h-12 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervisor_stockpoint">Stock Point Supervisor</SelectItem>
                    <SelectItem value="incharge">Incharge</SelectItem>
                    <SelectItem value="supervisor_plant">Plant Supervisor</SelectItem>
                  </SelectContent>
                </Select>
                {/* Debug display - remove this after testing */}
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs text-muted-foreground">Selected role: {role}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                disabled={loading}
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>

              <div className="text-sm text-center pt-2">
                <span className="text-muted-foreground">Already have an account? </span>
                <a href="/login" className="text-primary font-medium hover:underline">
                  Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
