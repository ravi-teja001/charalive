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
import { getVehicles, getStockPoints, createProcessedBiomassProcurement, getProcessedBiomassProcurements } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Upload, Check } from 'lucide-react';
import { swal } from '@/lib/swal';

export default function ProcessedBiomassProcurement() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stockPoints, setStockPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [procurementRecords, setProcurementRecords] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadProcurementRecords();
  }, []);

  const loadData = async () => {
    if (!user?.id) {
      return;
    }
    try {
      const [vehiclesData, stockPointsData] = await Promise.all([
        getVehicles(user.id),
        getStockPoints(),
      ]);
      setVehicles(vehiclesData);
      setStockPoints(stockPointsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadProcurementRecords = async () => {
    try {
      const records = await getProcessedBiomassProcurements();
      setProcurementRecords(records);
    } catch (error) {
      console.error('Error loading procurement records:', error);
    }
  };

  const [sourceStockPoint, setSourceStockPoint] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [isOtherVehicle, setIsOtherVehicle] = useState(false);
  const [otherVehicleNumber, setOtherVehicleNumber] = useState('');
  const [otherVehicleWeight, setOtherVehicleWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);
  const [weightPhoto, setWeightPhoto] = useState<string | null>(null);
  const [vehiclePhotoLocation, setVehiclePhotoLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weightPhotoLocation, setWeightPhotoLocation] = useState<{ lat: number; lng: number } | null>(null);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const vehicleWeight = isOtherVehicle
    ? parseFloat(otherVehicleWeight) || 0
    : selectedVehicle?.weight || 0;
  const netWeight = Math.max(0, (parseFloat(grossWeight) || 0) - vehicleWeight);

  const handleVehicleChange = (value: string) => {
    if (value === 'other') {
      setIsOtherVehicle(true);
      setVehicleId('');
    } else {
      setIsOtherVehicle(false);
      setVehicleId(value);
    }
  };

  const handlePhotoCapture = (type: 'vehicle' | 'weight') => {
    if (!navigator.geolocation) {
      swal.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const timestamp = new Date().toISOString();
        if (type === 'vehicle') {
          setVehiclePhoto(`photo_vehicle_${timestamp}`);
          setVehiclePhotoLocation(coords);
          swal.success('Vehicle photo captured with geo-tag');
        } else {
          setWeightPhoto(`photo_weight_${timestamp}`);
          setWeightPhotoLocation(coords);
          swal.success('Weight record photo captured with geo-tag');
        }
      },
      (error) => {
        swal.error('Failed to get location: ' + error.message);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !sourceStockPoint ||
      (!vehicleId && !isOtherVehicle) ||
      !grossWeight ||
      !vehiclePhoto ||
      !weightPhoto
    ) {
      swal.error('Please fill all required fields');
      return;
    }

    if (!user) {
      swal.error('You must be logged in to submit data');
      return;
    }

    if (!user.plantId) {
      swal.error('Plant not assigned');
      return;
    }

    if (!vehiclePhotoLocation || !weightPhotoLocation) {
      swal.error('Location not captured for one or more photos');
      return;
    }

    try {
      setLoading(true);
      await createProcessedBiomassProcurement({
        plantId: user.plantId,
        sourceStockPointId: sourceStockPoint,
        vehicleNumber: isOtherVehicle ? otherVehicleNumber : selectedVehicle?.vehicleNumber || '',
        vehicleWeight,
        vehiclePhoto,
        vehiclePhotoLatitude: vehiclePhotoLocation?.lat ?? null,
        vehiclePhotoLongitude: vehiclePhotoLocation?.lng ?? null,
        grossWeight: parseFloat(grossWeight),
        weightRecordPhoto: weightPhoto,
        weightPhotoLatitude: weightPhotoLocation?.lat ?? null,
        weightPhotoLongitude: weightPhotoLocation?.lng ?? null,
        netWeight,
        procurementDate: new Date(),
        createdBy: user.id,
      });

      swal.success('Processed biomass data saved successfully!');

      // Reset form
      setSourceStockPoint('');
      setVehicleId('');
      setIsOtherVehicle(false);
      setOtherVehicleNumber('');
      setOtherVehicleWeight('');
      setGrossWeight('');
      setVehiclePhoto(null);
      setWeightPhoto(null);
      setVehiclePhotoLocation(null);
      setWeightPhotoLocation(null);

      await loadProcurementRecords(); // Refresh table after save
    } catch (error: any) {
      if (error?.name === 'AbortError' || error?.message?.includes('AbortError')) {
        // Ignore abort errors
        return;
      }
      console.error('Error saving processed biomass:', error);
      swal.error(error?.message || 'Failed to save processed biomass data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Processed Biomass Procurement"
        description="Record incoming processed biomass from stock points"
      />

      {/* Procurement Records Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Procurement Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-2 py-1 border">Date</th>
                <th className="px-2 py-1 border">Stock Point</th>
                <th className="px-2 py-1 border">Vehicle</th>
                <th className="px-2 py-1 border">Gross Weight</th>
                <th className="px-2 py-1 border">Net Weight</th>
                <th className="px-2 py-1 border">Created By</th>
              </tr>
            </thead>
            <tbody>
              {procurementRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-2">No records found.</td>
                </tr>
              ) : (
                procurementRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td className="border px-2 py-1">{rec.procurementDate?.toLocaleDateString?.() || ''}</td>
                    <td className="border px-2 py-1">{rec.sourceStockPointId}</td>
                    <td className="border px-2 py-1">{rec.vehicleNumber}</td>
                    <td className="border px-2 py-1">{rec.grossWeight}</td>
                    <td className="border px-2 py-1">{rec.netWeight}</td>
                    <td className="border px-2 py-1">{rec.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip Details */}
          <FormCard title="Trip Details" description="Enter source stock point and vehicle">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Source Stock Point *</Label>
                <Select value={sourceStockPoint} onValueChange={setSourceStockPoint}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select stock point" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockPoints.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {sp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vehicle Number *</Label>
                <Select
                  value={isOtherVehicle ? 'other' : vehicleId}
                  onValueChange={handleVehicleChange}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.vehicleNumber} ({v.weight} kg)
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (Enter manually)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isOtherVehicle && (
                <>
                  <div className="space-y-2">
                    <Label>Enter Vehicle Number *</Label>
                    <Input
                      value={otherVehicleNumber}
                      onChange={(e) => setOtherVehicleNumber(e.target.value)}
                      placeholder="e.g., TS09XX1234"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Weight (kg) *</Label>
                    <Input
                      type="number"
                      value={otherVehicleWeight}
                      onChange={(e) => setOtherVehicleWeight(e.target.value)}
                      placeholder="Enter weight in kg"
                      className="h-12"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Vehicle Photo with Processed Biomass *</Label>
                <div
                  onClick={() => handlePhotoCapture('vehicle')}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  {vehiclePhoto ? (
                    <div className="flex items-center justify-center gap-2 text-success">
                      <Check size={24} />
                      <span className="font-medium">Photo captured</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Tap to capture geo-tagged photo
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </FormCard>

          {/* Weight Details */}
          <FormCard title="Weight Details" description="Record gross and net weight">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Gross Weight of Processed Biomass (kg) *</Label>
                <Input
                  type="number"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="Enter gross weight"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Weight Record Photo *</Label>
                <div
                  onClick={() => handlePhotoCapture('weight')}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  {weightPhoto ? (
                    <div className="flex items-center justify-center gap-2 text-success">
                      <Check size={24} />
                      <span className="font-medium">Photo captured</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Tap to capture weight record photo
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Net Weight Display */}
              <div className="bg-muted rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Vehicle Weight</span>
                  <span className="font-medium">{vehicleWeight.toLocaleString()} kg</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Gross Weight</span>
                  <span className="font-medium">
                    {parseFloat(grossWeight || '0').toLocaleString()} kg
                  </span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Net Weight</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      {netWeight.toLocaleString()} kg
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    = Gross Weight − Vehicle Weight
                  </p>
                </div>
              </div>
            </div>
          </FormCard>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button type="button" variant="outline" size="lg">
            Cancel
          </Button>
          <Button type="submit" variant="hero" size="lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save Procurement Data'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
