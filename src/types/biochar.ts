export type UserRole = 'supervisor_stockpoint' | 'incharge' | 'supervisor_plant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  stockPointId?: string;
  plantId?: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  weight: number;
  type: string; // Can be any vehicle type: 'Truck', 'Trailer', 'Tempo', 'Auto', etc.
  name?: string;
  district?: string;
  subDistrict?: string;
  village?: string;
  state?: string;
}

export interface StockPoint {
  id: string;
  name: string;
  location: string;
}

export interface Plant {
  id: string;
  name: string;
  location: string;
}

export interface RawBiomassProcurement {
  id: string;
  procurementId?: string; // Human-readable procurement ID (e.g., PROC-20250127-001)
  stockPointId: string;
  source: 'cotton_stalks' | 'chilli_stalks';
  vehicleNumber: string;
  vehicleWeight: number;
  vehiclePhoto: string;
  grossWeight: number;
  weightRecordPhoto: string;
  netWeight: number;
  procurementDate: Date;
  createdBy: string;
  createdByEmail?: string; // Email of the user who created this record
  locationLatitude?: number;
  locationLongitude?: number;
  geojsonData?: any;
  createdAt?: Date;
  name?: string;
  state?: string;
  district?: string;
  village?: string;
  vehicleType?: string;
  moisture?: number; // Moisture percentage value
}

export interface Expense {
  id: string;
  stockPointId: string;
  date: Date;
  amount: number;
  type: 'fuel' | 'cash_advance' | 'other';
  paymentMode: 'cash' | 'upi';
  receiptUrl: string;
  createdBy: string;
  createdAt: Date;
}

export interface ProcessedBiomassProcurement {
  id: string;
  plantId: string;
  sourceStockPointId: string;
  vehicleNumber: string;
  vehicleWeight: number;
  vehiclePhoto: string;
  vehiclePhotoLatitude?: number;
  vehiclePhotoLongitude?: number;
  grossWeight: number;
  weightRecordPhoto: string;
  weightPhotoLatitude?: number;
  weightPhotoLongitude?: number;
  netWeight: number;
  procurementDate: Date;
  createdBy: string;
}

export interface BiocharDeployment {
  id: string;
  plantId: string;
  farmerName: string;
  mobileNumber: string;
  aadhaarNumber: string;
  village: string;
  mandal: string;
  district: string;
  landArea: number;
  biocharWeight: number;
  numberOfBags: number;
  kmlData?: string;
  createdBy: string;
  createdAt: Date;
}

export interface PaymentTracking {
  stockPointId: string;
  fromDate: Date;
  toDate: Date;
  totalRawBiomassWeight: number;
  pricePerTon: number;
  totalExpenses: number;
  finalAmount: number;
}
