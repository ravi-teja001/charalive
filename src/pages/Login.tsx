import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/biochar';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { swal } from '@/lib/swal';
import { Leaf, Eye, EyeOff, Mail } from 'lucide-react';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [resetPasswordNew, setResetPasswordNew] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [showResetPasswordNew, setShowResetPasswordNew] = useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const { login, resetPassword, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're in password recovery mode (from email link)
  useEffect(() => {
    const checkRecoveryToken = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('type=recovery') && hash.includes('access_token')) {
        // We have a recovery token in the URL - check BEFORE auto-auth happens
        console.log('🔑 Password recovery token detected in URL');
        setIsRecoveryMode(true);
        
        // Supabase will auto-authenticate from the hash, so we wait a moment
        // then check if we have a session
        setTimeout(async () => {
          const { supabase } = await import('@/lib/supabase');
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            // Token might be invalid or expired
            console.error('❌ No session found with recovery token');
            setError('Password reset link is invalid or expired. Please request a new one.');
            setIsRecoveryMode(false);
            // Clear the hash
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            console.log('✅ Recovery session authenticated - showing password reset form');
            setIsRecoveryMode(true);
          }
        }, 500); // Wait for Supabase to process the hash
      }
    };
    
    checkRecoveryToken();
  }, []);

  // Redirect if already authenticated - but NOT if in recovery mode (need to set new password first)
  useEffect(() => {
    // Check for recovery token FIRST - if present, don't redirect even if authenticated
    const hash = window.location.hash;
    const hasRecoveryToken = hash && hash.includes('type=recovery') && hash.includes('access_token');
    
    if (!authLoading && isAuthenticated && !isRecoveryMode && !hasRecoveryToken) {
      // Get the page user was trying to access from location state, or default to dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, isRecoveryMode, navigate, location]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Role comes from database (saved at signup) - API returns it
    console.log('=== LOGIN FORM SUBMITTED ===');
    console.log('Email:', email);
    console.log('Calling login function...');

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      console.log('Login function returned:', result);
      if (result === true) {
        console.log('Login successful, navigating to dashboard...');
        navigate('/dashboard');
      } else if (result && typeof result === 'object' && result.needsRoleSelection) {
        setShowRolePicker(true);
        setAvailableRoles(result.roles);
        setSelectedRole(result.roles[0] || '');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email only - password will be set later from email link
    if (!email) {
      swal.error('Please enter your email address.');
      return;
    }
    if (!email.includes('@')) {
      swal.error('Please enter a valid email address.');
      return;
    }

    setIsResettingPassword(true);
    try {
      const { supabase } = await import('@/lib/supabase');

      // Send password reset email - user will receive link to reset
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
        swal.error(resetError.message || 'Failed to send password reset. Please try again.');
        return;
      }

      swal.success('Password reset email sent! Please check your email (and spam folder) for the reset link to set your new password.');
      setShowForgotPassword(false);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      swal.error(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Handle password update when user comes from reset email link
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!resetPasswordNew || resetPasswordNew.length < 6) {
      swal.error('New password must be at least 6 characters long.');
      return;
    }
    if (resetPasswordNew !== resetPasswordConfirm) {
      swal.error('New password and confirm password do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setError('');
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Check if we have a session (from recovery token)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ No session for password update:', sessionError);
        swal.error('Password reset link is invalid or expired. Please request a new one.');
        setIsRecoveryMode(false);
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      console.log('🔄 Updating password for user:', session.user.email);

      // Update password (user is authenticated via recovery token)
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: resetPasswordNew,
      });

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        swal.error(updateError.message || 'Failed to update password. Please try again.');
        return;
      }

      console.log('✅ Password updated successfully');

      // Clear recovery mode and hash BEFORE signing out
      setIsRecoveryMode(false);
      setResetPasswordNew('');
      setResetPasswordConfirm('');
      window.history.replaceState(null, '', window.location.pathname);
      
      // Sign out so they can login with new password
      await supabase.auth.signOut();
      console.log('✅ Signed out - user can now login with new password');
      
      swal.success('Password updated successfully! Please log in with your new password.');
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      swal.error(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
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

      {/* Right side - Login form */}
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
            {isRecoveryMode ? (
              // Password Reset Form (when user clicks email link)
              <>
                <div className="mb-8">
                  <h2 className="font-display text-2xl lg:text-3xl font-bold text-card-foreground mb-2">
                    Set New Password
                  </h2>
                  <p className="text-muted-foreground">Enter your new password below</p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-new-password" className="text-sm font-medium">New Password</Label>
                    <div className="relative">
                      <Input
                        id="reset-new-password"
                        type={showResetPasswordNew ? "text" : "password"}
                        placeholder="Enter new password (min 6 characters)"
                        value={resetPasswordNew}
                        onChange={(e) => setResetPasswordNew(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        className="h-12 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPasswordNew(!showResetPasswordNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        aria-label={showResetPasswordNew ? "Hide password" : "Show password"}
                      >
                        {showResetPasswordNew ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-confirm-password" className="text-sm font-medium">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="reset-confirm-password"
                        type={showResetPasswordConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={resetPasswordConfirm}
                        onChange={(e) => setResetPasswordConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        className="h-12 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPasswordConfirm(!showResetPasswordConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        aria-label={showResetPasswordConfirm ? "Hide password" : "Show password"}
                      >
                        {showResetPasswordConfirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </form>
              </>
            ) : (
              // Regular Login Form
              <>
                <div className="mb-8">
                  <h2 className="font-display text-2xl lg:text-3xl font-bold text-card-foreground mb-2">
                    Welcome back
                  </h2>
                  <p className="text-muted-foreground">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                    className="h-12 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="h-12 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary pr-10"
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

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>

              <div className="text-sm text-center pt-2 space-y-1">
                <div>
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <a href="/signup" className="text-primary font-medium hover:underline">
                    Sign Up
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  If you signed up, make sure to verify your email before logging in
                </p>
              </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Role Picker Dialog - when user has multiple roles */}
      <Dialog open={showRolePicker} onOpenChange={setShowRolePicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Role</DialogTitle>
            <DialogDescription>
              You have access to multiple roles. Choose which one to use for this session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r === 'admin' ? 'Admin' : r === 'supervisor_stockpoint' ? 'Stock Point Supervisor' : r === 'incharge' ? 'Incharge' : r === 'supervisor_plant' ? 'Plant Supervisor' : r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full h-12"
              onClick={async () => {
                setIsLoading(true);
                setError('');
                try {
                  const success = await login(email, password, selectedRole as UserRole);
                  if (success) {
                    setShowRolePicker(false);
                    navigate('/dashboard');
                  }
                } catch (err: any) {
                  setError(err.message || 'Login failed');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Continue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog - Just ask for email */}
      <Dialog open={showForgotPassword} onOpenChange={(open) => {
        setShowForgotPassword(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                disabled={isResettingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isResettingPassword}
                className="h-12"
              >
                {isResettingPassword ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
