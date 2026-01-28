import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading...</p>
          <p className="text-xs text-muted-foreground/70 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the current location so user can return after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        collapsed={sidebarCollapsed}
      />
      
      <div 
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          "lg:ml-72", // Desktop: margin for fixed sidebar (288px = w-72)
          sidebarCollapsed && "lg:ml-20" // Desktop collapsed: margin for fixed sidebar (80px = w-20)
        )}
      >
        {/* Top Header with User Info and Logout - only over main content area */}
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 lg:p-6 pt-4 sm:pt-6 lg:pt-6 pb-4">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-border bg-background py-3 px-4 sm:px-6">
          <div className="text-center text-sm text-muted-foreground">
            All rights reserved © Sowandreap 2026
          </div>
        </footer>
      </div>
    </div>
  );
}
