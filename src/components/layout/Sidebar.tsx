import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Globe,
  Truck,
  Receipt,
  CreditCard,
  Factory,
  Users,
  Home,
  Menu,
  X,
  UserPlus,
  LogOut,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';

const supervisorStockpointLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/add-vendor', label: 'Add Vendor', icon: UserPlus },
  { href: '/raw-biomass', label: 'Raw Biomass Procurement', icon: Truck },
];

const inchargeLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/expenses', label: 'Log Expenses', icon: Receipt },
  { href: '/payments', label: 'Payment Tracking', icon: CreditCard },
];

const supervisorPlantLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/processed-biomass', label: 'Processed Biomass', icon: Factory },
  { href: '/biochar-deployment', label: 'Biochar Deployment', icon: Users },
];

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/daily-activity', label: 'Daily Activity by User', icon: ClipboardList },
  { href: '/admin/users', label: 'User Summary', icon: Users },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMenuClick?: () => void;
  collapsed?: boolean;
}

export function Sidebar({ isOpen: externalIsOpen, onClose, onMenuClick, collapsed = false }: SidebarProps = {}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const handleSetIsOpen = (value: boolean) => {
    if (onClose && !value) {
      onClose();
    } else if (!onClose) {
      setInternalIsOpen(value);
    }
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return adminLinks;
      case 'supervisor_stockpoint':
        return supervisorStockpointLinks;
      case 'incharge':
        return inchargeLinks;
      case 'supervisor_plant':
        return supervisorPlantLinks;
      default:
        return [];
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Admin';
      case 'supervisor_stockpoint':
        return 'Stock Point Supervisor';
      case 'incharge':
        return 'Incharge';
      case 'supervisor_plant':
        return 'Plant Supervisor';
      default:
        return '';
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile menu button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Overlay - only show on mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-40"
          onClick={() => handleSetIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 h-screen text-sidebar-foreground flex flex-col overflow-hidden transition-all duration-300 lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-72",
          isOpen ? "translate-x-0 w-72" : "-translate-x-full"
        )}
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Header */}
        <div className={cn("border-b border-sidebar-border", collapsed ? "p-4" : "p-6")}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-sidebar-foreground">Sowandreap Biochar</span>
                <span className="text-xs text-sidebar-foreground/70 leading-none mt-0.5">
                  Management System
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="p-4 mx-4 mt-4 rounded-xl bg-sidebar-accent">
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/70 mt-0.5">{getRoleLabel()}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => handleSetIsOpen(false)}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
                title={collapsed ? link.label : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed ? "justify-center px-3" : "justify-start gap-3"
            )}
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
