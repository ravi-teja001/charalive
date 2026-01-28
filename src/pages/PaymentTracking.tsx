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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getStockPoints, getRawBiomassProcurements, getExpenses } from '@/services/api';
import { CalendarIcon, Search, Weight, Receipt, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { swal } from '@/lib/swal';

export default function PaymentTracking() {
  const [stockPoints, setStockPoints] = useState<any[]>([]);
  const [stockPointId, setStockPointId] = useState('');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [pricePerTon, setPricePerTon] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    totalWeight: 0,
    totalExpenses: 0,
    trips: 0,
  });

  useEffect(() => {
    loadStockPoints();
  }, []);

  const loadStockPoints = async () => {
    try {
      const data = await getStockPoints();
      setStockPoints(data);
    } catch (error) {
      console.error('Error loading stock points:', error);
    }
  };

  const netWeightTons = results.totalWeight / 1000;
  const finalAmount =
    netWeightTons * (parseFloat(pricePerTon) || 0) - results.totalExpenses;

  const handleSearch = async () => {
    if (!stockPointId || !fromDate || !toDate) {
      swal.error('Please select stock point and date range');
      return;
    }

    try {
      setLoading(true);
      setShowResults(false);

      const [procurements, expenses] = await Promise.all([
        getRawBiomassProcurements(stockPointId, fromDate, toDate),
        getExpenses(stockPointId, fromDate, toDate),
      ]);

      const totalWeight = procurements.reduce((sum, p) => sum + p.netWeight, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

      setResults({
        totalWeight,
        totalExpenses,
        trips: procurements.length,
      });

      setShowResults(true);
      swal.success('Data fetched successfully');
    } catch (error: any) {
      console.error('Error fetching data:', error);
      swal.error(error?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Payment Tracking"
        description="Track payments and payouts for stock points"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <FormCard title="Filter Options" description="Select stock point and date range">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Stock Point / Vendor *</Label>
                <Select value={stockPointId} onValueChange={setStockPointId}>
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
                <Label>From Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-12 justify-start text-left font-normal',
                        !fromDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>To Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-12 justify-start text-left font-normal',
                        !toDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Price per Ton (₹)</Label>
                <Input
                  type="number"
                  value={pricePerTon}
                  onChange={(e) => setPricePerTon(e.target.value)}
                  placeholder="Enter price per ton"
                  className="h-12"
                />
              </div>

              <Button
                type="button"
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleSearch}
                disabled={loading}
              >
                <Search size={18} />
                {loading ? 'Fetching...' : 'Fetch Data'}
              </Button>
            </div>
          </FormCard>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {showResults ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Weight size={20} className="text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Total Weight</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {netWeightTons.toFixed(2)} T
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {results.totalWeight.toLocaleString()} kg
                  </p>
                </div>

                <div className="bg-card rounded-2xl shadow-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Receipt size={20} className="text-destructive" />
                    </div>
                    <span className="text-sm text-muted-foreground">Total Expenses</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    ₹{results.totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {results.trips} trips
                  </p>
                </div>

                <div className="bg-card rounded-2xl shadow-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <CreditCard size={20} className="text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">Price/Ton</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    ₹{parseFloat(pricePerTon || '0').toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Final Calculation */}
              <FormCard title="Payment Summary" description="Final amount calculation">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">
                      Raw Biomass Weight × Price/Ton
                    </span>
                    <span className="font-medium">
                      {netWeightTons.toFixed(2)} T × ₹
                      {parseFloat(pricePerTon || '0').toLocaleString()} = ₹
                      {(netWeightTons * parseFloat(pricePerTon || '0')).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Less: Total Expenses</span>
                    <span className="font-medium text-destructive">
                      - ₹{results.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-4 bg-primary/5 rounded-xl px-4 -mx-4">
                    <span className="font-semibold text-lg">Final Amount</span>
                    <span
                      className={cn(
                        'font-display text-3xl font-bold',
                        finalAmount >= 0 ? 'text-success' : 'text-destructive'
                      )}
                    >
                      ₹{finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </FormCard>
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Select Filters
              </h3>
              <p className="text-muted-foreground">
                Choose a stock point and date range to view payment details
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
