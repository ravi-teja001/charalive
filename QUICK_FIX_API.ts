// Quick fix for getRawBiomassProcurements function
// Replace the broken function in src/services/api.ts with this working version

export async function getRawBiomassProcurements(
  stockPointId?: string,
  fromDate?: Date,
  toDate?: Date,
  userId?: string
): Promise<any[]> {
  console.log('🔍 Getting procurement records for user:', userId);
  
  // Simple database query for user records
  try {
    let query = supabase
      .from('raw_biomass_procurement')
      .select('*')
      .eq('created_by', userId || '')
      .order('procurement_date', { ascending: false });

    if (stockPointId) {
      query = query.eq('stock_point_id', stockPointId);
    }
    
    if (fromDate) {
      query = query.gte('procurement_date', fromDate.toISOString());
    }
    
    if (toDate) {
      query = query.lte('procurement_date', toDate.toISOString());
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Database error:', error);
      return [];
    }
    
    console.log('✅ Found records:', data?.length || 0);
    
    return (data || []).map((item) => ({
      id: item.id,
      stockPointId: item.stock_point_id,
      source: item.source,
      vehicleNumber: item.vehicle_number,
      vehicleWeight: item.vehicle_weight,
      vehiclePhoto: item.vehicle_photo,
      grossWeight: item.gross_weight,
      weightRecordPhoto: item.weight_record_photo,
      netWeight: item.net_weight,
      procurementDate: new Date(item.procurement_date),
      createdBy: item.created_by,
      createdByEmail: userId,
      locationLatitude: item.location_latitude != null ? Number(item.location_latitude) : undefined,
      locationLongitude: item.location_longitude != null ? Number(item.location_longitude) : undefined,
      geojsonData: item.geojson_data,
      createdAt: item.created_at ? new Date(item.created_at) : undefined,
      name: item.name || undefined,
      state: item.state || undefined,
      district: item.district || undefined,
      village: item.village || undefined,
      vehicleType: item.vehicle_type || undefined,
      moisture: item.moisture,
      moisturePhoto: item.moisture_photo,
      procurementId: item.procurement_id,
    }));
    
  } catch (error) {
    console.error('❌ Error fetching records:', error);
    return [];
  }
}
