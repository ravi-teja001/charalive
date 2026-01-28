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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { expenseTypes, paymentModes } from '@/data/mockData';
import { getStockPoints, createExpense, getExpenses } from '@/services/api';
import { Expense } from '@/types/biochar';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarIcon, Upload, Check, RefreshCw, Receipt as ReceiptIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { swal } from '@/lib/swal';

export default function Expenses() {
  const { user } = useAuth();
  const [stockPoints, setStockPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  // Form state
  const [stockPointId, setStockPointId] = useState('');
  const [date, setDate] = useState<Date>();
  const [amount, setAmount] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);

  // Filter state
  const [filterStockPoint, setFilterStockPoint] = useState('');
  const [filterExpenseType, setFilterExpenseType] = useState('');
  const [filterFromDate, setFilterFromDate] = useState<Date>();
  const [filterToDate, setFilterToDate] = useState<Date>();

  useEffect(() => {
    loadStockPoints();
  }, []);

  // Load expenses when user is available or filters change
  useEffect(() => {
    if (user?.id) {
      loadExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStockPoint, filterExpenseType, filterFromDate, filterToDate, user?.id]);

  const loadStockPoints = async () => {
    try {
      const data = await getStockPoints();
      setStockPoints(data);
    } catch (error) {
      console.error('Error loading stock points:', error);
    }
  };

  const loadExpenses = async () => {
    if (!user?.id) {
      console.log('No user found, skipping expense load');
      return;
    }
    
    try {
      setLoadingExpenses(true);
      console.log('Loading expenses for incharge:', user.id);
      const data = await getExpenses(
        filterStockPoint || undefined,
        filterFromDate,
        filterToDate,
        filterExpenseType || undefined,
        user.id // Only show expenses created by this incharge
      );
      console.log('Expenses loaded:', data.length);
      setExpenses(data || []);
    } catch (error: any) {
      console.error('Error loading expenses:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      swal.error(error?.message || 'Failed to load expenses');
      setExpenses([]); // Set empty array on error
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleReceiptUpload = () => {
    const timestamp = new Date().toISOString();
    setReceipt(`receipt_${timestamp}`);
    swal.success('Receipt uploaded successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockPointId || !date || !amount || !expenseType || !paymentMode) {
      swal.error('Please fill all required fields');
      return;
    }

    if (!user) {
      swal.error('You must be logged in to submit data');
      return;
    }

    try {
      setLoading(true);
      
      await createExpense({
        stockPointId,
        date,
        amount: parseFloat(amount),
        type: expenseType as 'fuel' | 'cash_advance' | 'other',
        paymentMode: paymentMode as 'cash' | 'upi',
        receiptUrl: receipt || '',
        createdBy: user.id,
      });

      swal.success('Expense logged successfully!');

      // Reset form
      setStockPointId('');
      setDate(undefined);
      setAmount('');
      setExpenseType('');
      setPaymentMode('');
      setReceipt(null);

      // Reload expenses
      await loadExpenses();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      swal.error(error?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterStockPoint('');
    setFilterExpenseType('');
    setFilterFromDate(undefined);
    setFilterToDate(undefined);
  };

  const getStockPointName = (id: string) => {
    const sp = stockPoints.find(s => s.id === id);
    return sp?.name || id;
  };

  const getExpenseTypeLabel = (type: string) => {
    const et = expenseTypes.find(t => t.value === type);
    return et?.label || type;
  };

  const getPaymentModeLabel = (mode: string) => {
    const pm = paymentModes.find(m => m.value === mode);
    return pm?.label || mode;
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Safety check - ensure page always renders
  if (!user) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Log Expenses"
          description="Record and manage expenses for stock points"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please log in to access expenses.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Log Expenses"
        description="Record and manage expenses for stock points"
      />

      <div className="space-y-6">
        {/* Expense Form */}
        <form onSubmit={handleSubmit}>
          <div className="max-w-2xl">
            <FormCard title={<span className="text-primary">Expense Details</span>} description="Enter expense information">
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
                  <Label>Date of Expense *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full h-12 justify-start text-left font-normal',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Expense Amount (₹) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type of Expense *</Label>
                  <Select value={expenseType} onValueChange={setExpenseType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Mode *</Label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Attach Receipt</Label>
                  <div
                    onClick={handleReceiptUpload}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    {receipt ? (
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                        <Check size={24} />
                        <span className="font-medium">Receipt uploaded</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Tap to capture or attach receipt
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <Button type="button" variant="outline" size="lg" onClick={() => {
                  setStockPointId('');
                  setDate(undefined);
                  setAmount('');
                  setExpenseType('');
                  setPaymentMode('');
                  setReceipt(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" size="lg" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </FormCard>
          </div>
        </form>

        {/* Expenses List with Filters */}
        <FormCard
          title={<span className="text-primary">Expense Records</span>}
          description="View and filter your expense records"
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadExpenses}
                disabled={loadingExpenses}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loadingExpenses && "animate-spin")} />
                Refresh
              </Button>
            </div>
          }
        >
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Stock Point</Label>
              <Select value={filterStockPoint || "all"} onValueChange={(value) => setFilterStockPoint(value === "all" ? "" : value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Stock Points" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Points</SelectItem>
                  {stockPoints.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Expense Type</Label>
              <Select value={filterExpenseType || "all"} onValueChange={(value) => setFilterExpenseType(value === "all" ? "" : value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-10 justify-start text-left font-normal text-sm',
                      !filterFromDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterFromDate ? format(filterFromDate, 'dd/MM/yyyy') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card" align="start">
                  <Calendar
                    mode="single"
                    selected={filterFromDate}
                    onSelect={setFilterFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-10 justify-start text-left font-normal text-sm',
                      !filterToDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterToDate ? format(filterToDate, 'dd/MM/yyyy') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card" align="start">
                  <Calendar
                    mode="single"
                    selected={filterToDate}
                    onSelect={setFilterToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(filterStockPoint || filterExpenseType || filterFromDate || filterToDate) && (
            <div className="mb-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Summary */}
          {expenses.length > 0 && (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Expenses: {expenses.length} records
                </span>
                <span className="text-lg font-bold text-primary">
                  Total Amount: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Expenses Table */}
          {loadingExpenses ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-border">
              <ReceiptIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-base font-medium text-muted-foreground mb-2">
                No expenses found
              </p>
              <p className="text-sm text-muted-foreground">
                Create your first expense using the form above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/50 bg-background/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary border-b-2 border-primary/20">
                    <TableHead className="font-semibold text-white h-12">Date</TableHead>
                    <TableHead className="font-semibold text-white h-12">Stock Point</TableHead>
                    <TableHead className="font-semibold text-white h-12">Type</TableHead>
                    <TableHead className="font-semibold text-white h-12 text-right">Amount (₹)</TableHead>
                    <TableHead className="font-semibold text-white h-12">Payment Mode</TableHead>
                    <TableHead className="font-semibold text-white h-12">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                      <TableCell className="font-medium">
                        {format(expense.date, 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>{getStockPointName(expense.stockPointId)}</TableCell>
                      <TableCell>{getExpenseTypeLabel(expense.type)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{getPaymentModeLabel(expense.paymentMode)}</TableCell>
                      <TableCell>
                        {expense.receiptUrl ? (
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Available</span>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </FormCard>
      </div>
    </DashboardLayout>
  );
}
