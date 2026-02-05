import { supabase } from '@/lib/supabase';
import { environment } from '@/lib/environment';
import { apiFetch } from '@/lib/apiClient';
import type {
  RawBiomassProcurement,
  Expense,
  ProcessedBiomassProcurement,
  BiocharDeployment,
  StockPoint,
  Plant,
  Vehicle,
} from '@/types/biochar';

const useRailway = environment.useRailway;

// Stock Points
export async function getStockPoints(): Promise<StockPoint[]> {
  if (useRailway) {
    const data = await apiFetch<StockPoint[]>('/api/stock-points');
    return Array.isArray(data) ? data : [];
  }
  const { data, error } = await supabase
    .from('stock_points')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

// Plants
export async function getPlants(): Promise<Plant[]> {
  if (useRailway) {
    const data = await apiFetch<Plant[]>('/api/plants');
    return Array.isArray(data) ? data : [];
  }
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

// Vehicles
export async function getVehicles(userId?: string): Promise<(Vehicle & { created_at?: string })[]> {
  if (useRailway) {
    const data = await apiFetch<any[]>('/api/vehicles');
    return (data || []).map((item) => ({
      id: item.id,
      vehicleNumber: item.vehicleNumber,
      weight: parseFloat(item.weight) || 0,
      type: item.type,
      name: item.name,
      district: item.district,
      subDistrict: item.subDistrict,
      village: item.village,
      state: item.state,
      created_at: item.created_at,
    }));
  }
  // Check if using placeholder credentials (development mode)
  if (environment.supabaseUrl.includes('placeholder')) {
    console.log('🧪 Development mode: Using localStorage for vehicles');
    
    // Get vehicles from localStorage
    const vehicles = JSON.parse(localStorage.getItem('devVehicles') || '[]');
    
    // Filter by user ID if provided
    if (userId) {
      const userVehicles = vehicles.filter((v: any) => v.created_by === userId);
      console.log('✅ Vehicles loaded from localStorage:', userVehicles.length, 'vehicles for user:', userId);
      return userVehicles.map((item: any) => ({
        id: item.id,
        vehicleNumber: item.vehicle_number,
        weight: parseFloat(item.weight_kg) || 0,
        type: item.vehicle_type,
        name: item.name || undefined,
        district: item.district || undefined,
        subDistrict: item.sub_district || undefined,
        village: item.village || undefined,
        state: item.state || undefined,
        created_at: item.created_at,
      }));
    }
    
    console.log('✅ All vehicles loaded from localStorage:', vehicles.length, 'vehicles');
    return vehicles.map((item: any) => ({
      id: item.id,
      vehicleNumber: item.vehicle_number,
      weight: parseFloat(item.weight_kg) || 0,
      type: item.vehicle_type,
      name: item.name || undefined,
      district: item.district || undefined,
      subDistrict: item.sub_district || undefined,
      village: item.village || undefined,
      state: item.state || undefined,
      created_at: item.created_at,
    }));
  }

  // MOCK DATA FALLBACK FOR DEVELOPMENT
  if (userId === 'mock-user-id') {
    console.log('🧪 Using mock vehicle data for mock-user-id');
    const mockVehicles = [
      {
        id: 'mock-vehicle-1',
        vehicleNumber: 'TS-08-AB-1234',
        weight: 1500,
        type: 'tractor',
        name: 'John Deere Tractor',
        district: 'Hyderabad',
        subDistrict: 'Serilingampally',
        village: 'Gachibowli',
        state: 'Telangana',
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-vehicle-2',
        vehicleNumber: 'TS-09-XY-5678',
        weight: 2000,
        type: 'truck',
        name: 'Tata Truck',
        district: 'Ranga Reddy',
        subDistrict: 'Madhapur',
        village: 'Hitech City',
        state: 'Telangana',
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-vehicle-3',
        vehicleNumber: 'TS-07-ZZ-9999',
        weight: 1200,
        type: 'tractor',
        name: 'Mahindra Tractor',
        district: 'Medchal',
        subDistrict: 'Kukatpally',
        village: 'KPHB',
        state: 'Telangana',
        created_at: new Date().toISOString()
      }
    ];
    return mockVehicles;
  }

  try {
    let query = supabase
      .from('vehicles')
      .select('*')
      .order('vehicle_number');

    // Filter by user ID if provided - users only see their own vehicles
    // RLS policies also enforce this, but filtering here helps with clarity
    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;

    if (error) {
      // Handle CORS and network errors gracefully
      if (error.message?.includes('CORS') || 
          error.message?.includes('Access-Control-Allow-Origin') ||
          error.message?.includes('Failed to fetch') ||
          error.name === 'AbortError' ||
          error.message?.includes('signal is aborted')) {
        console.warn('⚠️ Network/CORS error while loading vehicles - using fallback');
        // Return empty array instead of throwing error for development
        return [];
      }
      throw error;
    }
    
    console.log('✅ Vehicles loaded from database:', data?.length || 0, 'vehicles');
    return (data || []).map((item) => ({
      id: item.id,
      vehicleNumber: item.vehicle_number,
      weight: parseFloat(item.weight_kg) || 0,
      type: item.vehicle_type,
      name: item.name || undefined,
      district: item.district || undefined,
      subDistrict: item.sub_district || undefined,
      village: item.village || undefined,
      state: item.state || undefined,
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error('❌ Error in getVehicles:', error);
    
    // For development, return empty array instead of crashing
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Development mode: Returning empty vehicles array to prevent crashes');
      return [];
    }
    
    throw error;
  }
}

export async function createVehicle(
  vehicle: Omit<Vehicle, 'id'>,
  userId: string
): Promise<Vehicle> {
  if (useRailway) {
    const data = await apiFetch<any>('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify({
        vehicleNumber: vehicle.vehicleNumber,
        weight: vehicle.weight,
        type: vehicle.type,
        name: vehicle.name,
        district: vehicle.district,
        subDistrict: vehicle.subDistrict,
        village: vehicle.village,
        state: vehicle.state,
      }),
    });
    return {
      id: data.id,
      vehicleNumber: data.vehicleNumber,
      weight: parseFloat(data.weight) || 0,
      type: data.type,
      name: data.name,
      district: data.district,
      subDistrict: data.subDistrict,
      village: data.village,
      state: data.state,
    };
  }
  // Check if using placeholder credentials (development mode)
  if (environment.supabaseUrl.includes('placeholder')) {
    console.log('🧪 Development mode: Creating vehicle in localStorage');
    
    // Get existing vehicles
    const vehicles = JSON.parse(localStorage.getItem('devVehicles') || '[]');
    
    // Create new vehicle
    const newVehicle = {
      id: 'dev-vehicle-' + Date.now(),
      vehicle_number: vehicle.vehicleNumber,
      weight_kg: vehicle.weight.toString(),
      vehicle_type: vehicle.type,
      name: vehicle.name || null,
      district: vehicle.district || null,
      sub_district: vehicle.subDistrict || null,
      village: vehicle.village || null,
      state: vehicle.state || null,
      created_by: userId,
      created_at: new Date().toISOString(),
    };
    
    // Add to localStorage
    vehicles.push(newVehicle);
    localStorage.setItem('devVehicles', JSON.stringify(vehicles));
    
    console.log('✅ Vehicle created in localStorage:', newVehicle);
    
    return {
      id: newVehicle.id,
      vehicleNumber: newVehicle.vehicle_number,
      weight: parseFloat(newVehicle.weight_kg) || 0,
      type: newVehicle.vehicle_type,
      name: newVehicle.name || undefined,
      district: newVehicle.district || undefined,
      subDistrict: newVehicle.sub_district || undefined,
      village: newVehicle.village || undefined,
      state: newVehicle.state || undefined,
    };
  }

  // Production: Create vehicle in Supabase
  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      vehicle_number: vehicle.vehicleNumber,
      weight_kg: vehicle.weight,
      vehicle_type: vehicle.type,
      name: vehicle.name || null,
      district: vehicle.district || null,
      sub_district: vehicle.subDistrict || null,
      village: vehicle.village || null,
      state: vehicle.state || null,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    vehicleNumber: data.vehicle_number,
    weight: parseFloat(data.weight_kg) || 0,
    type: data.vehicle_type,
    name: data.name || undefined,
    district: data.district || undefined,
    village: data.village || undefined,
    state: data.state || undefined,
  };
}

