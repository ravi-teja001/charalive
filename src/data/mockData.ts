import { Vehicle, StockPoint, Plant } from '@/types/biochar';

export const vehicles: Vehicle[] = [
  { id: 'v1', vehicleNumber: 'TS09AB1234', weight: 2500, type: 'registered' },
  { id: 'v2', vehicleNumber: 'TS09CD5678', weight: 3000, type: 'registered' },
  { id: 'v3', vehicleNumber: 'AP07EF9012', weight: 2800, type: 'registered' },
  { id: 'v4', vehicleNumber: 'TS10GH3456', weight: 3500, type: 'registered' },
  { id: 'v5', vehicleNumber: 'AP05IJ7890', weight: 2200, type: 'registered' },
];

export const stockPoints: StockPoint[] = [
  { id: 'sp1', name: 'Stock Point - Warangal', location: 'Warangal, Telangana' },
  { id: 'sp2', name: 'Stock Point - Karimnagar', location: 'Karimnagar, Telangana' },
  { id: 'sp3', name: 'Stock Point - Nizamabad', location: 'Nizamabad, Telangana' },
  { id: 'sp4', name: 'Stock Point - Khammam', location: 'Khammam, Telangana' },
  { id: 'sp5', name: 'Stock Point - Adilabad', location: 'Adilabad, Telangana' },
];

export const plants: Plant[] = [
  { id: 'plant1', name: 'Biochar Processing Plant - Hyderabad', location: 'Hyderabad, Telangana' },
  { id: 'plant2', name: 'Biochar Processing Plant - Vijayawada', location: 'Vijayawada, Andhra Pradesh' },
];

export const expenseTypes = [
  { value: 'fuel', label: 'Fuel Expenses' },
  { value: 'cash_advance', label: 'Cash Advance' },
  { value: 'other', label: 'Other Expenses' },
];

export const paymentModes = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
];

export const biomassSource = [
  { value: 'cotton_stalks', label: 'Cotton stalks' },
  { value: 'chilli_stalks', label: 'Chilli stalks' },
];
