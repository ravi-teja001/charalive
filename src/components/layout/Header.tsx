import { User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Admin';
      case 'incharge':
        return 'Incharge';
      case 'supervisor_plant':
        return 'Plant Supervisor';
      default:
        return '';
    }
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      {/* Left side - Collapse/Expand button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:flex hidden gap-2"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Right side - Theme Toggle (hidden for Stock Point Supervisor), User Info and Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user?.role !== 'supervisor_stockpoint' && <ThemeToggle size="icon" variant="ghost" />}
        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">
              {getRoleLabel()}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