export async function updateVehicle(
  vehicleId: string,
  vehicle: Partial<Omit<Vehicle, 'id'>>,
  userId: string
): Promise<Vehicle> {
  console.log('🔄 Updating vehicle:', { vehicleId, userId });
  if (useRailway) {
    const data = await apiFetch<any>(`/api/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify({
        vehicleNumber: vehicle.vehicleNumber,
        weight: vehicle.weight,
        type: vehicle.type,
        name: vehicle.name,
        district: vehicle.district,
        subDistrict: vehicle.subDistrict,
        village: vehicle.village,
        state: vehicle.state,
      }),
    });
    return {
      id: data.id,
      vehicleNumber: data.vehicleNumber,
      weight: parseFloat(data.weight) || 0,
      type: data.type,
      name: data.name,
      district: data.district,
      subDistrict: data.subDistrict,
      village: data.village,
      state: data.state,
    };
  }
  // Check if using placeholder credentials (development mode)
  if (environment.supabaseUrl.includes('placeholder')) {
    console.log('🧪 Development mode: Updating vehicle in localStorage');
    
    // Get existing vehicles
    const vehicles = JSON.parse(localStorage.getItem('devVehicles') || '[]');
    
    // Find the vehicle
    const vehicleIndex = vehicles.findIndex((v: any) => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
      throw new Error('Vehicle not found');
    }
    
    // Check permission
    if (vehicles[vehicleIndex].created_by !== userId) {
      throw new Error('You do not have permission to update this vehicle');
    }
    
    // Update vehicle
    const updatedVehicle = {
      ...vehicles[vehicleIndex],
      vehicle_number: vehicle.vehicleNumber !== undefined ? vehicle.vehicleNumber : vehicles[vehicleIndex].vehicle_number,
      weight_kg: vehicle.weight !== undefined ? vehicle.weight.toString() : vehicles[vehicleIndex].weight_kg,
      vehicle_type: vehicle.type !== undefined ? vehicle.type : vehicles[vehicleIndex].vehicle_type,
      name: vehicle.name !== undefined ? vehicle.name : vehicles[vehicleIndex].name,
      district: vehicle.district !== undefined ? vehicle.district : vehicles[vehicleIndex].district,
      sub_district: vehicle.subDistrict !== undefined ? vehicle.subDistrict : vehicles[vehicleIndex].sub_district,
      village: vehicle.village !== undefined ? vehicle.village : vehicles[vehicleIndex].village,
      state: vehicle.state !== undefined ? vehicle.state : vehicles[vehicleIndex].state,
    };
    
    // Save to localStorage
    vehicles[vehicleIndex] = updatedVehicle;
    localStorage.setItem('devVehicles', JSON.stringify(vehicles));
    
    console.log('✅ Vehicle updated in localStorage:', updatedVehicle);
    
    return {
      id: updatedVehicle.id,
      vehicleNumber: updatedVehicle.vehicle_number,
      weight: parseFloat(updatedVehicle.weight_kg) || 0,
      type: updatedVehicle.vehicle_type,
      name: updatedVehicle.name || undefined,
      district: updatedVehicle.district || undefined,
      subDistrict: updatedVehicle.sub_district || undefined,
      village: updatedVehicle.village || undefined,
      state: updatedVehicle.state || undefined,
    };
  }

  // Production: Update vehicle in Supabase
  // First, verify the vehicle exists and belongs to the user
  const { data: existingVehicle, error: checkError } = await supabase
    .from('vehicles')
    .select('id, created_by')
    .eq('id', vehicleId)
    .single();

  if (checkError || !existingVehicle) {
    console.error('❌ Vehicle not found:', checkError);
    throw new Error('Vehicle not found');
  }

  if (existingVehicle.created_by !== userId) {
    console.error('❌ Permission denied:', { 
      vehicleCreatedBy: existingVehicle.created_by, 
      currentUserId: userId 
    });
    throw new Error('You do not have permission to update this vehicle');
  }

  const updateData: any = {};
  
  if (vehicle.vehicleNumber !== undefined) {
    updateData.vehicle_number = vehicle.vehicleNumber;
  }
  if (vehicle.weight !== undefined) {
    updateData.weight_kg = vehicle.weight;
  }
  if (vehicle.type !== undefined) {
    updateData.vehicle_type = vehicle.type;
  }
  if (vehicle.name !== undefined) {
    updateData.name = vehicle.name || null;
  }
  if (vehicle.district !== undefined) {
    updateData.district = vehicle.district || null;
  }
  if (vehicle.subDistrict !== undefined) {
    updateData.sub_district = vehicle.subDistrict || null;
  }
  if (vehicle.village !== undefined) {
    updateData.village = vehicle.village || null;
  }
  if (vehicle.state !== undefined) {
    updateData.state = vehicle.state || null;
  }

  console.log('📝 Update data:', updateData);
  console.log('📋 Original vehicle data:', existingVehicle);

  // Perform the update (without created_by check since we already verified ownership)
  const { error: updateError } = await supabase
    .from('vehicles')
    .update(updateData)
    .eq('id', vehicleId);

  if (updateError) {
    console.error('❌ Update error:', updateError);
    throw updateError;
  }

  console.log('✅ Update query executed without errors');

  // Wait a bit for DB to commit (small delay for eventual consistency)
  await new Promise(resolve => setTimeout(resolve, 300));

  // Fetch the updated vehicle separately to verify the update
  const { data: updatedVehicle, error: fetchError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .single();

  if (fetchError) {
    console.error('❌ Error fetching updated vehicle:', fetchError);
    throw new Error(`Update executed but could not verify changes: ${fetchError.message}`);
  }

  if (!updatedVehicle) {
    throw new Error('Vehicle not found after update');
  }

  // Verify that the data actually changed
  let hasChanges = false;
  if (updateData.vehicle_number !== undefined && updatedVehicle.vehicle_number !== updateData.vehicle_number) {
    console.warn('⚠️ vehicle_number not updated:', { expected: updateData.vehicle_number, actual: updatedVehicle.vehicle_number });
  } else if (updateData.vehicle_number !== undefined) {
    hasChanges = true;
  }
  
  if (updateData.weight_kg !== undefined) {
    const expectedWeight = parseFloat(updateData.weight_kg);
    const actualWeight = parseFloat(updatedVehicle.weight_kg);
    if (Math.abs(expectedWeight - actualWeight) > 0.01) {
      console.warn('⚠️ weight not updated:', { expected: expectedWeight, actual: actualWeight });
    } else {
      hasChanges = true;
    }
  }

  console.log('✅ Vehicle updated and verified successfully', { hasChanges });

  // Use the fetched data
  const data = updatedVehicle;
  
  return {
    id: data.id,
    vehicleNumber: data.vehicle_number,
    weight: parseFloat(data.weight_kg) || 0,
    type: data.vehicle_type,
    name: data.name || undefined,
    district: data.district || undefined,
    subDistrict: data.sub_district || undefined,
    village: data.village || undefined,
    state: data.state || undefined,
  };
}

export async function deleteVehicle(
  vehicleId: string,
  userId: string
): Promise<void> {
  console.log('🗑️ Deleting vehicle:', { vehicleId, userId });
  if (useRailway) {
    await apiFetch(`/api/vehicles/${vehicleId}`, { method: 'DELETE' });
    return;
  }
  // Check if using placeholder credentials (development mode)
  if (environment.supabaseUrl.includes('placeholder')) {
    console.log('🧪 Development mode: Deleting vehicle from localStorage');
    
    // Get existing vehicles
    const vehicles = JSON.parse(localStorage.getItem('devVehicles') || '[]');
    
    // Find the vehicle
    const vehicleIndex = vehicles.findIndex((v: any) => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
      throw new Error('Vehicle not found');
    }
    
    // Check permission
    if (vehicles[vehicleIndex].created_by !== userId) {
      throw new Error('You do not have permission to delete this vehicle');
    }
    
    // Remove vehicle
    vehicles.splice(vehicleIndex, 1);
    localStorage.setItem('devVehicles', JSON.stringify(vehicles));
    
    console.log('✅ Vehicle deleted from localStorage');
    return;
  }

  // Production: Delete vehicle from Supabase
  // First check if vehicle exists and belongs to user
  const { data: existingVehicle, error: checkError } = await supabase
    .from('vehicles')
    .select('id, created_by')
    .eq('id', vehicleId)
    .single();

  if (checkError || !existingVehicle) {
    console.error('❌ Vehicle not found:', checkError);
    throw new Error('Vehicle not found');
  }

  if (existingVehicle.created_by !== userId) {
    console.error('❌ Permission denied:', { 
      vehicleCreatedBy: existingVehicle.created_by, 
      currentUserId: userId 
    });
    throw new Error('You do not have permission to delete this vehicle');
  }

  // Now delete (without created_by check since we already verified ownership)
  // Delete operations don't need .select() - we can verify deletion by trying to fetch it after
  const { error: deleteError } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId);

  if (deleteError) {
    console.error('❌ Delete error:', deleteError);
    throw deleteError;
  }

  // Verify deletion by trying to fetch the vehicle (should return nothing)
  const { data: verifyVehicle, error: verifyError } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', vehicleId)
    .maybeSingle(); // Use maybeSingle() since it should return null if deleted

  // If verifyError exists but it's not a "not found" error, there might be an issue
  if (verifyError && verifyError.code !== 'PGRST116') {
    console.warn('⚠️ Verification error (but delete may have succeeded):', verifyError);
  }

  // If vehicle still exists, deletion might have failed
  if (verifyVehicle) {
    console.error('❌ Vehicle still exists after delete attempt');
    throw new Error('Vehicle could not be deleted. Please try again.');
  }

  console.log('✅ Vehicle deleted successfully');
}

// Raw Biomass Procurement
// Function to update old local records with correct email
export function updateOldLocalRecordsEmail() {
  try {
    const mockUserStr = localStorage.getItem('mockUser');
    if (!mockUserStr) return;
    
    const mockUser = JSON.parse(mockUserStr);
    const correctEmail = mockUser.email;
    
    // Get existing local records
    const existingRecords = JSON.parse(localStorage.getItem('localProcurementRecords') || '[]');
    
    // Update records that have mock-user@example.com or mock-user-id
    let updatedCount = 0;
    const updatedRecords = existingRecords.map((record: any) => {
      if (record.createdBy === 'mock-user@example.com' || record.createdBy === 'mock-user-id') {
        updatedCount++;
        return { ...record, createdBy: correctEmail };
      }
      return record;
    });
    
    if (updatedCount > 0) {
      localStorage.setItem('localProcurementRecords', JSON.stringify(updatedRecords));
      console.log(`✅ Updated ${updatedCount} old local records with correct email: ${correctEmail}`);
    }
  } catch (error) {
    console.warn('Could not update old local records:', error);
  }
}

// Function to sync local records to database when connection is restored
export async function syncLocalRecordsToDatabase() {
  try {
    const localRecords = JSON.parse(localStorage.getItem('localProcurementRecords') || '[]');
    const recordsToSync = localRecords.filter((record: any) => record.savedLocally);

    if (recordsToSync.length === 0) {
      console.log('📱 No local records to sync');
      return;
    }

    console.log(`🔄 Attempting to sync ${recordsToSync.length} local records to database...`);

    let syncedCount = 0;
    let failedCount = 0;

    for (const record of recordsToSync) {
      try {
        if (useRailway) {
          await createRawBiomassProcurement({
            stockPointId: record.stockPointId,
            source: record.source || 'cotton_stalks',
            vehicleNumber: record.vehicleNumber,
            vehicleWeight: record.vehicleWeight,
            vehiclePhoto: record.vehiclePhoto,
            grossWeight: record.grossWeight,
            weightRecordPhoto: record.weightRecordPhoto,
            netWeight: record.netWeight,
            procurementDate: new Date(record.procurementDate),
            createdBy: record.createdBy,
            procurementId: record.procurementId,
            locationLatitude: record.locationLatitude,
            locationLongitude: record.locationLongitude,
            geojsonData: record.geojsonData,
            name: record.name,
            state: record.state,
            district: record.district,
            village: record.village,
            vehicleType: record.vehicleType,
            moisturePhoto: record.moisturePhoto,
            moisturePercentage: record.moisturePercentage,
          });
          syncedCount++;
          const updatedRecords = localRecords.filter((r: any) => r.id !== record.id);
          localStorage.setItem('localProcurementRecords', JSON.stringify(updatedRecords));
          localStorage.removeItem(`local-photos-${record.id}-vehicle`);
          localStorage.removeItem(`local-photos-${record.id}-weight`);
          localStorage.removeItem(`local-photos-${record.id}-moisture`);
        } else {
        // Try to save this record to database (Supabase)
        const { error } = await supabase
          .from('raw_biomass_procurement')
          .insert({
            stock_point_id: record.stockPointId,
            source: record.source,
            vehicle_number: record.vehicleNumber,
            vehicle_weight: record.vehicleWeight,
            vehicle_photo: record.vehiclePhoto,
            gross_weight: record.grossWeight,
            weight_record_photo: record.weightRecordPhoto,
            net_weight: record.netWeight,
            procurement_date: record.procurementDate,
            created_by: record.createdBy,
            location_latitude: record.locationLatitude,
            location_longitude: record.locationLongitude,
            geojson_data: record.geojsonData,
            name: record.name,
            state: record.state,
            district: record.district,
            village: record.village,
            vehicle_type: record.vehicleType,
            moisture_photo: record.moisturePhoto,
            moisture_percentage: record.moisturePercentage,
          });
        
        if (!error) {
          syncedCount++;
          // Remove from local storage after successful sync
          const updatedRecords = localRecords.filter((r: any) => r.id !== record.id);
          localStorage.setItem('localProcurementRecords', JSON.stringify(updatedRecords));
          
          // Remove associated photos
          localStorage.removeItem(`local-photos-${record.id}-vehicle`);
          localStorage.removeItem(`local-photos-${record.id}-weight`);
          localStorage.removeItem(`local-photos-${record.id}-moisture`);
        } else {
          failedCount++;
          console.warn(`❌ Failed to sync record ${record.id}:`, error);
        }
        }
      } catch (e) {
        failedCount++;
        console.warn(`❌ Error syncing record ${record.id}:`, e);
      }
    }
    
    console.log(`🔄 Sync completed: ${syncedCount} synced, ${failedCount} failed`);
    
    if (syncedCount > 0) {
      // Show success message if any records were synced
      console.log(`🎉 Synced ${syncedCount} record${syncedCount > 1 ? 's' : ''} to database!`);
    }
    
  } catch (error) {
    console.warn('❌ Sync process failed:', error);
  }
}

export async function createRawBiomassProcurement(
  procurement: Omit<RawBiomassProcurement, 'id' | 'createdAt'> & {
    moisturePhoto?: string | null;
    moisturePercentage?: string | number | null;
  }
): Promise<RawBiomassProcurement> {
  if (useRailway) {
    const data = await apiFetch<any>('/api/raw-biomass-procurement', {
      method: 'POST',
      body: JSON.stringify({
        stockPointId: procurement.stockPointId,
        source: procurement.source || 'cotton_stalks',
        vehicleNumber: procurement.vehicleNumber,
        vehicleWeight: procurement.vehicleWeight,
        vehiclePhoto: procurement.vehiclePhoto,
        grossWeight: procurement.grossWeight,
        weightRecordPhoto: procurement.weightRecordPhoto,
        netWeight: procurement.netWeight,
        procurementDate: procurement.procurementDate?.toISOString?.() ?? procurement.procurementDate,
        createdBy: procurement.createdBy,
        locationLatitude: procurement.locationLatitude,
        locationLongitude: procurement.locationLongitude,
        geojsonData: procurement.geojsonData,
        name: procurement.name,
        state: procurement.state,
        district: procurement.district,
        village: procurement.village,
        vehicleType: procurement.vehicleType,
        moisture: procurement.moisturePercentage ?? procurement.moisture,
      }),
    });
    return {
      id: data.id,
      stockPointId: data.stockPointId,
      source: data.source,
      vehicleNumber: data.vehicleNumber,
      vehicleWeight: data.vehicleWeight,
      vehiclePhoto: data.vehiclePhoto,
      grossWeight: data.grossWeight,
      weightRecordPhoto: data.weightRecordPhoto,
      netWeight: data.netWeight,
      procurementDate: new Date(data.procurementDate),
      createdBy: data.createdBy,
      createdByEmail: data.createdByEmail,
      procurementId: data.procurementId,
      locationLatitude: data.locationLatitude,
      locationLongitude: data.locationLongitude,
      geojsonData: data.geojsonData,
      name: data.name,
      state: data.state,
      district: data.district,
      village: data.village,
      vehicleType: data.vehicleType,
      moisture: data.moisture,
    };
  }
  // Check if using placeholder credentials (development mode)
  if (environment.supabaseUrl.includes('placeholder')) {
    console.log('🧪 Development mode: Creating procurement record in localStorage');
    
    // Get existing procurement records
    const records = JSON.parse(localStorage.getItem('devProcurementRecords') || '[]');
    
    // Create new procurement record
    const newRecord = {
      id: 'dev-procurement-' + Date.now(),
      stock_point_id: procurement.stockPointId,
      source: procurement.source,
      vehicle_number: procurement.vehicleNumber,
      vehicle_weight: procurement.vehicleWeight,
      vehicle_photo: procurement.vehiclePhoto,
      gross_weight: procurement.grossWeight,
      weight_record_photo: procurement.weightRecordPhoto,
      net_weight: procurement.netWeight,
      procurement_date: procurement.procurementDate.toISOString(),
      created_by: procurement.createdBy,
      procurement_id: procurement.procurementId,
      location_latitude: procurement.locationLatitude,
      location_longitude: procurement.locationLongitude,
      geojson_data: procurement.geojsonData,
      created_at: new Date().toISOString(),
      name: procurement.name,
      state: procurement.state,
      district: procurement.district,
      village: procurement.village,
      vehicle_type: procurement.vehicleType,
      moisture: procurement.moisture,
    };
    
    // Add to localStorage
    records.push(newRecord);
    localStorage.setItem('devProcurementRecords', JSON.stringify(records));
    
    console.log('✅ Procurement record created in localStorage:', newRecord);
    
    return {
      id: newRecord.id,
      stockPointId: newRecord.stock_point_id || '',
      source: newRecord.source,
      vehicleNumber: newRecord.vehicle_number,
      vehicleWeight: newRecord.vehicle_weight || 0,
      vehiclePhoto: newRecord.vehicle_photo || '',
      grossWeight: newRecord.gross_weight,
      weightRecordPhoto: newRecord.weight_record_photo || '',
      netWeight: newRecord.net_weight,
      procurementDate: new Date(newRecord.procurement_date),
      createdBy: newRecord.created_by,
      createdByEmail: procurement.createdBy,
      procurementId: newRecord.procurement_id,
      locationLatitude: newRecord.location_latitude,
      locationLongitude: newRecord.location_longitude,
      geojsonData: newRecord.geojson_data,
      createdAt: new Date(newRecord.created_at),
      name: newRecord.name,
      state: newRecord.state,
      district: newRecord.district,
      village: newRecord.village,
      vehicleType: newRecord.vehicle_type,
      moisture: newRecord.moisture,
    };
  }

  // Production: Create procurement record in Supabase
  // Get the current authenticated user ID from Supabase
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  // For mock users, use the email as the identifier since there's no real Supabase session
  let currentUserId = authUser?.id || procurement.createdBy || null;
  
  // Check if this is a mock user by looking for mock-user-id
  if (procurement.createdBy === 'mock-user-id') {
    // Try to get the mock user from localStorage to get their actual email
    try {
      const mockUserStr = localStorage.getItem('mockUser');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        currentUserId = mockUser.email; // Use the actual email instead of mock-user-id
        console.log('🔧 Using mock user email:', currentUserId);
      }
    } catch (e) {
      console.warn('Could not get mock user email, using default ID');
    }
  }
  
  // Helper function to convert email to database-friendly format
  const getDatabaseUserId = (email: string | null) => {
    if (!email) return null;
    // Use a simple, reliable UUID generation for email
    const emailToUUID = (email: string) => {
      // Create a simple hash from email
      let hash = 0;
      for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Use absolute value and ensure it's positive
      let seed = Math.abs(hash) || 1;
      
      // Generate a simple but valid UUID using the seed
      const random = () => {
        const x = Math.sin(seed++) * 10000;
        return Math.floor((x - Math.floor(x)) * 0x10000);
      };
      
      // Create valid UUID segments
      const segment1 = random().toString(16).padStart(4, '0') + random().toString(16).padStart(4, '0');
      const segment2 = random().toString(16).padStart(4, '0');
      const segment3 = random().toString(16).padStart(4, '0');
      const segment4 = random().toString(16).padStart(4, '0');
      const segment5 = random().toString(16).padStart(4, '0') + random().toString(16).padStart(4, '0') + random().toString(16).padStart(4, '0');
      
      // Set version to 4 and variant to 8
      return `${segment1}-${segment2}-4${segment3.slice(1)}-8${segment4.slice(1)}-${segment5}`;
    };
    return emailToUUID(email);
  };
  
  let dbUserId: string;
  
  // Check if this is a real Supabase user ID (UUID format) or needs conversion
  if (currentUserId && currentUserId.includes('-') && currentUserId.length > 30) {
    // This is a real Supabase UUID, use it directly
    dbUserId = currentUserId;
    console.log('✅ Using real Supabase user ID for save:', dbUserId);
  } else if (currentUserId && currentUserId.includes('@')) {
    // This is an email, convert to database ID
    dbUserId = getDatabaseUserId(currentUserId);
    console.log('🔄 Converted email to database ID for save:', dbUserId);
  } else {
    console.log('❌ Invalid user ID format for save:', currentUserId);
    throw new Error('Invalid user ID format');
  }
  
  console.log('💾 Saving to database:', {
    stockPointId: procurement.stockPointId,
    locationLatitude: procurement.locationLatitude,
    locationLongitude: procurement.locationLongitude,
    authUserId: authUser?.id,
    currentUserId: currentUserId,
    createdByFromProcurement: procurement.createdBy,
    databaseUserId: dbUserId,
    uuidFormat: dbUserId ? (dbUserId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) ? 'valid' : 'invalid') : 'null'
  });
  
  // First, try to get a real stock point from the database
  let validStockPointId = null;
  try {
    const { data: stockPoints, error: stockPointError } = await supabase
      .from('stock_points')
      .select('id')
      .limit(1);
    
    if (!stockPointError && stockPoints && stockPoints.length > 0) {
      validStockPointId = stockPoints[0].id;
      console.log('✅ Found real stock point:', validStockPointId);
    } else {
      console.log('⚠️ No stock points found, trying to insert without stock_point_id');
    }
  } catch (e) {
    console.log('⚠️ Error fetching stock points:', e);
  }

  // Generate a valid UUID for the procurement record
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Generate custom procurement_id with continuous numbering across all sources
const generateProcurementId = async () => {
  const today = new Date();
  const dateStr = today.getFullYear().toString() + 
                 (today.getMonth() + 1).toString().padStart(2, '0') + 
                 today.getDate().toString().padStart(2, '0');
  
  // Get source prefix from procurement data
  const sourcePrefix = procurement.source === 'cotton_stalks' ? 'COT' : 'CHL';
  
  try {
    // Get the last procurement ID from ALL sources (continuous numbering)
    const { data: lastRecord, error } = await supabase
      .from('raw_biomass_procurement')
      .select('procurement_id')
      .like('procurement_id', 'BMP-%')
      .order('procurement_id', { ascending: false })
      .limit(1)
      .single();
    
    let nextNumber = 1;
    
    if (!error && lastRecord && lastRecord.procurement_id) {
      // Extract the last number from the procurement_id
      const parts = lastRecord.procurement_id.split('-');
      if (parts.length >= 4) {
        const lastNumber = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }
    
    const sequenceNumber = nextNumber.toString().padStart(4, '0');
    
    console.log(`🔢 Generated ${sourcePrefix} procurement ID: ${nextNumber} (previous: ${nextNumber > 1 ? nextNumber - 1 : 'none'})`);
    
    return `BMP-${sourcePrefix}-${dateStr}-${sequenceNumber}`;
  } catch (dbError) {
    console.warn('⚠️ Could not fetch last procurement ID, using fallback:', dbError);
    // Fallback to simple numbering if database query fails
    const sequenceNumber = Math.floor(Math.random() * 9000 + 1000).toString().padStart(4, '0');
    return `BMP-${sourcePrefix}-${dateStr}-${sequenceNumber}`;
  }
};

  // Generate procurement_id asynchronously
  const procurementId = await generateProcurementId();
  
  const insertData: any = {
    id: generateUUID(), // Generate valid UUID for database id
    procurement_id: procurementId, // Generate human-readable procurement_id
    source: procurement.source,
    vehicle_number: procurement.vehicleNumber,
    vehicle_weight: procurement.vehicleWeight,
    vehicle_photo: procurement.vehiclePhoto,
    gross_weight: procurement.grossWeight,
    weight_record_photo: procurement.weightRecordPhoto,
    net_weight: procurement.netWeight,
    procurement_date: procurement.procurementDate.toISOString().split('T')[0],
    created_by: dbUserId, // Use pre-calculated database-friendly user ID
    created_by_email: currentUserId, // Store email for user filtering
    geojson_data: procurement.geojsonData,
    name: procurement.name || null,
    state: procurement.state || null,
    district: procurement.district || null,
    village: procurement.village || null,
    vehicle_type: procurement.vehicleType || null,
    moisture: procurement.moisturePercentage || null, // Add moisture value from form
    // Remove moisture fields completely as they don't exist in database
  };

  // Only add stock_point_id if we found a valid one
  if (validStockPointId) {
    insertData.stock_point_id = validStockPointId;
    console.log('📍 Using real stock point:', validStockPointId);
  } else {
    console.log('📍 No stock point - inserting without stock_point_id');
  }
  
  // Only include GPS if values are valid
  if (procurement.locationLatitude != null && 
      !isNaN(Number(procurement.locationLatitude)) && 
      Number(procurement.locationLatitude) !== 0) {
    insertData.location_latitude = Number(procurement.locationLatitude);
  }
  
  if (procurement.locationLongitude != null && 
      !isNaN(Number(procurement.locationLongitude)) && 
      Number(procurement.locationLongitude) !== 0) {
    insertData.location_longitude = Number(procurement.locationLongitude);
  }
  
  console.log('💾 Insert data with GPS:', {
    location_latitude: insertData.location_latitude,
    location_longitude: insertData.location_longitude,
    created_by: insertData.created_by,
    moisture: insertData.moisture,
    moistureType: typeof insertData.moisture,
    allFields: Object.keys(insertData),
    insertDataPreview: {
      source: insertData.source,
      vehicle_number: insertData.vehicle_number,
      created_by: insertData.created_by,
      procurement_date: insertData.procurement_date,
      moisture: insertData.moisture
    }
  });
  
  let data, error;
  
  try {
    // Direct Supabase connection for instant saving
    console.log('💾 Saving to Supabase...');
    
    const result = await supabase
      .from('raw_biomass_procurement')
      .insert(insertData)
      .select()
      .single();
    
    console.log('✅ Supabase response received:', result);
    data = result.data;
    error = result.error;
    
    if (error) {
      throw error;
    }
  } catch (supabaseError: any) {
    console.error('❌ Database save failed:', supabaseError.message);
    
    // Check if it's a CORS error (which we can't fix automatically)
    if (supabaseError.message.includes('CORS') || supabaseError.message.includes('Access-Control-Allow-Origin')) {
      console.error('🚫 CORS error detected - this requires manual fix in Supabase dashboard');
      console.error('📝 To fix: Go to Supabase Dashboard → Settings → API → CORS → Add http://localhost:8081');
      throw new Error('CORS error: Please add http://localhost:8081 to Supabase CORS settings');
    } else if (supabaseError.message.includes('Failed to fetch') || supabaseError.message.includes('ERR_FAILED')) {
      console.error('🌐 Network error detected - could be Supabase outage or connectivity issue');
      throw new Error('Network error: Please check your internet connection and Supabase status');
    } else {
      console.error('❓ Database error occurred:', supabaseError);
      throw new Error(`Database error: ${supabaseError.message}`);
    }
  }
  
  console.log('✅ Record saved to database successfully. Created by:', data.created_by);
  
  return {
    id: data.id,
    procurementId: data.procurement_id, // Add human-readable procurement_id
    stockPointId: data.stock_point_id,
    source: data.source,
    vehicleNumber: data.vehicle_number,
    vehicleWeight: data.vehicle_weight,
    vehiclePhoto: data.vehicle_photo,
    grossWeight: data.gross_weight,
    weightRecordPhoto: data.weight_record_photo,
    netWeight: data.net_weight,
    procurementDate: new Date(data.procurement_date),
    createdBy: dbUserId,
    createdByEmail: dbUserId,
    locationLatitude: data.location_latitude,
    locationLongitude: data.location_longitude,
    geojsonData: data.geojson_data,
    name: data.name,
    state: data.state,
    district: data.district,
    village: data.village,
    vehicleType: data.vehicle_type,
    moisture: data.moisture, // Add moisture field
  };
}

export async function getRawBiomassProcurements(
  stockPointId?: string,
  fromDate?: Date,
  toDate?: Date,
  userId?: string,
  timeoutMs?: number
): Promise<RawBiomassProcurement[]> {
  console.log('🔍 Getting procurement records for user:', userId);
  if (useRailway) {
    const params = new URLSearchParams();
    if (stockPointId) params.set('stockPointId', stockPointId);
    if (fromDate) params.set('fromDate', fromDate.toISOString().split('T')[0]);
    if (toDate) params.set('toDate', toDate.toISOString().split('T')[0]);
    const data = await apiFetch<any[]>(`/api/raw-biomass-procurement?${params}`, timeoutMs != null ? { timeoutMs } : {});
    return (data || []).map((item) => ({
      id: item.id,
      stockPointId: item.stockPointId || '',
      source: item.source,
      vehicleNumber: item.vehicleNumber,
      vehicleWeight: item.vehicleWeight || 0,
      vehiclePhoto: item.vehiclePhoto || '',
      grossWeight: item.grossWeight,
      weightRecordPhoto: item.weightRecordPhoto || '',
      netWeight: item.netWeight,
      procurementDate: new Date(item.procurementDate),
      createdBy: item.createdBy,
      createdByEmail: item.createdByEmail,
      procurementId: item.procurementId,
      locationLatitude: item.locationLatitude,
      locationLongitude: item.locationLongitude,
      geojsonData: item.geojsonData,
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
      name: item.name,
      state: item.state,
      district: item.district,
      village: item.village,
      vehicleType: item.vehicleType,
      moisture: item.moisture,
    }));
  }
  // Check if using placeholder credentials (development mode)
  if (environment.supabaseUrl.includes('placeholder')) {
    console.log('🧪 Development mode: Using localStorage for procurement records');
    
    // Get procurement records from localStorage
    const records = JSON.parse(localStorage.getItem('devProcurementRecords') || '[]');
    
    // Filter by user ID if provided
    if (userId) {
      console.log('🔍 DEBUG: Filtering records for user:', userId);
      console.log('🔍 DEBUG: Available records:', records.length);
      
      // Show sample record user IDs for debugging
      if (records.length > 0) {
        console.log('🔍 DEBUG: Sample record user IDs:');
        records.slice(0, 3).forEach((r: any, idx: number) => {
          console.log(`  Record ${idx + 1}: created_by=${r.created_by}, created_by_email=${r.created_by_email}`);
        });
      }
      
      const userRecords = records.filter((r: any) => {
        const matches = r.created_by === userId || r.created_by_email === userId;
        if (!matches && records.length <= 5) {
          console.log('🔍 DEBUG: Record does not match:', {
            recordId: r.id,
            created_by: r.created_by,
            created_by_email: r.created_by_email,
            targetUserId: userId,
            createdByMatch: r.created_by === userId,
            emailMatch: r.created_by_email === userId
          });
        }
        return matches;
      });
      
      console.log('✅ DEBUG: Filtered records found:', userRecords.length, 'for user:', userId);
      
      return userRecords.map((item: any) => ({
        id: item.id,
        stockPointId: item.stock_point_id || '',
        source: item.source,
        vehicleNumber: item.vehicle_number,
        vehicleWeight: item.vehicle_weight || 0,
        vehiclePhoto: item.vehicle_photo || '',
        grossWeight: item.gross_weight,
        weightRecordPhoto: item.weight_record_photo || '',
        netWeight: item.net_weight,
        procurementDate: new Date(item.procurement_date),
        createdBy: item.created_by,
        createdByEmail: item.created_by_email, // Fix: Use actual database value
        procurementId: item.procurement_id,
        locationLatitude: item.location_latitude,
        locationLongitude: item.location_longitude,
        geojsonData: item.geojson_data,
        createdAt: item.created_at ? new Date(item.created_at) : undefined,
        name: item.name,
        state: item.state,
        district: item.district,
        village: item.village,
        vehicleType: item.vehicle_type,
        moisture: item.moisture,
      }));
    }
    
    console.log('✅ All procurement records from localStorage:', records.length);
    return records.map((item: any) => ({
      id: item.id,
      stockPointId: item.stock_point_id || '',
      source: item.source,
      vehicleNumber: item.vehicle_number,
      vehicleWeight: item.vehicle_weight || 0,
      vehiclePhoto: item.vehicle_photo || '',
      grossWeight: item.gross_weight,
      weightRecordPhoto: item.weight_record_photo || '',
      netWeight: item.net_weight,
      procurementDate: new Date(item.procurement_date),
      createdBy: item.created_by,
      createdByEmail: item.created_by_email, // Fix: Use actual database value
      procurementId: item.procurement_id,
      locationLatitude: item.location_latitude,
      locationLongitude: item.location_longitude,
      geojsonData: item.geojson_data,
      createdAt: item.created_at ? new Date(item.created_at) : undefined,
      name: item.name,
      state: item.state,
      district: item.district,
      village: item.village,
      vehicleType: item.vehicle_type,
      moisture: item.moisture,
    }));
  }

  // Production: Simple database query for user records
  try {
    console.log('🔍 Debug: Querying procurement records for user:', userId);
    
    let query = supabase
      .from('raw_biomass_procurement')
      .select('*')
      .order('procurement_date', { ascending: false });

    // Filter by user - only show records for the current user
    if (userId) {
      // Try to filter by user ID or email
      query = query.or(`created_by.eq.${userId},created_by_email.eq.${userId}`);
      console.log('🔍 Debug: Applied user filter for:', userId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Database error:', error);
      console.log('🔄 Debug: Error details:', error);
      // Return empty array instead of fallback - don't show other users' data
      console.log('🔒 Security: User filtering failed, returning empty array');
      return [];
    }
    
    console.log('✅ Debug: Query successful, found records:', data?.length || 0);
    
    // Debug: Log the actual data to see what we got
    if (data && data.length > 0) {
      console.log('🔍 Debug: Sample record data:', {
        id: data[0].id,
        created_by: data[0].created_by,
        created_by_email: data[0].created_by_email,
        procurement_date: data[0].procurement_date
      });
    }
    
    return (data || []).map((item: any) => ({
      id: item.id,
      stockPointId: item.stock_point_id || '',
      source: item.source,
      vehicleNumber: item.vehicle_number,
      vehicleWeight: item.vehicle_weight || 0,
      vehiclePhoto: item.vehicle_photo || '',
      grossWeight: item.gross_weight,
      weightRecordPhoto: item.weight_record_photo || '',
      netWeight: item.net_weight,
      procurementDate: new Date(item.procurement_date),
      createdBy: item.created_by,
      createdByEmail: item.created_by_email, // Fix: Use actual database value
      procurementId: item.procurement_id,
      locationLatitude: item.location_latitude,
      locationLongitude: item.location_longitude,
      geojsonData: item.geojson_data,
      createdAt: item.created_at ? new Date(item.created_at) : undefined,
      name: item.name,
      state: item.state,
      district: item.district,
      village: item.village,
      vehicleType: item.vehicle_type,
      moisture: item.moisture,
    }));
    
  } catch (error) {
    console.error('❌ Error fetching records:', error);
    return [];
  }
}

// Expenses
export async function createExpense(
  expense: Omit<Expense, 'id' | 'createdAt'>
): Promise<Expense> {
  if (useRailway) {
    const data = await apiFetch<any>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify({
        stockPointId: expense.stockPointId,
        date: expense.date?.toISOString?.() ?? expense.date,
        amount: expense.amount,
        type: expense.type,
        paymentMode: expense.paymentMode,
        receiptUrl: expense.receiptUrl,
      }),
    });
    return {
      id: data.id,
      stockPointId: data.stockPointId,
      date: new Date(data.date),
      amount: parseFloat(data.amount),
      type: data.type,
      paymentMode: data.paymentMode,
      receiptUrl: data.receiptUrl || '',
      createdBy: data.createdBy,
      createdAt: new Date(data.createdAt),
    };
  }
  // Map frontend values to database column names
  const expenseTypeMap: Record<string, string> = {
    'fuel': 'Fuel Expenses',
    'cash_advance': 'Cash Advance',
    'other': 'Other Expenses'
  };
  
  const paymentModeMap: Record<string, string> = {
    'cash': 'Cash',
    'upi': 'UPI'
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      stock_point_id: expense.stockPointId,
      expense_date: expense.date.toISOString().split('T')[0],
      expense_amount: expense.amount,
      expense_type: expenseTypeMap[expense.type] || expense.type,
      payment_mode: paymentModeMap[expense.paymentMode] || expense.paymentMode,
      receipt_url: expense.receiptUrl || null,
      incharge_id: expense.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  
  // Map database values back to frontend format
  const typeMap: Record<string, string> = {
    'Fuel Expenses': 'fuel',
    'Cash Advance': 'cash_advance',
    'Other Expenses': 'other'
  };
  
  const paymentMap: Record<string, string> = {
    'Cash': 'cash',
    'UPI': 'upi'
  };
  
  return {
    id: data.id,
    stockPointId: data.stock_point_id,
    date: new Date(data.expense_date),
    amount: parseFloat(data.expense_amount),
    type: (typeMap[data.expense_type] || data.expense_type) as 'fuel' | 'cash_advance' | 'other',
    paymentMode: (paymentMap[data.payment_mode] || data.payment_mode) as 'cash' | 'upi',
    receiptUrl: data.receipt_url || '',
    createdBy: data.incharge_id,
    createdAt: new Date(data.created_at),
  };
}

export async function getExpenses(
  stockPointId?: string,
  fromDate?: Date,
  toDate?: Date,
  expenseType?: string,
  inchargeId?: string
): Promise<Expense[]> {
  if (useRailway) {
    const params = new URLSearchParams();
    if (stockPointId) params.set('stockPointId', stockPointId);
    if (fromDate) params.set('fromDate', fromDate.toISOString().split('T')[0]);
    if (toDate) params.set('toDate', toDate.toISOString().split('T')[0]);
    if (expenseType) params.set('expenseType', expenseType);
    if (inchargeId) params.set('inchargeId', inchargeId);
    const data = await apiFetch<any[]>(`/api/expenses?${params}`);
    return (data || []).map((item) => ({
      id: item.id,
      stockPointId: item.stockPointId,
      date: new Date(item.date),
      amount: parseFloat(item.amount),
      type: item.type,
      paymentMode: item.paymentMode,
      receiptUrl: item.receiptUrl || '',
      createdBy: item.createdBy,
      createdAt: new Date(item.createdAt),
    }));
  }
  let query = supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });

  if (stockPointId) {
    query = query.eq('stock_point_id', stockPointId);
  }
  if (inchargeId) {
    query = query.eq('incharge_id', inchargeId);
  }
  if (expenseType) {
    const typeMap: Record<string, string> = {
      'fuel': 'Fuel Expenses',
      'cash_advance': 'Cash Advance',
      'other': 'Other Expenses'
    };
    query = query.eq('expense_type', typeMap[expenseType] || expenseType);
  }
  if (fromDate) {
    query = query.gte('expense_date', fromDate.toISOString().split('T')[0]);
  }
  if (toDate) {
    query = query.lte('expense_date', toDate.toISOString().split('T')[0]);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  // Map database values to frontend format
  const typeMap: Record<string, string> = {
    'Fuel Expenses': 'fuel',
    'Cash Advance': 'cash_advance',
    'Other Expenses': 'other'
  };
  
  const paymentMap: Record<string, string> = {
    'Cash': 'cash',
    'UPI': 'upi'
  };
  
  return (data || []).map((item) => ({
    id: item.id,
    stockPointId: item.stock_point_id,
    date: new Date(item.expense_date),
    amount: parseFloat(item.expense_amount),
    type: (typeMap[item.expense_type] || item.expense_type) as 'fuel' | 'cash_advance' | 'other',
    paymentMode: (paymentMap[item.payment_mode] || item.payment_mode) as 'cash' | 'upi',
    receiptUrl: item.receipt_url || '',
    createdBy: item.incharge_id,
    createdAt: new Date(item.created_at),
  }));
}

// Processed Biomass Procurement
export async function createProcessedBiomassProcurement(
  procurement: Omit<ProcessedBiomassProcurement, 'id'>
): Promise<ProcessedBiomassProcurement> {
  if (useRailway) {
    const data = await apiFetch<any>('/api/processed-biomass-procurement', {
      method: 'POST',
      body: JSON.stringify({
        plantId: procurement.plantId,
        sourceStockPointId: procurement.sourceStockPointId,
        vehicleNumber: procurement.vehicleNumber,
        vehicleWeight: procurement.vehicleWeight,
        vehiclePhoto: procurement.vehiclePhoto,
        vehiclePhotoLatitude: procurement.vehiclePhotoLatitude,
        vehiclePhotoLongitude: procurement.vehiclePhotoLongitude,
        grossWeight: procurement.grossWeight,
        weightRecordPhoto: procurement.weightRecordPhoto,
        weightPhotoLatitude: procurement.weightPhotoLatitude,
        weightPhotoLongitude: procurement.weightPhotoLongitude,
        netWeight: procurement.netWeight,
        procurementDate: procurement.procurementDate?.toISOString?.() ?? procurement.procurementDate,
        createdBy: procurement.createdBy,
      }),
    });
    return {
      id: data.id,
      plantId: data.plantId,
      sourceStockPointId: data.sourceStockPointId,
      vehicleNumber: data.vehicleNumber,
      vehicleWeight: data.vehicleWeight,
      vehiclePhoto: data.vehiclePhoto,
      vehiclePhotoLatitude: data.vehiclePhotoLatitude,
      vehiclePhotoLongitude: data.vehiclePhotoLongitude,
      grossWeight: data.grossWeight,
      weightRecordPhoto: data.weightRecordPhoto,
      weightPhotoLatitude: data.weightPhotoLatitude,
      weightPhotoLongitude: data.weightPhotoLongitude,
      netWeight: data.netWeight,
      procurementDate: new Date(data.procurementDate),
      createdBy: data.createdBy,
    };
  }
  const { data, error } = await supabase
    .from('processed_biomass_procurement')
    .insert({
      plant_id: procurement.plantId,
      source_stock_point_id: procurement.sourceStockPointId,
      vehicle_number: procurement.vehicleNumber,
      vehicle_weight: procurement.vehicleWeight,
      vehicle_photo: procurement.vehiclePhoto,
      vehicle_photo_latitude: procurement.vehiclePhotoLatitude,
      vehicle_photo_longitude: procurement.vehiclePhotoLongitude,
      gross_weight: procurement.grossWeight,
      weight_record_photo: procurement.weightRecordPhoto,
      weight_photo_latitude: procurement.weightPhotoLatitude,
      weight_photo_longitude: procurement.weightPhotoLongitude,
      net_weight: procurement.netWeight,
      procurement_date: procurement.procurementDate.toISOString().split('T')[0],
      created_by: procurement.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    plantId: data.plant_id,
    sourceStockPointId: data.source_stock_point_id,
    vehicleNumber: data.vehicle_number,
    vehicleWeight: data.vehicle_weight,
    vehiclePhoto: data.vehicle_photo,
    vehiclePhotoLatitude: data.vehicle_photo_latitude,
    vehiclePhotoLongitude: data.vehicle_photo_longitude,
    grossWeight: data.gross_weight,
    weightRecordPhoto: data.weight_record_photo,
    weightPhotoLatitude: data.weight_photo_latitude,
    weightPhotoLongitude: data.weight_photo_longitude,
    netWeight: data.net_weight,
    procurementDate: new Date(data.procurement_date),
    createdBy: data.created_by,
  };
}

export async function getProcessedBiomassProcurements(
  plantId?: string
): Promise<ProcessedBiomassProcurement[]> {
  if (useRailway) {
    const params = plantId ? `?plantId=${plantId}` : '';
    const data = await apiFetch<any[]>(`/api/processed-biomass-procurement${params}`);
    return (data || []).map((item) => ({
      id: item.id,
      plantId: item.plantId,
      sourceStockPointId: item.sourceStockPointId,
      vehicleNumber: item.vehicleNumber,
      vehicleWeight: item.vehicleWeight,
      vehiclePhoto: item.vehiclePhoto,
      grossWeight: item.grossWeight,
      weightRecordPhoto: item.weightRecordPhoto,
      netWeight: item.netWeight,
      procurementDate: new Date(item.procurementDate),
      createdBy: item.createdBy,
    }));
  }
  let query = supabase
    .from('processed_biomass_procurement')
    .select('*')
    .order('procurement_date', { ascending: false });

  if (plantId) {
    query = query.eq('plant_id', plantId);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  return (data || []).map((item) => ({
    id: item.id,
    plantId: item.plant_id,
    sourceStockPointId: item.source_stock_point_id,
    vehicleNumber: item.vehicle_number,
    vehicleWeight: item.vehicle_weight,
    vehiclePhoto: item.vehicle_photo,
    grossWeight: item.gross_weight,
    weightRecordPhoto: item.weight_record_photo,
    netWeight: item.net_weight,
    procurementDate: new Date(item.procurement_date),
    createdBy: item.created_by,
  }));
}

// Biochar Deployment
export async function createBiocharDeployment(
  deployment: Omit<BiocharDeployment, 'id' | 'createdAt'>
): Promise<BiocharDeployment> {
  if (useRailway) {
    const data = await apiFetch<any>('/api/biochar-deployment', {
      method: 'POST',
      body: JSON.stringify({
        plantId: deployment.plantId,
        farmerName: deployment.farmerName,
        mobileNumber: deployment.mobileNumber,
        aadhaarNumber: deployment.aadhaarNumber,
        village: deployment.village,
        mandal: deployment.mandal,
        district: deployment.district,
        landArea: deployment.landArea,
        biocharWeight: deployment.biocharWeight,
        numberOfBags: deployment.numberOfBags,
        kmlData: deployment.kmlData,
        createdBy: deployment.createdBy,
      }),
    });
    return {
      id: data.id,
      plantId: data.plantId,
      farmerName: data.farmerName,
      mobileNumber: data.mobileNumber,
      aadhaarNumber: data.aadhaarNumber,
      village: data.village,
      mandal: data.mandal,
      district: data.district,
      landArea: data.landArea,
      biocharWeight: data.biocharWeight,
      numberOfBags: data.numberOfBags,
      kmlData: data.kmlData,
      createdBy: data.createdBy,
      createdAt: new Date(data.createdAt),
    };
  }
  const { data, error } = await supabase
    .from('biochar_deployment')
    .insert({
      plant_id: deployment.plantId,
      farmer_name: deployment.farmerName,
      mobile_number: deployment.mobileNumber,
      aadhaar_number: deployment.aadhaarNumber,
      village: deployment.village,
      mandal: deployment.mandal,
      district: deployment.district,
      land_area: deployment.landArea,
      biochar_weight: deployment.biocharWeight,
      number_of_bags: deployment.numberOfBags,
      kml_data: deployment.kmlData,
      created_by: deployment.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    plantId: data.plant_id,
    farmerName: data.farmer_name,
    mobileNumber: data.mobile_number,
    aadhaarNumber: data.aadhaar_number,
    village: data.village,
    mandal: data.mandal,
    district: data.district,
    landArea: data.land_area,
    biocharWeight: data.biochar_weight,
    numberOfBags: data.number_of_bags,
    kmlData: data.kml_data,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
  };
}

export async function getBiocharDeployments(
  plantId?: string
): Promise<BiocharDeployment[]> {
  if (useRailway) {
    const params = plantId ? `?plantId=${plantId}` : '';
    const data = await apiFetch<any[]>(`/api/biochar-deployment${params}`);
    return (data || []).map((item) => ({
      id: item.id,
      plantId: item.plantId,
      farmerName: item.farmerName,
      mobileNumber: item.mobileNumber,
      aadhaarNumber: item.aadhaarNumber,
      village: item.village,
      mandal: item.mandal,
      district: item.district,
      landArea: item.landArea,
      biocharWeight: item.biocharWeight,
      numberOfBags: item.numberOfBags,
      kmlData: item.kmlData,
      createdBy: item.createdBy,
      createdAt: new Date(item.createdAt),
    }));
  }
  let query = supabase
    .from('biochar_deployment')
    .select('*')
    .order('created_at', { ascending: false });

  if (plantId) {
    query = query.eq('plant_id', plantId);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  return (data || []).map((item) => ({
    id: item.id,
    plantId: item.plant_id,
    farmerName: item.farmer_name,
    mobileNumber: item.mobile_number,
    aadhaarNumber: item.aadhaar_number,
    village: item.village,
    mandal: item.mandal,
    district: item.district,
    landArea: item.land_area,
    biocharWeight: item.biochar_weight,
    numberOfBags: item.number_of_bags,
    kmlData: item.kml_data,
    createdBy: item.created_by,
    createdAt: new Date(item.created_at),
  }));
}

// Dashboard Statistics
export interface DashboardStats {
  totalTripsToday: number;
  netWeightToday: number;
  netWeightThisWeek: number;
  pendingUploads: number;
  totalExpenses: number;
  fuelExpenses: number;
  pendingPayments: number;
  clearedPayments: number;
  processedBiomass: number;
  biocharProduced: number;
  farmersDeployed: number;
  landCovered: number;
}

export async function getDashboardStats(
  userId: string,
  role: string,
  stockPointId?: string,
  plantId?: string
): Promise<DashboardStats> {
  const stats: DashboardStats = {
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
  };

  try {
    if (useRailway) {
      const data = await apiFetch<DashboardStats>('/api/dashboard-stats');
      return { ...stats, ...data };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    console.log('📊 getDashboardStats called:', { userId, role, stockPointId, plantId });
    
    if (role === 'supervisor_stockpoint') {
      // If stockPointId is not provided, try to load all records for the user (fallback)
      const stockPointIdToUse = stockPointId || undefined;
      console.log('📊 Loading trips for stockpoint:', stockPointIdToUse || 'ALL');
      console.log('📊 User ID:', userId);
      console.log('📊 Today date (local):', today.toISOString().split('T')[0]);
      
      // Get trips for this user - optimized: only get today's trips from API if possible
      // For now, still get all and filter, but this could be optimized further
      const allUserTripsPromise = getRawBiomassProcurements(
        stockPointIdToUse,
        undefined,
        undefined,
        userId
      );
      
      // Add timeout to prevent hanging (10 seconds max for mobile/APK)
      const allUserTrips = await Promise.race([
        allUserTripsPromise,
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Trips fetch timeout (10s)')), 10000)
        )
      ]) as any;
      
      console.log('📊 User trips found:', allUserTrips.length);
      
      if (allUserTrips.length === 0) {
        console.warn('⚠️ No trips found for user. Check:');
        console.warn('  - User ID:', userId);
        console.warn('  - Stock Point ID:', stockPointIdToUse);
        console.warn('  - Records in database may not have matching created_by');
      } else {
        console.log('✅ Sample trips found:');
        allUserTrips.slice(0, 3).forEach((trip, idx) => {
          const date = trip.procurementDate instanceof Date 
            ? trip.procurementDate 
            : new Date(trip.procurementDate as string);
          console.log(`  Trip ${idx + 1}:`, {
            id: trip.id,
            date: date.toISOString().split('T')[0],
            netWeight: trip.netWeight,
            createdBy: trip.createdBy,
            hasVehiclePhoto: !!trip.vehiclePhoto,
            hasWeightPhoto: !!trip.weightRecordPhoto
          });
        });
      }
      
      // Filter for today's trips - use flexible date comparison
      // Get today's date in local timezone (YYYY-MM-DD)
      const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Also get today in UTC format for comparison
      const todayUTCStr = today.toISOString().split('T')[0];
      
      // Filter trips for today
      const todayTrips = allUserTrips.filter(trip => {
        // Handle both Date objects and date strings
        let tripDate: Date;
        if (trip.procurementDate instanceof Date) {
          tripDate = trip.procurementDate;
        } else if (typeof trip.procurementDate === 'string') {
          tripDate = new Date(trip.procurementDate);
        } else {
          console.warn('⚠️ Unexpected procurementDate type:', typeof trip.procurementDate, trip.procurementDate);
          return false;
        }
        
        // Get trip date in local timezone (YYYY-MM-DD)
        const tripLocalDateStr = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}-${String(tripDate.getDate()).padStart(2, '0')}`;
        
        // Also get trip date in UTC format
        const tripUTCStr = tripDate.toISOString().split('T')[0];
        
        // Match if either local or UTC date matches today (handles timezone issues)
        const matches = tripLocalDateStr === todayDateStr || tripUTCStr === todayUTCStr;
        
        return matches;
      });
      
      console.log('📊 Today trips found:', todayTrips.length);
      
      // DEBUG: Show all trips for testing
      console.log('🔍 DEBUG: All user trips details:');
      allUserTrips.forEach((trip, idx) => {
        const date = trip.procurementDate instanceof Date 
          ? trip.procurementDate 
          : new Date(trip.procurementDate as string);
        console.log(`🔍 Trip ${idx + 1}:`, {
          id: trip.id,
          procurementDate: trip.procurementDate,
          parsedDate: date.toISOString(),
          localDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
          netWeight: trip.netWeight,
          createdBy: trip.createdBy,
          createdByEmail: trip.createdByEmail,
          isToday: date.toISOString().split('T')[0] === todayUTCStr
        });
      });
      
      // If no trips match today, show why and log all available dates
      if (allUserTrips.length > 0 && todayTrips.length === 0) {
        console.warn('⚠️ No trips found for today, but trips exist:');
        console.warn('  Looking for date:', todayDateStr, 'or', todayUTCStr);
        console.warn('  Total user trips:', allUserTrips.length);
        console.warn('  User ID being matched:', userId);
        
        // Group trips by date to see what dates we have
        const tripsByDate: Record<string, number> = {};
        allUserTrips.forEach((trip) => {
          const date = trip.procurementDate instanceof Date 
            ? trip.procurementDate 
            : new Date(trip.procurementDate as string);
          const tripLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          tripsByDate[tripLocal] = (tripsByDate[tripLocal] || 0) + 1;
        });
        
        console.warn('  Trips by date:', tripsByDate);
        
        // Show sample trips with createdBy matching
        console.warn('  Sample trip details:');
        allUserTrips.slice(0, 3).forEach((trip, idx) => {
          const date = trip.procurementDate instanceof Date 
            ? trip.procurementDate 
            : new Date(trip.procurementDate as string);
          const tripLocal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const tripUTC = date.toISOString().split('T')[0];
          console.warn(`  Trip ${idx + 1}:`, {
            id: trip.id,
            dateLocal: tripLocal,
            dateUTC: tripUTC,
            matchesLocal: tripLocal === todayDateStr,
            matchesUTC: tripUTC === todayUTCStr,
            netWeight: trip.netWeight,
            createdBy: trip.createdBy,
            createdByEmail: trip.createdByEmail,
            userIdMatch: trip.createdBy === userId || trip.createdByEmail === userId
          });
        });
        console.warn('💡 TIP: Dashboard shows only TODAY\'S records. If records were saved on different days, they won\'t appear.');
        console.warn('💡 Current date being checked:', todayDateStr);
        console.warn('💡 Check if trip.createdBy matches current user ID:', userId);
      }
      
      stats.totalTripsToday = todayTrips.length;
      
      // If no trips for today but trips exist, log a helpful message
      if (allUserTrips.length > 0 && todayTrips.length === 0) {
        console.log('💡 Dashboard shows only today\'s records. You have', allUserTrips.length, 'total trips, but none match today\'s date.');
      }

      // Calculate today's net weight
      stats.netWeightToday = todayTrips.reduce(
        (sum, trip) => sum + (trip.netWeight || 0),
        0
      );
      console.log('📊 Net weight today:', stats.netWeightToday);

      // Get this week's net weight - filter by user ID to show only their own trips
      // Use already fetched allUserTrips and filter for this week
      const weekEnd = new Date(today);
      weekEnd.setHours(23, 59, 59, 999);
      const weekStartWithTime = new Date(weekStart);
      weekStartWithTime.setHours(0, 0, 0, 0);
      
      const weekTrips = allUserTrips.filter(trip => {
        const tripDate = new Date(trip.procurementDate);
        return tripDate >= weekStartWithTime && tripDate <= weekEnd;
      });
      console.log('📊 Week trips found:', weekTrips.length);
      stats.netWeightThisWeek = weekTrips.reduce(
        (sum, trip) => sum + (trip.netWeight || 0),
        0
      );

      // Calculate pending uploads - trips today that might be missing photos or incomplete
      // Check for trips without vehicle photo or weight photo
      stats.pendingUploads = todayTrips.filter(
        (trip) => !trip.vehiclePhoto || !trip.weightRecordPhoto
      ).length;
      
      console.log('📊 Final stats:', { 
        totalTripsToday: stats.totalTripsToday, 
        netWeightToday: stats.netWeightToday,
        netWeightThisWeek: stats.netWeightThisWeek,
        pendingUploads: stats.pendingUploads,
        todayDate: todayDateStr,
        totalUserTrips: allUserTrips.length
      });
      
      // Ensure we return valid stats even if calculation fails
      if (isNaN(stats.totalTripsToday)) stats.totalTripsToday = 0;
      if (isNaN(stats.netWeightToday)) stats.netWeightToday = 0;
      if (isNaN(stats.pendingUploads)) stats.pendingUploads = 0;
    } else if (role === 'incharge') {
      // Get expenses
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const expenses = await getExpenses(undefined, monthStart, today);
      stats.totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      stats.fuelExpenses = expenses
        .filter((exp) => exp.type === 'fuel')
        .reduce((sum, exp) => sum + exp.amount, 0);
    } else if (role === 'supervisor_plant' && plantId) {
      // Get processed biomass
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const processed = await getProcessedBiomassProcurements(plantId);
      const thisMonthProcessed = processed.filter(
        (p) => new Date(p.procurementDate) >= monthStart
      );
      stats.processedBiomass = thisMonthProcessed.reduce(
        (sum, p) => sum + p.netWeight,
        0
      );
      stats.biocharProduced = stats.processedBiomass * 0.228; // 22.8% conversion rate

      // Get deployments
      const deployments = await getBiocharDeployments(plantId);
      const thisMonthDeployments = deployments.filter(
        (d) => new Date(d.createdAt) >= monthStart
      );
      stats.farmersDeployed = thisMonthDeployments.length;
      stats.landCovered = deployments.reduce(
        (sum, d) => sum + d.landArea,
        0
      );
    }
  } catch (error: any) {
    console.error('❌ Error getting dashboard stats:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      userId,
      role,
      stockPointId,
      plantId
    });
    // Return default stats with zeros on error
  }

  // Final validation - ensure no NaN values
  return {
    totalTripsToday: isNaN(stats.totalTripsToday) ? 0 : stats.totalTripsToday,
    netWeightToday: isNaN(stats.netWeightToday) ? 0 : stats.netWeightToday,
    netWeightThisWeek: isNaN(stats.netWeightThisWeek) ? 0 : stats.netWeightThisWeek,
    pendingUploads: isNaN(stats.pendingUploads) ? 0 : stats.pendingUploads,
    totalExpenses: isNaN(stats.totalExpenses) ? 0 : stats.totalExpenses,
    fuelExpenses: isNaN(stats.fuelExpenses) ? 0 : stats.fuelExpenses,
    pendingPayments: isNaN(stats.pendingPayments) ? 0 : stats.pendingPayments,
    clearedPayments: isNaN(stats.clearedPayments) ? 0 : stats.clearedPayments,
    processedBiomass: isNaN(stats.processedBiomass) ? 0 : stats.processedBiomass,
    biocharProduced: isNaN(stats.biocharProduced) ? 0 : stats.biocharProduced,
    farmersDeployed: isNaN(stats.farmersDeployed) ? 0 : stats.farmersDeployed,
    landCovered: isNaN(stats.landCovered) ? 0 : stats.landCovered,
  };
}
