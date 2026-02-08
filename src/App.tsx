import React, { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RawBiomassProcurement from "./pages/RawBiomassProcurement";
import Expenses from "./pages/Expenses";
import PaymentTracking from "./pages/PaymentTracking";
import ProcessedBiomassProcurement from "./pages/ProcessedBiomassProcurement";
import BiocharDeployment from "./pages/BiocharDeployment";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import AddVendor from "./pages/AddVendor";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import DailyActivityByUser from "./pages/DailyActivityByUser";

const queryClient = new QueryClient();

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: any }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React Error Boundary caught an error:', error);
    console.error('Error info:', errorInfo);
    console.error('Error stack:', error.stack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-2xl">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.state.errorInfo && (
              <details className="text-left mb-4 p-4 bg-gray-50 rounded overflow-auto max-h-64">
                <summary className="cursor-pointer font-semibold text-gray-800 mb-2">Error Details</summary>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// App Routes Component - render routes immediately, don't block on auth
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/raw-biomass" element={<RawBiomassProcurement />} />
      <Route path="/add-vendor" element={<AddVendor />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/daily-activity" element={<DailyActivityByUser />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/payments" element={<PaymentTracking />} />
      <Route path="/processed-biomass" element={<ProcessedBiomassProcurement />} />
      <Route path="/biochar-deployment" element={<BiocharDeployment />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <ThemeProvider>
                <AppRoutes />
              </ThemeProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
