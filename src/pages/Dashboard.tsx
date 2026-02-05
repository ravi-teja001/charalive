import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { FormCard } from '@/components/shared/FormCard';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, getRawBiomassProcurements } from '@/services/api';
import { Truck, Weight, Receipt, CreditCard, Factory, Users, Leaf, MapPin, Download, Image as ImageIcon, Eye, Camera } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { exportToExcel } from '@/utils/excelExport';
import { swal } from '@/lib/swal';
import { PhotoWithMetadata } from '@/components/shared/PhotoWithMetadata';
import './RawBiomassProcurement.mobile.css';

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalTripsToday: 0,
    netWeightToday: 0,
    netWeightThisWeek: 0,
    pendingUploads: 0,
    totalExpenses: 0,
    fuelExpenses: 0,
    pendingPayments: 0,
    clearedPayments: 0,
    processedBiomass: 0,
    biocharProduced: 0,
    farmersDeployed: 0,
    landCovered: 0,
  });
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isLoadingDataRef = useRef(false); // Prevent multiple simultaneous loads
  
  // Procurement Records state
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 20; // Reduced for better performance
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    latitude?: number;
    longitude?: number;
    date?: Date | string;
    name?: string;
  } | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Update rowsPerPage based on screen size
  useEffect(() => {
    const updateRowsPerPage = () => {
      if (window.innerWidth < 768) {
        setRowsPerPage(1);
      } else {
        setRowsPerPage(5);
      }
    };
    
    updateRowsPerPage();
    window.addEventListener('resize', updateRowsPerPage);
    
    return () => window.removeEventListener('resize', updateRowsPerPage);
  }, []);

  const totalPages = Math.max(1, Math.ceil(records.length / rowsPerPage));
  const paginatedRecords = records.length > 0 
    ? records.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    : [];

  // Reset page when records change
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(records.length / rowsPerPage));
    if (records.length > 0 && page > maxPage) {
      setPage(1);
    } else if (records.length === 0) {
      setPage(1);
    }
  }, [records.length, rowsPerPage]);

  const loadRecords = async (forceRefresh: boolean = false) => {
    if (!user?.id) {
      console.log('⚠️ Cannot load records - user ID missing');
      return;
    }
    
    // Load records by userId even if stockPointId is undefined
    // The API will filter by userId, which is sufficient
    try {
      setLoadingRecords(true);
      console.log('📥 Loading procurement records for user:', user.id, 'stockPointId:', user.stockPointId || 'NONE (loading by userId only)');
      
      // If forcing refresh (after save), add delay to ensure DB commit
      if (forceRefresh) {
        console.log('⏳ Waiting for DB commit...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Load records - filter by user email (stockPointId is optional). 20s timeout so loading doesn't hang (e.g. Railway cold start).
      const data = await getRawBiomassProcurements(user.stockPointId || undefined, undefined, undefined, user.email, 20000);
      console.log('✅ Loaded', data.length, 'procurement records');
      console.log('📋 Record IDs:', data.map(r => r.id));
      
      if (data.length > 0) {
        console.log('📋 First record:', {
          id: data[0].id,
          date: data[0].procurementDate,
          vehicle: data[0].vehicleNumber,
          createdBy: data[0].createdBy
        });
      }
      
      // Process records to parse vehiclePhoto JSON into array - optimized
      const processedRecords = data.map((record: any) => {
        let vehiclePhotos = [];
        try {
          // Optimized vehiclePhoto parsing
          if (record.vehiclePhoto) {
            if (typeof record.vehiclePhoto === 'string') {
              // Quick check if it's JSON array format
              if (record.vehiclePhoto.startsWith('[')) {
                vehiclePhotos = JSON.parse(record.vehiclePhoto);
              } else {
                // Single photo string
                vehiclePhotos = [record.vehiclePhoto];
              }
            } else if (Array.isArray(record.vehiclePhoto)) {
              // Already an array
              vehiclePhotos = record.vehiclePhoto;
            } else {
              // Single photo string
              vehiclePhotos = [record.vehiclePhoto];
            }
          }
        } catch (error) {
          // Silent error handling for performance
          vehiclePhotos = record.vehiclePhoto ? [record.vehiclePhoto] : [];
        }
        
        return {
          ...record,
          vehiclePhotos // Add parsed array
        };
      });
      
      setRecords(processedRecords);
      
      // Reset to page 1 when new records are loaded
      setPage(1);
      
      if (data.length > 0) {
        console.log('✅ Records successfully loaded and displayed on Dashboard');
      } else {
        console.warn('⚠️ No records found. Check if records were saved correctly.');
      }
    } catch (error: any) {
      console.error('❌ Error loading records:', error);
      
      // Handle CORS and network errors gracefully
      if (error?.message?.includes('CORS') || 
          error?.message?.includes('Access-Control-Allow-Origin') ||
          error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('ERR_FAILED') ||
          error?.message?.includes('net::ERR_FAILED')) {
        console.warn('⚠️ Network/CORS error detected - showing user-friendly message');
        swal.error('Network error: Unable to connect to server. Please check your internet connection and try again.');
      } else if (error?.message?.includes('JWT') || error?.message?.includes('token')) {
        console.warn('⚠️ Authentication error detected');
        swal.error('Authentication error: Please log in again.');
      } else if (error?.message?.includes('timed out')) {
        swal.error('Loading records timed out. The server may be starting — tap Refresh to try again.');
      } else {
        const msg = error?.message || 'Unknown error';
        const isGeneric = msg === 'Internal Server Error' || msg.includes('API error 500');
        console.warn('⚠️ General API error:', msg);
        swal.error(
          isGeneric
            ? 'Failed to load records: Server error. Please try again or contact support.'
            : `Failed to load records: ${msg}`
        );
      }
      
      // Set empty records to prevent infinite loading
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleExportExcel = () => {
    if (records.length === 0) {
      swal.error('No records to export');
      return;
    }

    const excelRecords = records.map((record) => ({
      id: record.id,
      date: format(record.procurementDate || new Date(), 'MMM dd, yyyy'),
      'Procurement ID': record.procurementId || '-',
      'Created By': record.createdByEmail || 'N/A',
      source: record.source === 'cotton_stalks' ? 'Cotton stalks' : record.source === 'chilli_stalks' ? 'Chilli stalks' : record.source,
      vehicleType: record.vehicleType || 'N/A',
      vehicle: record.vehicleNumber,
      name: record.name || 'N/A',
      state: record.state || 'N/A',
      district: record.district || 'N/A',
      village: record.village || 'N/A',
      'Gross Weight (kg)': record.grossWeight || 0,
      'Net Weight (kg)': record.netWeight || 0,
      'Moisture (%)': record.moisture ? `${record.moisture}%` : '-',
      location: record.locationLatitude && record.locationLongitude
        ? `${record.locationLatitude.toFixed(6)}, ${record.locationLongitude.toFixed(6)}`
        : 'N/A',
    }));

    exportToExcel(excelRecords, 'procurement_records');
    swal.success('Records exported to Excel');
  };

  const loadDashboardData = async () => {
    if (!user || !user.id) {
      console.warn('⚠️ Cannot load dashboard data - user not available');
      console.warn('⚠️ User state:', user);
      return;
    }
    
    // Prevent multiple simultaneous loads
    if (isLoadingDataRef.current) {
      console.log('📊 Dashboard data already loading, skipping duplicate call');
      return;
    }
    
    isLoadingDataRef.current = true;
    setLoading(true);
    try {
      console.log('📊 Loading dashboard data for user:', user.id, 'role:', user.role);
      console.log('📊 User details:', { 
        id: user.id, 
        role: user.role, 
        stockPointId: user.stockPointId, 
        plantId: user.plantId,
        email: user.email 
      });
      
      // Load dashboard stats with 10 second timeout (longer for mobile/APK)
      const dashboardStats = await Promise.race([
        getDashboardStats(
          user.id,
          user.role,
          user.stockPointId,
          user.plantId
        ),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Dashboard stats timeout (10s)')), 10000)
        )
      ]) as any;
      
      console.log('📊 Dashboard stats received:', dashboardStats);
      
      if (dashboardStats) {
        setStats(dashboardStats);
        console.log('✅ Stats successfully updated in state:', dashboardStats);
      } else {
        console.warn('⚠️ Stats object is null or undefined');
        // Set zero stats if API returns null
        setStats({
          totalTripsToday: 0,
          netWeightToday: 0,
          netWeightThisWeek: 0,
          pendingUploads: 0,
          totalExpenses: 0,
          fuelExpenses: 0,
          pendingPayments: 0,
          clearedPayments: 0,
          processedBiomass: 0,
          biocharProduced: 0,
          farmersDeployed: 0,
          landCovered: 0,
        });
      }

      // Load recent trips in parallel (non-blocking)
      if (user.role === 'supervisor_stockpoint') {
        // Don't wait for trips - load in background (stockPointId is optional)
        Promise.race([
          getRawBiomassProcurements(user.stockPointId, undefined, undefined, user.email),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Trips loading timeout')), 10000)
          )
        ]).then((trips: any) => {
          console.log('📊 Recent trips loaded:', trips?.length || 0);
          setRecentTrips(Array.isArray(trips) ? trips.slice(0, 5) : []);
        }).catch((tripError) => {
          console.warn('⚠️ Error loading recent trips (non-critical):', tripError);
          setRecentTrips([]);
        });
      }
    } catch (error: any) {
      console.error('❌ Error loading dashboard data:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        userId: user?.id,
        role: user?.role
      });
      
      // Handle CORS and network errors gracefully
      if (error?.message?.includes('CORS') || 
          error?.message?.includes('Access-Control-Allow-Origin') ||
          error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('ERR_FAILED') ||
          error?.message?.includes('net::ERR_FAILED')) {
        console.warn('⚠️ Network/CORS error in dashboard data loading');
        // Don't show swal error here to avoid spamming user - stats will show zeros
      } else if (error?.message?.includes('timeout')) {
        console.warn('⚠️ Dashboard data loading timeout');
      } else {
        console.warn('⚠️ General dashboard API error');
      }
      
      // Don't reset stats on error - keep previous values for better UX
      const hasExistingStats = stats && (stats.totalTripsToday > 0 || stats.netWeightToday > 0 || stats.totalExpenses > 0);
      if (!hasExistingStats) {
        console.log('📊 Setting default stats (no existing data)');
        setStats({
          totalTripsToday: 0,
          netWeightToday: 0,
          netWeightThisWeek: 0,
          pendingUploads: 0,
          totalExpenses: 0,
          fuelExpenses: 0,
          pendingPayments: 0,
          clearedPayments: 0,
          processedBiomass: 0,
          biocharProduced: 0,
          farmersDeployed: 0,
          landCovered: 0,
        });
      }
    } finally {
      setLoading(false);
      isLoadingDataRef.current = false;
    }
  };

  // Load data when user is available (handles initial mount and refresh)
  useEffect(() => {
    if (user && user.id && location.pathname === '/dashboard') {
      console.log('📊 Dashboard: User available, loading data...');
      console.log('📊 User details:', { id: user.id, role: user.role, stockPointId: user.stockPointId });
      loadDashboardData();
      
      // Load procurement records if user is supervisor_stockpoint (stockPointId not required)
      if (user.role === 'supervisor_stockpoint') {
        console.log('📥 Loading procurement records on Dashboard mount...');
        loadRecords(false); // Don't force refresh on initial load
      } else {
        console.warn('⚠️ Cannot load records - role:', user.role, '(only supervisor_stockpoint can view records)');
      }
      
      // Check if there's a refresh flag (from saved record)
      if (localStorage.getItem('dashboardRefreshNeeded')) {
        console.log('📌 Found refresh flag on mount - will reload records');
        setTimeout(() => {
          if (user.role === 'supervisor_stockpoint' && user.stockPointId) {
            loadRecords(true); // Force refresh
          }
          localStorage.removeItem('dashboardRefreshNeeded');
        }, 1500);
      }
    }
  }, [user?.id, location.pathname]);

  // Also listen for visibility changes (handles page refresh)
  // NOTE: Don't call loadDashboardData here on mount - it's already called in the first useEffect above
  // This effect only handles visibility changes (e.g., app coming to foreground)
  useEffect(() => {
    if (!user || !user.id) return;
    
    const handleVisibilityChange = () => {
      // Only reload when visibility changes to visible (not on initial mount)
      if (document.visibilityState === 'visible' && location.pathname === '/dashboard') {
        console.log('📊 Dashboard visible after background - reloading data...');
        loadDashboardData();
        
        // Reload records if supervisor_stockpoint (stockPointId not required)
        if (user.role === 'supervisor_stockpoint') {
          loadRecords();
        }
      }
    };

    // Don't load immediately here - the first useEffect already handles initial load
    // This effect only handles visibility change events

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, location.pathname]);

  // Listen for custom refresh event from other pages (e.g., when record is saved)
  useEffect(() => {
    if (!user || !user.id) return;
    
    const handleCustomRefresh = () => {
      // Always reload if on dashboard, or check if we should reload when navigating to dashboard
      if (location.pathname === '/dashboard') {
        console.log('🔄 Dashboard refresh event received - reloading data and records...');
        
        // Reload dashboard stats
        loadDashboardData();
        
        // Reload procurement records if supervisor_stockpoint (stockPointId not required)
        if (user.role === 'supervisor_stockpoint') {
          console.log('📥 Refreshing procurement records after save...');
          // Force refresh with delay to ensure DB commit is complete
          setTimeout(() => {
            loadRecords(true); // Force refresh
          }, 1000);
        }
      } else {
        // If not on dashboard yet, store flag to reload when user navigates to dashboard
        console.log('📌 Refresh event received but not on dashboard yet - flag set');
      }
    };

    // Listen for custom dashboardRefresh event
    window.addEventListener('dashboardRefresh', handleCustomRefresh);
    
    // Also listen for storage events (cross-tab communication and same-tab)
    const handleStorageChange = (e: StorageEvent | any) => {
      if ((e.key === 'dashboardRefreshNeeded' || e.type === 'storage') && location.pathname === '/dashboard') {
        console.log('🔄 Storage event detected - refreshing dashboard...');
        // Check localStorage flag
        if (localStorage.getItem('dashboardRefreshNeeded')) {
          handleCustomRefresh();
          localStorage.removeItem('dashboardRefreshNeeded');
        }
      }
    };
    
    // Listen for storage events (works across tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage on mount and when location changes to dashboard
    if (location.pathname === '/dashboard' && localStorage.getItem('dashboardRefreshNeeded')) {
      console.log('📌 Dashboard mounted with refresh flag - reloading records...');
      handleCustomRefresh();
      localStorage.removeItem('dashboardRefreshNeeded');
    }
    
    return () => {
      window.removeEventListener('dashboardRefresh', handleCustomRefresh);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id, user?.role, user?.stockPointId, location.pathname]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderStockpointStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Trips Today"
        value={stats.totalTripsToday?.toString() || '0'}
        subtitle="Raw biomass collected"
        icon={<Truck size={24} />}
      />
      <StatCard
        title="Net Weight Collected"
        value={`${((stats.netWeightToday || 0) / 1000).toFixed(1)} T`}
        subtitle="Today"
        icon={<Weight size={24} />}
      />
      <StatCard
        title="Pending Uploads"
        value={stats.pendingUploads?.toString() || '0'}
        subtitle="Photos to sync"
        icon={<Leaf size={24} />}
      />
    </div>
  );

  const renderInchargeStats = () => {
    const fuelPercentage = stats.totalExpenses > 0 
      ? ((stats.fuelExpenses / stats.totalExpenses) * 100).toFixed(0)
      : 0;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Expenses"
          value={`₹${stats.totalExpenses.toLocaleString('en-IN')}`}
          subtitle="This month"
          icon={<Receipt size={24} />}
        />
        <StatCard
          title="Fuel Expenses"
          value={`₹${stats.fuelExpenses.toLocaleString('en-IN')}`}
          subtitle={`${fuelPercentage}% of total`}
          icon={<Truck size={24} />}
        />
        <StatCard
          title="Pending Payments"
          value={`₹${stats.pendingPayments.toLocaleString('en-IN')}`}
          subtitle="Pending calculations"
          icon={<CreditCard size={24} />}
        />
        <StatCard
          title="Cleared Payments"
          value={`₹${stats.clearedPayments.toLocaleString('en-IN')}`}
          subtitle="This month"
          icon={<CreditCard size={24} />}
        />
      </div>
    );
  };

  const renderPlantStats = () => {
    const conversionRate = stats.processedBiomass > 0
      ? ((stats.biocharProduced / stats.processedBiomass) * 100).toFixed(1)
      : 0;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Processed Biomass"
          value={`${(stats.processedBiomass / 1000).toFixed(1)} T`}
          subtitle="This month"
          icon={<Factory size={24} />}
        />
        <StatCard
          title="Biochar Produced"
          value={`${(stats.biocharProduced / 1000).toFixed(1)} T`}
          subtitle={`Conversion rate: ${conversionRate}%`}
          icon={<Leaf size={24} />}
        />
        <StatCard
          title="Farmers Deployed"
          value={stats.farmersDeployed.toString()}
          subtitle="This month"
          icon={<Users size={24} />}
        />
        <StatCard
          title="Land Covered"
          value={`${stats.landCovered.toFixed(1)} Acres`}
          subtitle="Total deployment area"
          icon={<Weight size={24} />}
        />
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={`${getWelcomeMessage()}, ${user?.name}`}
        description="Here's an overview of your operations"
      />

      {user?.role === 'supervisor_stockpoint' && renderStockpointStats()}
      {user?.role === 'incharge' && renderInchargeStats()}
      {user?.role === 'supervisor_plant' && renderPlantStats()}

      {/* Recent Activity */}
      {user?.role === 'supervisor_stockpoint' && recentTrips.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">
                    Trip completed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vehicle {trip.vehicleNumber} • Net weight: {(trip.netWeight / 1000).toFixed(2)} T
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {trip.state && `State: ${trip.state}`}{trip.state && trip.district && ` • `}{trip.district && `District: ${trip.district}`}{trip.district && trip.village && ` • `}{trip.village && `Village: ${trip.village}`}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(trip.procurementDate || new Date(), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Procurement Records Table - Only for supervisor_stockpoint (works even without stockPointId) */}
      {user?.role === 'supervisor_stockpoint' && (
        <div className="mt-8">
          <FormCard 
            title={<span className="text-primary">Procurement Records</span>}
            description="List of all raw biomass procurement records"
            className="border-2 border-border/60 bg-card/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
            action={
              <div className="flex flex-row gap-2">
                {records.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportExcel}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadRecords}
                  disabled={loadingRecords}
                >
                  {loadingRecords ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            }
          >
            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-1">No records found</p>
                <p className="text-sm text-muted-foreground/70">Submit a procurement record to see it here</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/50 bg-background/50 rbp-table-wrapper flex flex-col">
                {/* Table scroll container */}
                <div className="overflow-x-auto" style={{maxHeight: '450px'}}>
                  <div>
                    <Table className="rbp-table" style={{width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
                      <TableHeader style={{position: 'sticky', top: 0, zIndex: 10}}>
                        <TableRow className="bg-primary hover:bg-primary">
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '100px'}}>Date</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '150px', textAlign: 'left'}}>Procurement ID</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '180px', textAlign: 'left'}}>Created By</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '110px', textAlign: 'left'}}>Source</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '110px', textAlign: 'left'}}>Vehicle Type</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '130px', textAlign: 'left'}}>Vehicle</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '120px', textAlign: 'left'}}>Name</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '120px', textAlign: 'left'}}>State</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '120px', textAlign: 'left'}}>District</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '120px', textAlign: 'left'}}>Village</TableHead>
                          <TableHead className="font-semibold text-white h-12 text-right" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '130px'}}>Gross Weight (kg)</TableHead>
                          <TableHead className="font-semibold text-white h-12 text-right" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '120px'}}>Net Weight (kg)</TableHead>
                          <TableHead className="font-semibold text-white h-12 text-center" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '100px'}}>Moisture (%)</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '250px', textAlign: 'center'}}>Photos</TableHead>
                          <TableHead className="font-semibold text-white h-12" style={{whiteSpace: 'nowrap', padding: '12px 8px', width: '180px', textAlign: 'left'}}>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRecords.map((record) => {
                          // Debug photo data
                          console.log('🖼️ Dashboard photo data for record:', record.id, {
                            vehiclePhoto: record.vehiclePhoto ? 'present' : 'missing',
                            weightRecordPhoto: record.weightRecordPhoto ? 'present' : 'missing',
                            vehiclePhoto_length: record.vehiclePhoto?.length || 0,
                            weightPhoto_length: record.weightRecordPhoto?.length || 0
                          });
                          
                          // Debug photo display conditions
                          console.log('🖼️ Photo display check:', record.id, {
                            hasVehiclePhoto: !!record.vehiclePhoto,
                            hasWeightPhoto: !!record.weightRecordPhoto,
                            vehiclePhotoStart: record.vehiclePhoto?.substring(0, 30),
                            weightPhotoStart: record.weightRecordPhoto?.substring(0, 30)
                          });
                          
                          return (
                          <TableRow
                            key={record.id}
                            className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <TableCell className="py-4 px-2 pb-5 text-sm font-medium" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '100px'}} data-label="Date">{format(record.procurementDate || new Date(), 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="py-4 px-2 text-sm" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '150px'}} data-label="Procurement ID">
                              <span className="font-mono text-xs text-primary font-medium">{record.procurementId || '-'}</span>
                            </TableCell>
                            <TableCell className="py-4 px-2 text-sm" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '180px'}} data-label="Created By">
                              <span className="text-xs font-medium text-foreground break-all">
                                {record.createdByEmail ? (
                                  <span className="text-primary">{record.createdByEmail}</span>
                                ) : (
                                  <span className="text-muted-foreground italic">N/A</span>
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-2 text-sm" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '110px'}} data-label="Source">
                              <span className="capitalize">{record.source === 'cotton_stalks' ? 'Cotton stalks' : record.source === 'chilli_stalks' ? 'Chilli stalks' : record.source}</span>
                            </TableCell>
                            <TableCell className="py-4 px-2 text-sm" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '110px'}} data-label="Vehicle Type">
                              <span className="capitalize">{record.vehicleType || <span className="text-muted-foreground italic">-</span>}</span>
                            </TableCell>
                            <TableCell className="py-4 px-2 text-sm font-medium" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '130px'}} data-label="Vehicle">{record.vehicleNumber}</TableCell>
                            <TableCell className="py-4 px-2 text-sm" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '120px'}} data-label="Name">{record.name || <span className="text-muted-foreground italic">-</span>}</TableCell>
                            <TableCell className="py-4 px-2 text-sm" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '120px'}} data-label="State">{record.state || <span className="text-muted-foreground italic">-</span>}</TableCell>
                            <TableCell className="py-4 px-2 text-sm" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '120px'}} data-label="District">{record.district || <span className="text-muted-foreground italic">-</span>}</TableCell>
                            <TableCell className="py-4 px-2 text-sm" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '120px'}} data-label="Village">{record.village || <span className="text-muted-foreground italic">-</span>}</TableCell>
                            <TableCell className="py-4 px-2 text-sm" style={{whiteSpace: 'nowrap', textAlign: 'right', width: '130px'}} data-label="Gross Weight (kg)">{(record.grossWeight || 0).toLocaleString()}</TableCell>
                            <TableCell className="py-4 px-2 text-sm font-semibold text-primary" style={{whiteSpace: 'nowrap', textAlign: 'right', width: '120px'}} data-label="Net Weight (kg)">{(record.netWeight || 0).toLocaleString()}</TableCell>
                            <TableCell className="py-4 px-2 text-sm text-center" style={{whiteSpace: 'nowrap', textAlign: 'center', width: '100px'}} data-label="Moisture (%)">
                              {record.moisture ? (
                                <span className="font-medium text-blue-600">{record.moisture}%</span>
                              ) : (
                                <span className="text-muted-foreground italic">-</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4 px-2" style={{whiteSpace: 'nowrap', textAlign: 'center', width: '250px'}} data-label="Photos">
                              <div className="flex flex-wrap gap-1 justify-start max-w-sm">
                                {/* Vehicle Photos (show all 4) */}
                                {record.vehiclePhotos?.map((photo, index) => (
                                  <button
                                    key={`vehicle-${index}`}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setPreviewImage({
                                        src: photo!,
                                        latitude: record.locationLatitude != null && !isNaN(Number(record.locationLatitude)) 
                                          ? Number(record.locationLatitude) 
                                          : undefined,
                                        longitude: record.locationLongitude != null && !isNaN(Number(record.locationLongitude)) 
                                          ? Number(record.locationLongitude) 
                                          : undefined,
                                        date: record.procurementDate,
                                        name: `${record.name} - Vehicle ${index + 1}`,
                                      });
                                      setPreviewDialogOpen(true);
                                    }}
                                    className="relative group touch-manipulation"
                                    aria-label={`View vehicle photo ${index + 1}`}
                                  >
                                    <div className="w-10 h-10 rounded border border-border overflow-hidden bg-muted flex items-center justify-center shadow-sm">
                                      {photo && (photo.startsWith('data:image') || photo.startsWith('http') || photo.startsWith('/')) ? (
                                        <img 
                                          src={photo} 
                                          alt={`Vehicle ${index + 1}`} 
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            const parent = (e.target as HTMLImageElement).parentElement;
                                            if (parent && !parent.querySelector('.image-error')) {
                                              const icon = document.createElement('div');
                                              icon.className = 'image-error';
                                              icon.innerHTML = '<svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                              parent.appendChild(icon);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 group-active:bg-black/30 transition-colors rounded flex items-center justify-center">
                                      <Eye className="h-3 w-3 text-white opacity-70 group-hover:opacity-100" />
                                    </div>
                                  </button>
                                ))}
                                {/* Weight Record Photo */}
                                {record.weightRecordPhoto && (
                                  <button
                                    key="weight"
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setPreviewImage({
                                        src: record.weightRecordPhoto!,
                                        latitude: record.locationLatitude != null && !isNaN(Number(record.locationLatitude)) 
                                          ? Number(record.locationLatitude) 
                                          : undefined,
                                        longitude: record.locationLongitude != null && !isNaN(Number(record.locationLongitude)) 
                                          ? Number(record.locationLongitude) 
                                          : undefined,
                                        date: record.procurementDate,
                                        name: `${record.name} - Weight Record`,
                                      });
                                      setPreviewDialogOpen(true);
                                    }}
                                    className="relative group touch-manipulation"
                                    aria-label="View weight record photo"
                                  >
                                    <div className="w-10 h-10 rounded border border-border overflow-hidden bg-muted flex items-center justify-center shadow-sm">
                                      {record.weightRecordPhoto && (record.weightRecordPhoto.startsWith('data:image') || record.weightRecordPhoto.startsWith('http') || record.weightRecordPhoto.startsWith('/')) ? (
                                        <img 
                                          src={record.weightRecordPhoto} 
                                          alt="Weight Record" 
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            const parent = (e.target as HTMLImageElement).parentElement;
                                            if (parent && !parent.querySelector('.image-error')) {
                                              const icon = document.createElement('div');
                                              icon.className = 'image-error';
                                              icon.innerHTML = '<svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
                                              parent.appendChild(icon);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <Camera className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 group-active:bg-black/30 transition-colors rounded flex items-center justify-center">
                                      <Eye className="h-3 w-3 text-white opacity-70 group-hover:opacity-100" />
                                    </div>
                                  </button>
                                )}
                                {/* Moisture Photo */}
                                {record.moisturePhoto && (
                                  <button
                                    key="moisture"
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setPreviewImage({
                                        src: record.moisturePhoto!,
                                        latitude: record.locationLatitude != null && !isNaN(Number(record.locationLatitude)) 
                                          ? Number(record.locationLatitude) 
                                          : undefined,
                                        longitude: record.locationLongitude != null && !isNaN(Number(record.locationLongitude)) 
                                          ? Number(record.locationLongitude) 
                                          : undefined,
                                        date: record.procurementDate,
                                        name: `${record.name} - Moisture`,
                                      });
                                      setPreviewDialogOpen(true);
                                    }}
                                    className="relative group touch-manipulation"
                                    aria-label="View moisture photo"
                                  >
                                    <div className="w-10 h-10 rounded border border-border overflow-hidden bg-muted flex items-center justify-center shadow-sm">
                                      {record.moisturePhoto && (record.moisturePhoto.startsWith('data:image') || record.moisturePhoto.startsWith('http') || record.moisturePhoto.startsWith('/')) ? (
                                        <img 
                                          src={record.moisturePhoto} 
                                          alt="Moisture" 
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            const parent = (e.target as HTMLImageElement).parentElement;
                                            if (parent && !parent.querySelector('.image-error')) {
                                              const icon = document.createElement('div');
                                              icon.className = 'image-error';
                                              icon.innerHTML = '<svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
                                              parent.appendChild(icon);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <Camera className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 group-active:bg-black/30 transition-colors rounded flex items-center justify-center">
                                      <Eye className="h-3 w-3 text-white opacity-70 group-hover:opacity-100" />
                                    </div>
                                  </button>
                                )}
                                {/* Photo count indicator */}
                                <div className="flex items-center text-xs text-muted-foreground px-1">
                                  {((record.vehiclePhotos?.length || 0) + (record.weightRecordPhoto ? 1 : 0) + (record.moisturePhoto ? 1 : 0))} photos
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-2" style={{whiteSpace: 'nowrap', textAlign: 'left', width: '180px'}} data-label="Location">
                              {record.locationLatitude != null && record.locationLongitude != null && !isNaN(Number(record.locationLatitude)) && !isNaN(Number(record.locationLongitude)) ? (
                                <button
                                  onClick={() => {
                                    window.open(
                                      `https://www.openstreetmap.org/?mlat=${Number(record.locationLatitude)}&mlon=${Number(record.locationLongitude)}&zoom=15`,
                                      '_blank'
                                    );
                                  }}
                                  className="text-xs font-mono text-primary hover:underline"
                                >
                                  {Number(record.locationLatitude).toFixed(6)}, {Number(record.locationLongitude).toFixed(6)}
                                </button>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 border-t border-border bg-card gap-2 sm:gap-0 flex-shrink-0" style={{marginTop: 0, marginBottom: 0}}>
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap order-2 sm:order-1">
                    Page <span className="font-semibold text-foreground">{page}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
                  </span>
                  <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newPage = Math.max(1, page - 1);
                        if (newPage >= 1 && newPage !== page) {
                          setPage(newPage);
                        }
                      }}
                      disabled={page <= 1 || records.length === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newPage = Math.min(totalPages, page + 1);
                        if (newPage <= totalPages && newPage !== page && newPage > page) {
                          setPage(newPage);
                        }
                      }}
                      disabled={page >= totalPages || records.length === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </FormCard>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewImage && previewImage.src ? (
            <div className="mt-4">
              <div className="max-h-[calc(90vh-100px)] overflow-auto">
                <PhotoWithMetadata
                  src={previewImage.src}
                  latitude={previewImage.latitude}
                  longitude={previewImage.longitude}
                  date={previewImage.date}
                  name={previewImage.name}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No image to display</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
