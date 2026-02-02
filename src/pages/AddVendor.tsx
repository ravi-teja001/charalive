import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormCard } from '@/components/shared/FormCard';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createVehicle, getVehicles, updateVehicle, deleteVehicle } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { swal } from '@/lib/swal';
import { format } from 'date-fns';
import { Truck, Plus, Edit, Trash2, Save, X, RefreshCw, FileSpreadsheet, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { statesData, getDistrictsByState, getVillagesByDistrict } from '@/data/locations';

export default function AddVendor() {
  const { user } = useAuth();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [weight, setWeight] = useState('');
  const [vehicleType, setVehicleType] = useState('Truck');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [state, setState] = useState('');
  
  // Get available districts and villages based on selections
  const availableDistricts = state ? getDistrictsByState(state) : [];
  const availableVillages = state && district ? getVillagesByDistrict(state, district) : [];
  
  // Remove duplicates from villages array (safety check)
  const uniqueVillages = [...new Set(availableVillages)];
  
  // Reset district, sub district and village when state changes
  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    setDistrict(''); // Reset district when state changes
    setSubDistrict(''); // Reset sub district when state changes
    setVillage(''); // Reset village when state changes
  };
  
  // Reset sub district and village when district changes
  const handleDistrictChange = (selectedDistrict: string) => {
    setDistrict(selectedDistrict);
    setSubDistrict(''); // Reset sub district when district changes
    setVillage(''); // Reset village when district changes
  };
  
  // Reset village when sub district changes
  const handleSubDistrictChange = (selectedSubDistrict: string) => {
    setSubDistrict(selectedSubDistrict);
    setVillage(''); // Reset village when sub district changes
  };
  
  // State declarations - must come before computed values
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  
  // Edit state - must be declared before computed values that use it
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editVehicleNumber, setEditVehicleNumber] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('Truck');
  const [editName, setEditName] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editSubDistrict, setEditSubDistrict] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editState, setEditState] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // Edit state handlers - must come after state declarations
  const handleEditStateChange = (selectedState: string) => {
    setEditState(selectedState);
    setEditDistrict(''); // Reset district when state changes
    setEditSubDistrict(''); // Reset sub district when state changes
    setEditVillage(''); // Reset village when state changes
  };
  
  const handleEditDistrictChange = (selectedDistrict: string) => {
    setEditDistrict(selectedDistrict);
    setEditSubDistrict(''); // Reset sub district when district changes
    setEditVillage(''); // Reset village when district changes
  };
  
  const handleEditSubDistrictChange = (selectedSubDistrict: string) => {
    setEditSubDistrict(selectedSubDistrict);
    setEditVillage(''); // Reset village when sub district changes
  };
  
  // Get available districts and villages for edit form - must come after state declarations
  const availableEditDistricts = editState ? getDistrictsByState(editState) : [];
  const availableEditVillages = editState && editDistrict ? getVillagesByDistrict(editState, editDistrict) : [];
  const uniqueEditVillages = [...new Set(availableEditVillages)];
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Initialize loading state
    if (user?.id) {
      loadVehicles();
    } else {
      // If no user, clear loading state immediately
      setLoadingVehicles(false);
    }
  }, [user]);

  const loadVehicles = async () => {
    if (!user?.id) {
      setLoadingVehicles(false);
      return;
    }
    
    try {
      setLoadingVehicles(true);
      console.log('🚗 Loading vehicles for user:', user.id);
      
      // Add retry logic with shorter timeout
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          const data = await Promise.race([
            getVehicles(user.id),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Vehicles loading timeout')), 5000)
            )
          ]) as any;
          
          console.log('✅ Vehicles loaded successfully:', data?.length || 0, 'vehicles');
          setVehicles(data || []);
          return;
        } catch (error: any) {
          retryCount++;
          console.warn(`⚠️ Vehicle loading attempt ${retryCount} failed:`, error.message);
          
          // Check if it's a CORS/network error - don't show user error for development
          if (error.message?.includes('CORS') || 
              error.message?.includes('Access-Control-Allow-Origin') ||
              error.message?.includes('Failed to fetch') ||
              error.message?.includes('timeout')) {
            console.warn('🔧 Development: CORS/Network error detected, using fallback');
            setVehicles([]);
            return; // Don't retry for CORS errors
          }
          
          if (retryCount <= maxRetries) {
            console.log(`🔄 Retrying vehicle loading (${retryCount}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading vehicles:', error);
      
      // Only show error to user if it's not a CORS/network error
      if (!error.message?.includes('CORS') && 
          !error.message?.includes('Access-Control-Allow-Origin') &&
          !error.message?.includes('Failed to fetch') &&
          !error.message?.includes('timeout')) {
        swal.error(`Error loading vehicles: ${error?.message || 'Unknown error'}`);
      }
      
      setVehicles([]); // Set empty array on error
    } finally {
      setLoadingVehicles(false);
      console.log('🏁 Vehicles loading process completed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleNumber.trim()) {
      swal.error('Please enter vehicle number');
      return;
    }

    if (!weight || parseFloat(weight) <= 0) {
      swal.error('Please enter a valid vehicle weight');
      return;
    }

    if (!state) {
      swal.error('Please select state');
      return;
    }

    if (!district) {
      swal.error('Please select district');
      return;
    }

    if (!subDistrict) {
      swal.error('Please select sub district');
      return;
    }

    if (!village) {
      swal.error('Please enter village');
      return;
    }

    if (!user?.id) {
      swal.error('You must be logged in to add vehicles');
      return;
    }

    try {
      setLoading(true);
      await createVehicle({
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        weight: parseFloat(weight),
        type: vehicleType as any, // Allow any vehicle type string
        name: name.trim() || undefined,
        district: district.trim() || undefined,
        subDistrict: subDistrict.trim() || undefined,
        village: village.trim() || undefined,
        state: state.trim() || undefined,
      }, user.id);

      swal.success('Vendor vehicle added successfully!');
      
      // Close dialog
      setAddDialogOpen(false);
      
      // Reset form
      setVehicleNumber('');
      setWeight('');
      setVehicleType('Truck');
      setName('');
      setDistrict('');
      setSubDistrict('');
      setVillage('');
      setState('');
      
      // Reload vehicles list
      await loadVehicles();
      // Trigger custom event so Raw Biomass Procurement page can reload vehicles
      window.dispatchEvent(new CustomEvent('vehicles-updated'));
    } catch (error: any) {
      console.error('Error adding vehicle:', error);
      if (error?.message?.includes('unique') || error?.message?.includes('duplicate')) {
        swal.error('This vehicle number already exists. Please use a different number.');
      } else {
        swal.error(`Error adding vehicle: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setEditVehicleNumber(vehicle.vehicleNumber || '');
    const typeFromApi = (vehicle.type || 'truck').toString().toLowerCase();
    const displayType = typeFromApi.charAt(0).toUpperCase() + typeFromApi.slice(1);
    setEditVehicleType(['Truck', 'Trailer', 'Tempo', 'Auto', 'Tractor', 'Registered', 'Other'].includes(displayType) ? displayType : 'Other');
    setEditName(vehicle.name || '');
    setEditState(vehicle.state || '');
    setEditDistrict(vehicle.district || '');
    setEditSubDistrict(vehicle.subDistrict || '');
    setEditVillage(vehicle.village || '');
    setEditDialogOpen(true);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingVehicle(null);
    setEditVehicleNumber('');
    setEditWeight('');
    setEditVehicleType('Truck');
    setEditName('');
    setEditState('');
    setEditDistrict('');
    setEditSubDistrict('');
    setEditVillage('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVehicle || !user?.id) {
      return;
    }

    if (!editVehicleNumber.trim()) {
      swal.error('Please enter vehicle number');
      return;
    }

    if (!editWeight || parseFloat(editWeight) <= 0) {
      swal.error('Please enter a valid vehicle weight');
      return;
    }

    if (!editState) {
      swal.error('Please select state');
      return;
    }

    if (!editDistrict) {
      swal.error('Please select district');
      return;
    }

    if (!editSubDistrict) {
      swal.error('Please select sub district');
      return;
    }

    if (!editVillage) {
      swal.error('Please enter village');
      return;
    }

    try {
      setEditLoading(true);
      await updateVehicle(
        editingVehicle.id,
        {
          vehicleNumber: editVehicleNumber.trim().toUpperCase(),
          weight: parseFloat(editWeight),
          type: editVehicleType as any,
          name: editName.trim() || undefined,
          district: editDistrict.trim() || undefined,
          subDistrict: editSubDistrict.trim() || undefined,
          village: editVillage.trim() || undefined,
          state: editState.trim() || undefined,
        },
        user.id
      );

      swal.success('Vehicle updated successfully!');
      handleEditCancel();
      // Reload vehicles to show updated data
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for DB to commit
      await loadVehicles();
      // Trigger storage event so other pages can reload vehicles
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      if (error?.message?.includes('unique') || error?.message?.includes('duplicate')) {
        swal.error('This vehicle number already exists. Please use a different number.');
      } else {
        swal.error(`Error updating vehicle: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (vehicle: any) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete || !user?.id) {
      return;
    }

    try {
      setDeleteLoading(true);
      await deleteVehicle(vehicleToDelete.id, user.id);
      swal.success('Vehicle deleted successfully!');
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
      // Reload vehicles to show updated list
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for DB to commit
      await loadVehicles();
      // Trigger storage event so other pages can reload vehicles
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      swal.error(`Error deleting vehicle: ${error?.message || 'Unknown error'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(vehicles.length / recordsPerPage));
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedVehicles = vehicles.slice(startIndex, endIndex);

  // Export to Excel function
  const handleExportToExcel = () => {
    try {
      const excelData = vehicles.map((vehicle) => ({
        'Vehicle Number': vehicle.vehicleNumber || '',
        'Name': vehicle.name || '',
        'State': vehicle.state || '',
        'District': vehicle.district || '',
        'Sub District': vehicle.subDistrict || '',
        'Village': vehicle.village || '',
        'Weight (kg)': vehicle.weight || 0,
        'Type': vehicle.type || '',
        'Added Date': vehicle.created_at ? format(new Date(vehicle.created_at), 'dd MMM yyyy') : '',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 18 }, // Vehicle Number
        { wch: 20 }, // Name
        { wch: 15 }, // State
        { wch: 18 }, // District
        { wch: 18 }, // Sub District
        { wch: 18 }, // Village
        { wch: 12 }, // Weight
        { wch: 12 }, // Type
        { wch: 15 }, // Added Date
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');
      XLSX.writeFile(wb, `vehicles_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      swal.success('Vehicles exported to Excel successfully!');
    } catch (error: any) {
      console.error('Error exporting to Excel:', error);
      swal.error(`Error exporting to Excel: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden">
        <PageHeader
          title="Add Vendor Vehicle"
          description="Register new vendor vehicles for biomass procurement"
        />

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Vehicles List */}
          <FormCard 
          title=""
          className="border-2 border-border/60 bg-card/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col p-4 lg:p-6"
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header with Title on Left and Actions on Right */}
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
              <div className="flex-1">
                <h2 className="font-display text-xl font-semibold text-primary">
                  Registered Vehicles
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">List of all registered vendor vehicles</p>
              </div>
              <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setAddDialogOpen(true)}
                    className="h-11 w-11 p-0 rounded-full bg-primary hover:bg-primary/90"
                    title="Add Vehicle"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={loadVehicles}
                    disabled={loadingVehicles}
                    className="h-11 w-11 p-0 rounded-full bg-primary hover:bg-primary/90"
                    title="Refresh"
                  >
                    <RefreshCw className={`h-5 w-5 ${loadingVehicles ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleExportToExcel}
                    disabled={vehicles.length === 0}
                    className="h-11 w-11 p-0 rounded-full bg-primary hover:bg-primary/90 text-white"
                    title="Export to Excel"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                  </Button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {loadingVehicles ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-3 animate-pulse">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">Loading vehicles...</p>
              <p className="text-xs text-muted-foreground/70 mt-1">This may take a few seconds</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                <Truck className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">
                No vehicles registered yet
              </p>
              <p className="text-sm text-muted-foreground/70">
                Add your first vehicle above to get started
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto min-h-0 rounded-lg border border-border/50 bg-background/50">
                <Table className="relative">
                  <TableHeader className="sticky top-0 z-20 bg-background/50">
                    <TableRow className="bg-primary hover:bg-primary border-b-2 border-primary/20">
                      <TableHead className="font-semibold text-white h-10 py-2 whitespace-nowrap bg-primary">Actions</TableHead>
                      <TableHead className="font-semibold text-white h-10 py-2 whitespace-nowrap bg-primary">Vehicle Number</TableHead>
                      <TableHead className="font-semibold text-white h-10 py-2 whitespace-nowrap bg-primary">Name</TableHead>
                      <TableHead className="font-semibold text-white h-10 py-2 whitespace-nowrap bg-primary">State</TableHead>
                      <TableHead className="font-semibold text-white h-10 py-2 whitespace-nowrap bg-primary">District</TableHead>
                      <TableHead className="font-semibold text-white h-10 py-2 whitespace-nowrap bg-primary">Sub District</TableHead>
                      <TableHead className="font-semibold text-white h-10 py-2 whitespace-nowrap bg-primary">Village</TableHead>
                      <TableHead className="font-semibold text-white h-10 py-2 text-right whitespace-nowrap bg-primary">Weight (kg)</TableHead>
                      <TableHead className="font-semibold text-white h-10 py-2 whitespace-nowrap bg-primary">Type</TableHead>
                      <TableHead className="font-semibold text-white h-10 py-2 whitespace-nowrap bg-primary">Added Date</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {paginatedVehicles.map((vehicle, index) => (
                        <TableRow 
                          key={vehicle.id}
                          className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${
                            index % 2 === 0 ? 'bg-background/30' : 'bg-background/50'
                          }`}
                        >
                          <TableCell className="py-2 whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-muted"
                                    title="Actions"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditClick(vehicle)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(vehicle)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Truck className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="font-semibold">{vehicle.vehicleNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 whitespace-nowrap">{vehicle.name || <span className="text-muted-foreground italic">-</span>}</TableCell>
                          <TableCell className="py-2 whitespace-nowrap">{vehicle.state || <span className="text-muted-foreground italic">-</span>}</TableCell>
                          <TableCell className="py-2 whitespace-nowrap">{vehicle.district || <span className="text-muted-foreground italic">-</span>}</TableCell>
                          <TableCell className="py-2 whitespace-nowrap">{vehicle.subDistrict || <span className="text-muted-foreground italic">-</span>}</TableCell>
                          <TableCell className="py-2 whitespace-nowrap">{vehicle.village || <span className="text-muted-foreground italic">-</span>}</TableCell>
                          <TableCell className="py-2 text-right font-medium whitespace-nowrap">
                            {vehicle.weight ? (
                              <span className="text-foreground">{vehicle.weight.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-muted-foreground italic">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/15 text-primary border border-primary/20 capitalize shadow-sm">
                              {vehicle.type}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 whitespace-nowrap">
                            {(vehicle as any).created_at ? (
                              <span className="text-sm text-foreground">
                                {format(new Date((vehicle as any).created_at), 'dd MMM yyyy')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </div>

              {/* Pagination Controls - Fixed at Bottom */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Records per page:</span>
                  <Select value={recordsPerPage.toString()} onValueChange={(value) => {
                    setRecordsPerPage(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="h-9 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                    {startIndex + 1}-{Math.min(endIndex, vehicles.length)} of {vehicles.length}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
            </div>
          </div>
        </FormCard>
        </div>
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setAddDialogOpen(false);
          setVehicleNumber('');
          setWeight('');
          setVehicleType('Truck');
          setName('');
          setDistrict('');
          setSubDistrict('');
          setVillage('');
          setState('');
        } else {
          setAddDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
            <DialogDescription>
              Enter vehicle information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="dialog-vehicle-number">Vehicle Number <span className="text-destructive">*</span></Label>
                <Input
                    id="dialog-vehicle-number"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., TS09AB1234"
                    className="h-11"
                  disabled={loading}
                    required
                />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="dialog-vehicle-type">Vehicle Type <span className="text-destructive">*</span></Label>
                  <Select value={vehicleType} onValueChange={setVehicleType} disabled={loading}>
                    <SelectTrigger id="dialog-vehicle-type" className="h-11">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Trailer">Trailer</SelectItem>
                    <SelectItem value="Tempo">Tempo</SelectItem>
                    <SelectItem value="Auto">Auto</SelectItem>
                    <SelectItem value="Tractor">Tractor</SelectItem>
                    <SelectItem value="Registered">Registered</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="dialog-weight">Vehicle Weight (kg) <span className="text-destructive">*</span></Label>
                  <Input
                    id="dialog-weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 2500"
                    className="h-11"
                    min="0"
                    step="0.01"
                    disabled={loading}
                    required
                  />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="dialog-name">Name</Label>
                  <Input
                    id="dialog-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Owner/Driver name"
                    className="h-11"
                    disabled={loading}
                  />
              </div>
              </div>

              {/* Right Column - Location Fields */}
              <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="dialog-state">State <span className="text-destructive">*</span></Label>
                <Select value={state} onValueChange={handleStateChange} disabled={loading}>
                    <SelectTrigger id="dialog-state" className="h-11">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {statesData.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="dialog-district">District <span className="text-destructive">*</span></Label>
                <Select 
                  value={district} 
                  onValueChange={handleDistrictChange} 
                  disabled={loading || !state}
                >
                    <SelectTrigger id="dialog-district" className="h-11">
                    <SelectValue placeholder={state ? "Select district" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                    <Label htmlFor="dialog-subDistrict">Sub District <span className="text-destructive">*</span></Label>
                    <Select 
                      value={subDistrict} 
                      onValueChange={handleSubDistrictChange} 
                      disabled={loading || !district || !state}
                    >
                      <SelectTrigger id="dialog-subDistrict" className="h-11">
                        <SelectValue placeholder={district ? "Select sub district" : "Select district first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueVillages.map((v, index) => (
                          <SelectItem key={`${v}-${index}`} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

              <div className="space-y-2">
                    <Label htmlFor="dialog-village">Village <span className="text-destructive">*</span></Label>
                    <Input
                      id="dialog-village"
                  value={village} 
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g., Enter village name"
                      className="h-11"
                  disabled={loading || !district || !state}
                    />
                  </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false);
                  setVehicleNumber('');
                  setWeight('');
                  setVehicleType('Truck');
                  setName('');
                  setDistrict('');
                  setSubDistrict('');
                  setVillage('');
                  setState('');
                }}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  'Adding...'
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vehicle
                  </>
                )}
                          </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={editDialogOpen && !!editingVehicle} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update vehicle information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-vehicle-number">Vehicle Number <span className="text-destructive">*</span></Label>
                <Input
                  id="edit-vehicle-number"
                  value={editVehicleNumber}
                  onChange={(e) => setEditVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., TS09AB1234"
                  className="h-11"
                  disabled={editLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-weight">Vehicle Weight (kg) <span className="text-destructive">*</span></Label>
                <Input
                  id="edit-weight"
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  placeholder="e.g., 2500"
                  className="h-11"
                  min="0"
                  step="0.01"
                  disabled={editLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-vehicle-type">Vehicle Type <span className="text-destructive">*</span></Label>
                <Select value={editVehicleType} onValueChange={setEditVehicleType} disabled={editLoading}>
                  <SelectTrigger id="edit-vehicle-type" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Trailer">Trailer</SelectItem>
                    <SelectItem value="Tempo">Tempo</SelectItem>
                    <SelectItem value="Auto">Auto</SelectItem>
                    <SelectItem value="Tractor">Tractor</SelectItem>
                    <SelectItem value="Registered">Registered</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Owner/Driver name"
                  className="h-11"
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-state">State <span className="text-destructive">*</span></Label>
                <Select value={editState} onValueChange={handleEditStateChange} disabled={editLoading}>
                  <SelectTrigger id="edit-state" className="h-11">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {statesData.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-district">District <span className="text-destructive">*</span></Label>
                <Select 
                  value={editDistrict} 
                  onValueChange={handleEditDistrictChange} 
                  disabled={editLoading || !editState}
                >
                  <SelectTrigger id="edit-district" className="h-11">
                    <SelectValue placeholder={editState ? "Select district" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEditDistricts.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-subDistrict">Sub District <span className="text-destructive">*</span></Label>
                <Select 
                    value={editSubDistrict} 
                    onValueChange={handleEditSubDistrictChange} 
                  disabled={editLoading || !editDistrict || !editState}
                >
                    <SelectTrigger id="edit-subDistrict" className="h-11">
                      <SelectValue placeholder={editDistrict ? "Select sub district" : "Select district first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueEditVillages.map((v, index) => (
                      <SelectItem key={`${v}-${index}`} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-village">Village <span className="text-destructive">*</span></Label>
                  <Input
                    id="edit-village"
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                    placeholder="e.g., Enter village name"
                    className="h-11"
                    disabled={editLoading || !editDistrict || !editState}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleEditCancel}
                disabled={editLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? (
                  'Updating...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Vehicle
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete vehicle <strong>{vehicleToDelete?.vehicleNumber}</strong>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setVehicleToDelete(null);
              }}
              disabled={deleteLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                'Deleting...'
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
