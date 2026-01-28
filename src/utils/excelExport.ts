import * as XLSX from 'xlsx';

export interface ProcurementRecord {
  id: string;
  date: string;
  source: string;
  vehicle: string;
  grossWeight: number;
  netWeight: number;
  location?: string;
  hasGeoJSON: boolean;
}

export function exportToExcel(records: ProcurementRecord[], filename = 'procurement_records.xlsx') {
  // Prepare data for Excel
  const excelData = records.map((record) => ({
    Date: record.date,
    Source: record.source,
    'Vehicle Number': record.vehicle,
    'Gross Weight (kg)': record.grossWeight,
    'Net Weight (kg)': record.netWeight,
    Location: record.location || 'N/A',
    'Has GeoJSON': record.hasGeoJSON ? 'Yes' : 'No',
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 10 }, // Source
    { wch: 15 }, // Vehicle Number
    { wch: 15 }, // Gross Weight
    { wch: 15 }, // Net Weight
    { wch: 25 }, // Location
    { wch: 12 }, // Has GeoJSON
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Procurement Records');

  // Generate Excel file and download
  XLSX.writeFile(wb, filename);
}
