import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { environment } from '@/lib/environment';
import { apiFetch, setApiToken } from '@/lib/apiClient';
import { User, UserRole } from '@/types/biochar';

const useRailway = environment.useRailway;
const RAILWAY_USER_KEY = 'railway_user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean | { needsRoleSelection: true; roles: string[] }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session...');

        if (useRailway) {
          const token = localStorage.getItem('railway_token');
          if (token) {
            try {
              const url = `${environment.apiBaseUrl}/api/auth/me`;
              const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                const data = await res.json();
                const u = data.user as User;
                setUser(u);
                localStorage.setItem(RAILWAY_USER_KEY, JSON.stringify(u));
                console.log('✅ User set from Railway token:', u);
              } else if (res.status === 401) {
                localStorage.removeItem('railway_token');
                localStorage.removeItem(RAILWAY_USER_KEY);
                setUser(null);
                console.log('ℹ️ Token expired or invalid');
              } else {
                const cached = localStorage.getItem(RAILWAY_USER_KEY);
                if (cached) {
                  try {
                    setUser(JSON.parse(cached) as User);
                    console.log('✅ Restored user from cache (API error)');
                  } catch {
                    setUser(null);
                  }
                } else {
                  setUser(null);
                }
              }
            } catch (err) {
              const cached = localStorage.getItem(RAILWAY_USER_KEY);
              if (cached) {
                try {
                  setUser(JSON.parse(cached) as User);
                  console.log('✅ Restored user from cache (network error)');
                } catch {
                  setUser(null);
                }
              } else {
                setUser(null);
              }
            }
          } else {
            localStorage.removeItem(RAILWAY_USER_KEY);
            setUser(null);
          }
        } else if (environment.supabaseUrl.includes('placeholder')) {
          console.log('🧪 Development mode: Checking localStorage session');
          
          // Check for stored user session in localStorage
          const storedUser = localStorage.getItem('devCurrentUser');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setUser(user);
            console.log('✅ User set from localStorage session:', user);
          } else {
            setUser(null);
            console.log('ℹ️ No stored user session found');
          }
        } else {
          // Production: Only check for real Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          console.log('📋 Session check result:', session ? 'Session found' : 'No session');
          
          if (session?.user) {
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.email?.split('@')[0] || 'User',
              role: 'supervisor_stockpoint',
            };
            setUser(basicUser);
            console.log('✅ User set from session:', basicUser);
          } else {
            setUser(null);
            console.log('ℹ️ No user session found');
          }
        }
      } catch (error) {
        console.error('❌ Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('🏁 Session check completed');
      }
    };

    checkSession();

    // Only set up Supabase auth listener if not in development mode and not using Railway
    if (!useRailway && !environment.supabaseUrl.includes('placeholder')) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state change:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const basicUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || 'User',
            role: 'supervisor_stockpoint',
          };
          setUser(basicUser);
          console.log('✅ User signed in:', basicUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          console.log('ℹ️ User signed out');
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean | { needsRoleSelection: true; roles: string[] }> => {
    try {
      console.log('🔑 Starting login process...');
      console.log('📧 Email:', email);
      console.log('👤 Role:', role);

      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password length
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (useRailway) {
        const res = await fetch(`${environment.apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }
        if (data.user?.roles?.length > 1 && !role) {
          return { needsRoleSelection: true, roles: data.user.roles };
        }
        setApiToken(data.token);
        const basicUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          plantId: data.user.plantId,
          stockPointId: data.user.stockPointId,
        };
        setUser(basicUser);
        localStorage.setItem(RAILWAY_USER_KEY, JSON.stringify(basicUser));
        return true;
      }
      // Check if using placeholder credentials (development mode)
      if (environment.supabaseUrl.includes('placeholder')) {
        console.log('🧪 Development mode: Using local storage for login');
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('devUsers') || '[]');
        
        // Find user by email
        const user = users.find((u: any) => u.email === email);
        
        if (!user) {
          throw new Error('User not found. Please register first.');
        }
        
        // Check password (in development mode, we compare plainly)
        if (user.password !== password) {
          throw new Error('Invalid password. Only registered users can login.');
        }
        
        console.log('✅ Development login successful:', user);
        
        // Set user in context
        const basicUser: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
        setUser(basicUser);
        
        // Store current user session in localStorage
        localStorage.setItem('devCurrentUser', JSON.stringify(basicUser));
        
        return true;
      }

      // Production: Try to login with Supabase (only registered users can login)
      console.log('🔐 Attempting Supabase login for registered user...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Only registered users can login.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before logging in.');
        } else {
          throw new Error('Login failed. Please make sure you have registered first.');
        }
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed. Please register first.');
      }

      console.log('✅ Supabase login successful:', data.user);

      // Set user in context
      const basicUser: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.email?.split('@')[0] || 'User',
        role: role,
      };
      setUser(basicUser);
      
      console.log('🎉 User logged in:', basicUser);
      console.log('💾 User session saved');
      
      return true;

    } catch (error: any) {
      console.error('❌ Login error:', error);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Starting logout...');
      if (useRailway) {
        localStorage.removeItem(RAILWAY_USER_KEY);
        setUser(null);
        // Defer token clear so protected route components unmount first.
        // Avoids 401 from admin API calls that would fire during the transition.
        setTimeout(() => {
          setApiToken(null);
        }, 100);
        return;
      }
      // Check if using placeholder credentials (development mode)
      if (environment.supabaseUrl.includes('placeholder')) {
        console.log('🧪 Development mode: Clearing localStorage session');
        localStorage.removeItem('devCurrentUser');
        setUser(null);
        console.log('✅ Development logout successful');
      } else {
        // Production: Use Supabase logout
        await supabase.auth.signOut();
        setUser(null);
        console.log('✅ Supabase logout successful');
      }
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      setUser(null);
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      localStorage.removeItem('devCurrentUser');
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📝 Starting signup...');
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      if (useRailway) {
        const res = await fetch(`${environment.apiBaseUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role }),
        });
        let data: { success?: boolean; message?: string } = {};
        try {
          data = await res.json();
        } catch {
          return { success: false, message: res.status === 500 ? 'Server error. Check Railway logs.' : 'Failed to create account' };
        }
        if (!res.ok || !data.success) {
          return { success: false, message: data.message || 'Failed to create account' };
        }
        setApiToken(data.token);
        const basicUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          plantId: data.user.plantId,
          stockPointId: data.user.stockPointId,
        };
        setUser(basicUser);
        localStorage.setItem(RAILWAY_USER_KEY, JSON.stringify(basicUser));
        return { success: true, message: data.message || 'Account created and logged in successfully!' };
      }
      // Check if using placeholder credentials (development mode)
      if (environment.supabaseUrl.includes('placeholder')) {
        console.log('🧪 Development mode: Using local storage for signup');
        
        // Store user in localStorage for development
        const users = JSON.parse(localStorage.getItem('devUsers') || '[]');
        
        // Check if user already exists
        if (users.find((u: any) => u.email === email)) {
          return { success: false, message: 'User with this email already exists' };
        }
        
        // Create new user
        const newUser = {
          id: 'dev-' + Date.now(),
          email,
          name,
          role,
          password, // In development, we'll store password plainly (NOT for production)
          createdAt: new Date().toISOString(),
          emailVerified: true
        };
        
        users.push(newUser);
        localStorage.setItem('devUsers', JSON.stringify(users));
        
        console.log('✅ Development signup successful:', newUser);
        
        // Auto-login the user
        const basicUser: User = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        };
        setUser(basicUser);
        
        // Store current user session in localStorage
        localStorage.setItem('devCurrentUser', JSON.stringify(basicUser));
        
        return { success: true, message: 'Account created and logged in successfully!' };
      }
      
      // Production: Sign up the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        console.error('❌ Signup error:', error);
        return { success: false, message: error.message || 'Failed to create account' };
      }

      console.log('✅ Signup successful:', data);
      
      // Automatically login the user after successful signup
      if (data.user && !data.session) {
        // User created but not logged in (email verification required)
        console.log('📧 Email verification required');
        return { success: true, message: 'Account created! Please check your email to verify your account.' };
      } else if (data.session) {
        // User created and automatically logged in
        console.log('🎉 Auto-login after signup');
        
        // Set user in context
        const basicUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.email?.split('@')[0] || 'User',
          role: role,
        };
        setUser(basicUser);
        
        return { success: true, message: 'Account created and logged in successfully!' };
      }

      return { success: true, message: 'Account created successfully!' };
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      return { success: false, message: error.message || 'An error occurred during signup' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (useRailway) {
        return { success: false, message: 'Password reset not yet implemented for Railway. Please contact support.' };
      }
      console.log('🔄 Starting password reset...');
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error('❌ Reset password error:', error);
        return { success: false, message: error.message || 'Failed to send reset email' };
      }

      return { success: true, message: 'Password reset email sent! Please check your inbox.' };
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      return { success: false, message: error.message || 'An error occurred' };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    resetPassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
