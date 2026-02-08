import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiFetch } from '@/lib/apiClient';
import { Truck, CalendarIcon, RefreshCw, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EventCalendar } from '@/components/shared/EventCalendar';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  stock_point_id: string | null;
  plant_id: string | null;
  created_at: string;
}

interface UserActivityToday {
  userId: string;
  userName: string;
  email: string;
  trips: number;
  netWeight: number;
}

interface DailyActivityRecord {
  id: number;
  procurementId: string;
  source: string;
  vehicleNumber: string | null;
  netWeight: number;
  procurementDate: string;
  createdAt: string;
}

interface ChartDataPoint {
  date: string;
  trips: number;
  netWeight: number;
}

export default function DailyActivityByUser() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userActivityToday, setUserActivityToday] = useState<UserActivityToday[]>([]);
  const [activityDate, setActivityDate] = useState<Date>(new Date());
  const [activityUserId, setActivityUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedActivityUser, setSelectedActivityUser] = useState<UserActivityToday | null>(null);
  const [detailRecords, setDetailRecords] = useState<DailyActivityRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chartDataForCalendar, setChartDataForCalendar] = useState<ChartDataPoint[]>([]);
  const [selectedRecordForInvoice, setSelectedRecordForInvoice] = useState<{ record: DailyActivityRecord; index: number } | null>(null);

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const dateStr = format(activityDate, 'yyyy-MM-dd');
      const activityUrl = activityUserId
        ? `/api/admin/daily-activity?date=${dateStr}&userId=${encodeURIComponent(activityUserId)}`
        : `/api/admin/daily-activity?date=${dateStr}`;
      const [usersData, activityRes, chartRes] = await Promise.all([
        apiFetch<AdminUser[]>('/api/admin/users'),
        apiFetch<UserActivityToday[]>(activityUrl),
        apiFetch<ChartDataPoint[]>(`/api/admin/chart-data?days=60`),
      ]);
      setUsers(usersData || []);
      setUserActivityToday(activityRes || []);
      setChartDataForCalendar(chartRes || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
      setUsers([]);
      setUserActivityToday([]);
      setChartDataForCalendar([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activityDate, activityUserId]);

  const calendarEvents = Object.fromEntries(
    chartDataForCalendar.map((c) => [c.date, { trips: c.trips, netWeight: c.netWeight }])
  );

  const openActivityDetail = useCallback(
    async (user: UserActivityToday) => {
      if (!user.userId) return;
      setSelectedActivityUser(user);
      setDetailRecords([]);
      setDetailLoading(true);
      try {
        const dateStr = format(activityDate, 'yyyy-MM-dd');
        const records = await apiFetch<DailyActivityRecord[]>(
          `/api/admin/daily-activity/records?date=${dateStr}&userId=${encodeURIComponent(user.userId)}`
        );
        setDetailRecords(records || []);
      } catch {
        setDetailRecords([]);
      } finally {
        setDetailLoading(false);
      }
    },
    [activityDate]
  );

  const printRecordInvoice = useCallback(
    (record: DailyActivityRecord, index: number) => {
      if (!selectedActivityUser) return;
      const dateStr = record.procurementDate ? format(new Date(record.procurementDate), 'dd-MM-yyyy') : format(activityDate, 'dd-MM-yyyy');
      const invNo = record.procurementId || `INV_${format(activityDate, 'yyyyMMdd')}_${(selectedActivityUser.userId || '').slice(-8)}_${record.id}`;
      const vendorName = selectedActivityUser.userName || selectedActivityUser.email || 'Vendor';
      const vendorEmail = selectedActivityUser.email || '—';
      const desc = record.procurementId || `${(record.source || 'Raw biomass').replace(/_/g, ' ')}`;
      const qty = Number(record.netWeight).toLocaleString();
      const printHtml = `
      <div class="invoice">
        <div class="header">
          <h1>Vendor Payment Invoice</h1>
          <p>Daily Activity – Raw Biomass Procurement (Trip ${index + 1})</p>
        </div>
        <table class="dispatch-table">
          <tr><th>Payment Invoice No</th><th>Invoice Date</th></tr>
          <tr><td>${invNo}</td><td>${dateStr}</td></tr>
        </table>
        <div class="party-section">
          <div class="party-box">
            <h3>Vendor (Supplier) Details</h3>
            <div class="party-row"><strong>Vendor Name:</strong> ${vendorName}</div>
            <div class="party-row"><strong>Email:</strong> ${vendorEmail}</div>
            <div class="party-row"><strong>Contact:</strong> —</div>
            <div class="party-row"><strong>Address:</strong> —</div>
          </div>
          <div class="party-box">
            <h3>Buyer Details</h3>
            <div class="party-row"><strong>Buyer Name:</strong> Biochar Bloom</div>
            <div class="party-row"><strong>Address:</strong> —</div>
            <div class="party-row"><strong>Contact:</strong> —</div>
          </div>
        </div>
        <table class="items-table">
          <tr><th class="num">SI No</th><th>Product / Description</th><th class="qty">Quantity (kg)</th></tr>
          <tr><td class="num">1</td><td>${desc}</td><td class="qty">${qty}</td></tr>
          <tr class="total-row"><td class="num">—</td><td>Total Net Weight</td><td class="qty">${qty}</td></tr>
        </table>
      </div>
    `;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Invoice - ${invNo}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; color: #1a1a1a; font-size: 14px; }
            .invoice { max-width: 700px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 20px; }
            .header h1 { font-size: 22px; margin: 0 0 4px 0; font-weight: 700; }
            .header p { font-size: 12px; color: #666; margin: 0; }
            .dispatch-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .dispatch-table th, .dispatch-table td { border: 1px solid #e5e5e5; padding: 10px 12px; text-align: left; }
            .dispatch-table th { background: #f5f5f5; font-weight: 600; width: 50%; }
            .party-section { display: flex; gap: 24px; margin-bottom: 20px; }
            .party-box { flex: 1; border: 1px solid #e5e5e5; padding: 16px; }
            .party-box h3 { font-size: 14px; font-weight: 700; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
            .party-row { font-size: 13px; margin-bottom: 6px; }
            .party-row strong { display: inline-block; min-width: 140px; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th, .items-table td { border: 1px solid #e5e5e5; padding: 10px 12px; text-align: left; }
            .items-table th { background: #f5f5f5; font-weight: 600; }
            .items-table .num { width: 70px; text-align: center; }
            .items-table .qty { text-align: right; }
            .total-row { font-weight: 700; background: #f5f5f5; }
          </style>
        </head>
        <body>${printHtml}</body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    },
    [selectedActivityUser, activityDate]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Daily Activity by User"
          description="Trips and net weight per user for vendor payment"
          action={
            <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing} title="Refresh">
              <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium shrink-0 text-muted-foreground">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('min-w-[160px] justify-start font-normal', !activityDate && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {activityDate ? format(activityDate, 'dd MMM yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 min-w-[320px]" align="start" side="bottom" sideOffset={4}>
                <EventCalendar selectedDate={activityDate} onDateSelect={(d) => setActivityDate(d)} events={calendarEvents} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium shrink-0 text-muted-foreground">User</Label>
            <Select value={activityUserId || 'all'} onValueChange={(v) => setActivityUserId(v === 'all' ? '' : v)}>
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          {error ? (
            <div className="p-8 text-center text-destructive text-sm">{error}</div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userActivityToday.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Trips</TableHead>
                    <TableHead className="font-semibold">Net Weight Collected</TableHead>
                    <TableHead className="font-semibold text-right w-[120px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivityToday.map((a, i) => (
                    <TableRow key={a.userId || a.email || `activity-${i}`} className="transition-colors">
                      <TableCell className="font-medium">{a.userName}</TableCell>
                      <TableCell className="text-muted-foreground">{a.email || '—'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
                          {a.trips}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{a.netWeight.toLocaleString()} kg</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openActivityDetail(a)}>
                          Receipts
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60 mb-4">
                <Truck className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No trips on this date</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                No trips recorded for {format(activityDate, 'EEEE, dd MMM yyyy')}. Try another date or user.
              </p>
            </div>
          )}
        </div>

        {/* Dialog 1: Records table – list of records with Receipts per row */}
        <Dialog open={!!selectedActivityUser} onOpenChange={(open) => { if (!open) { setSelectedActivityUser(null); setSelectedRecordForInvoice(null); } }}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Records – {selectedActivityUser?.userName ?? selectedActivityUser?.email ?? 'User'}
              </DialogTitle>
              {selectedActivityUser && (
                <p className="text-sm text-muted-foreground mt-1">
                  {format(activityDate, 'EEEE, dd MMM yyyy')} · {selectedActivityUser.trips} record(s), {selectedActivityUser.netWeight.toLocaleString()} kg total
                </p>
              )}
            </DialogHeader>
            <div className="overflow-auto flex-1 min-h-0">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : detailRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                  No records found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10 font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Procurement ID</TableHead>
                      <TableHead className="font-semibold">Source</TableHead>
                      <TableHead className="font-semibold">Vehicle</TableHead>
                      <TableHead className="font-semibold text-right">Net Weight</TableHead>
                      <TableHead className="font-semibold">Date / Time</TableHead>
                      <TableHead className="font-semibold text-right w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailRecords.map((r, idx) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium font-mono text-sm">{r.procurementId || '—'}</TableCell>
                        <TableCell className="capitalize">{(r.source || '—').replace(/_/g, ' ')}</TableCell>
                        <TableCell>{r.vehicleNumber || '—'}</TableCell>
                        <TableCell className="text-right font-medium">{Number(r.netWeight).toLocaleString()} kg</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {r.procurementDate ? format(new Date(r.procurementDate), 'dd MMM yyyy') : '—'}
                          {r.createdAt ? ` · ${format(new Date(r.createdAt), 'HH:mm')}` : ''}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedRecordForInvoice({ record: r, index: idx })}>
                            Receipts
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog 2: Single invoice – shown when Receipts is clicked on a record row */}
        {selectedActivityUser && selectedRecordForInvoice && (
          <Dialog open={!!selectedRecordForInvoice} onOpenChange={(open) => !open && setSelectedRecordForInvoice(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="border-b bg-muted/50 px-4 py-2 flex items-center justify-between">
                  <span className="font-semibold text-sm">Invoice {selectedRecordForInvoice.index + 1} of {detailRecords.length}</span>
                  <Button variant="default" size="sm" onClick={() => printRecordInvoice(selectedRecordForInvoice.record, selectedRecordForInvoice.index)} className="bg-primary">
                    <Printer className="h-4 w-4 mr-1.5" />
                    Print invoice
                  </Button>
                </div>
                <div className="p-4 space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-muted/50">
                        <TableHead className="font-semibold">Payment Invoice No</TableHead>
                        <TableHead className="font-semibold">Invoice Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-sm">{selectedRecordForInvoice.record.procurementId || `INV_${format(activityDate, 'yyyyMMdd')}_${(selectedActivityUser.userId || '').slice(-8)}_${selectedRecordForInvoice.record.id}`}</TableCell>
                        <TableCell>{selectedRecordForInvoice.record.procurementDate ? format(new Date(selectedRecordForInvoice.record.procurementDate), 'dd-MM-yyyy') : format(activityDate, 'dd-MM-yyyy')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Vendor (Supplier) Details</h4>
                      <div className="space-y-1.5 text-sm">
                        <p><span className="text-muted-foreground font-medium">Vendor Name:</span> {selectedActivityUser.userName || selectedActivityUser.email || '—'}</p>
                        <p><span className="text-muted-foreground font-medium">Email:</span> {selectedActivityUser.email || '—'}</p>
                        <p><span className="text-muted-foreground font-medium">Contact:</span> —</p>
                        <p><span className="text-muted-foreground font-medium">Address:</span> —</p>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Buyer Details</h4>
                      <div className="space-y-1.5 text-sm">
                        <p><span className="text-muted-foreground font-medium">Buyer Name:</span> Biochar Bloom</p>
                        <p><span className="text-muted-foreground font-medium">Address:</span> —</p>
                        <p><span className="text-muted-foreground font-medium">Contact:</span> —</p>
                      </div>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-muted/50">
                        <TableHead className="w-14 font-semibold text-center">SI No</TableHead>
                        <TableHead className="font-semibold">Product / Description</TableHead>
                        <TableHead className="font-semibold text-right w-28">Quantity (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-center text-muted-foreground">1</TableCell>
                        <TableCell>{selectedRecordForInvoice.record.procurementId || (selectedRecordForInvoice.record.source || 'Raw biomass').replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-right font-medium">{Number(selectedRecordForInvoice.record.netWeight).toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/40 font-semibold">
                        <TableCell className="text-center">—</TableCell>
                        <TableCell>Total Net Weight</TableCell>
                        <TableCell className="text-right">{Number(selectedRecordForInvoice.record.netWeight).toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
