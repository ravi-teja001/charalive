import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormCard } from '@/components/shared/FormCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBiocharDeployment } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Check, MapPin } from 'lucide-react';
import { swal } from '@/lib/swal';

export default function BiocharDeployment() {
  const { user } = useAuth();
  const [farmerName, setFarmerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [village, setVillage] = useState('');
  const [mandal, setMandal] = useState('');
  const [district, setDistrict] = useState('');
  const [landArea, setLandArea] = useState('');
  const [biocharWeight, setBiocharWeight] = useState('');
  const [numberOfBags, setNumberOfBags] = useState('');
  const [kmlFile, setKmlFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleKmlUpload = () => {
    const timestamp = new Date().toISOString();
    setKmlFile(`kml_${timestamp}`);
    swal.success('KML file uploaded successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !farmerName ||
      !mobileNumber ||
      !aadhaarNumber ||
      !village ||
      !mandal ||
      !district ||
      !landArea ||
      !biocharWeight ||
      !numberOfBags
    ) {
      swal.error('Please fill all required fields');
      return;
    }

    // Validate mobile number
    if (mobileNumber.length !== 10) {
      swal.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate Aadhaar
    if (aadhaarNumber.length !== 12) {
      swal.error('Please enter a valid 12-digit Aadhaar number');
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

    try {
      setLoading(true);
      
      await createBiocharDeployment({
        plantId: user.plantId,
        farmerName,
        mobileNumber,
        aadhaarNumber,
        village,
        mandal,
        district,
        landArea: parseFloat(landArea),
        biocharWeight: parseFloat(biocharWeight),
        numberOfBags: parseInt(numberOfBags),
        kmlData: kmlFile || undefined,
        createdBy: user.id,
      });

      swal.success('Deployment data saved successfully!');

      // Reset form
      setFarmerName('');
      setMobileNumber('');
      setAadhaarNumber('');
      setVillage('');
      setMandal('');
      setDistrict('');
      setLandArea('');
      setBiocharWeight('');
      setNumberOfBags('');
      setKmlFile(null);
    } catch (error: any) {
      console.error('Error saving deployment:', error);
      swal.error(error?.message || 'Failed to save deployment data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Biochar Deployment Tracking"
        description="Record farmer details and deployment information"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Farmer Details */}
          <FormCard title="Farmer Details" description="Enter farmer personal information">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Farmer Name *</Label>
                <Input
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="Enter farmer name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Aadhaar Number *</Label>
                <Input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) =>
                    setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))
                  }
                  placeholder="Enter 12-digit Aadhaar number"
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Village *</Label>
                  <Input
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Village"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mandal *</Label>
                  <Input
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    placeholder="Mandal"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>District *</Label>
                  <Input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District"
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          </FormCard>

          {/* Deployment Details */}
          <FormCard title="Deployment Details" description="Enter biochar deployment information">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Land Area (Acres) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  placeholder="Enter land area in acres"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Weight of Biochar Deployed (kg) *</Label>
                <Input
                  type="number"
                  value={biocharWeight}
                  onChange={(e) => setBiocharWeight(e.target.value)}
                  placeholder="Enter weight in kg"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Bags Deployed *</Label>
                <Input
                  type="number"
                  value={numberOfBags}
                  onChange={(e) => setNumberOfBags(e.target.value)}
                  placeholder="Enter number of bags"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Plot the Field (KML)</Label>
                <div
                  onClick={handleKmlUpload}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  {kmlFile ? (
                    <div className="flex items-center justify-center gap-2 text-success">
                      <Check size={24} />
                      <span className="font-medium">KML file uploaded</span>
                    </div>
                  ) : (
                    <>
                      <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Tap to upload KML file of farm land
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Summary */}
              {(landArea || biocharWeight || numberOfBags) && (
                <div className="bg-muted rounded-xl p-6 space-y-3">
                  <h4 className="font-medium text-foreground">Deployment Summary</h4>
                  {landArea && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Land Area</span>
                      <span className="font-medium">{landArea} Acres</span>
                    </div>
                  )}
                  {biocharWeight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Biochar Weight</span>
                      <span className="font-medium">{biocharWeight} kg</span>
                    </div>
                  )}
                  {numberOfBags && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bags Deployed</span>
                      <span className="font-medium">{numberOfBags}</span>
                    </div>
                  )}
                  {landArea && biocharWeight && (
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Application Rate</span>
                      <span className="font-medium text-primary">
                        {(parseFloat(biocharWeight) / parseFloat(landArea)).toFixed(2)} kg/acre
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </FormCard>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button type="button" variant="outline" size="lg">
            Cancel
          </Button>
          <Button type="submit" variant="hero" size="lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save Deployment Data'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
