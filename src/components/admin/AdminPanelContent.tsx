import { useEffect, useState, useCallback } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/apiClient';
import {
  RefreshCw,
  Truck,
  Weight,
  Factory,
  Leaf,
  UserPlus,
  MapPin,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  stock_point_id: string | null;
  plant_id: string | null;
  created_at: string;
}

interface AdminStats {
  totalTripsToday: number;
  netWeightToday: number;
  processedBiomass: number;
  biocharProduced: number;
  farmersDeployed: number;
  landCovered: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  trips: number;
  netWeight: number;
  processedBiomass: number;
  biocharProduced: number;
  farmersDeployed: number;
  landCovered: number;
}

interface DonutData {
  tripsByStockPoint: { name: string; value: number }[];
  netWeightBySource: { name: string; value: number }[];
  usersByRole: { name: string; value: number }[];
}

const DONUT_COLORS = ['hsl(var(--primary))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(260 80% 50%)', 'hsl(0 72% 51%)'];

export function AdminPanelContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [donutData, setDonutData] = useState<DonutData | null>(null);
  const [chartDays, setChartDays] = useState(14);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [usersData, statsData] = await Promise.all([
        apiFetch<AdminUser[]>('/api/admin/users'),
        apiFetch<AdminStats>('/api/admin/stats'),
      ]);
      setUsers(usersData || []);
      setStats(statsData || null);
      setLoading(false);
      setRefreshing(false);
      try {
        const [chartDataRes, donutDataRes] = await Promise.all([
          apiFetch<ChartDataPoint[]>(`/api/admin/chart-data?days=${chartDays}`),
          apiFetch<DonutData>('/api/admin/donut-data'),
        ]);
        setChartData(chartDataRes || []);
        setDonutData(donutDataRes || null);
      } catch {
        setChartData([]);
        setDonutData(null);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
      setUsers([]);
      setStats(null);
      setChartData([]);
      setDonutData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chartDays]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="space-y-8">
      {/* System-wide stats */}
      {!loading && !error && stats && (
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Trips"
              value={stats.totalTripsToday}
              icon={<Truck className="w-6 h-6" />}
              accent="primary"
            />
            <StatCard
              title="Net Weight Collected"
              value={`${stats.netWeightToday.toLocaleString()} kg`}
              icon={<Weight className="w-6 h-6" />}
              accent="success"
            />
            <StatCard
              title="Processed Biomass"
              value={`${stats.processedBiomass.toLocaleString()} kg`}
              icon={<Factory className="w-6 h-6" />}
              accent="blue"
            />
            <StatCard
              title="Biochar Produced"
              value={`${stats.biocharProduced.toLocaleString()} kg`}
              icon={<Leaf className="w-6 h-6" />}
              accent="emerald"
            />
            <StatCard
              title="Farmers Deployed"
              value={stats.farmersDeployed}
              icon={<UserPlus className="w-6 h-6" />}
              accent="amber"
            />
            <StatCard
              title="Land Covered"
              value={`${stats.landCovered.toLocaleString()} acres`}
              icon={<MapPin className="w-6 h-6" />}
              accent="emerald"
            />
          </div>
        </section>
      )}

      {/* Charts */}
      {!loading && !error && chartData.length > 0 && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Select value={String(chartDays)} onValueChange={(v) => setChartDays(parseInt(v, 10))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => loadUsers(true)}
                disabled={refreshing}
                title="Refresh charts"
              >
                <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="font-semibold mb-4">Total Trips & Net Weight Collected</h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-medium mb-2">{payload[0]?.payload?.label}</p>
                            <p className="text-sm">Trips: {payload[0]?.payload?.trips}</p>
                            <p className="text-sm">Net Weight: {Number(payload[0]?.payload?.netWeight).toLocaleString()} kg</p>
                          </div>
                        ) : null
                      }
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="trips" fill="hsl(var(--primary))" name="Trips" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="netWeight" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={false} name="Net Weight (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="font-semibold mb-4">Processed Biomass & Biochar Produced</h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-medium mb-2">{payload[0]?.payload?.label}</p>
                            <p className="text-sm">Processed Biomass: {Number(payload[0]?.payload?.processedBiomass).toLocaleString()} kg</p>
                            <p className="text-sm">Biochar Produced: {Number(payload[0]?.payload?.biocharProduced).toLocaleString()} kg</p>
                          </div>
                        ) : null
                      }
                    />
                    <Legend />
                    <Area type="monotone" dataKey="processedBiomass" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" name="Processed Biomass (kg)" />
                    <Area type="monotone" dataKey="biocharProduced" stroke="hsl(142 76% 36%)" fill="hsl(142 76% 36% / 0.3)" name="Biochar (kg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 sm:p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4">Farmers Deployed & Land Covered</h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-medium mb-2">{payload[0]?.payload?.label}</p>
                            <p className="text-sm">Farmers: {payload[0]?.payload?.farmersDeployed}</p>
                            <p className="text-sm">Land Covered: {Number(payload[0]?.payload?.landCovered).toLocaleString()} acres</p>
                          </div>
                        ) : null
                      }
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="farmersDeployed" fill="hsl(var(--primary))" name="Farmers Deployed" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="landCovered" fill="hsl(142 76% 36%)" name="Land (acres)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Donut charts */}
      {!loading && !error && donutData && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Breakdown by Category</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Distribution across stock points and sources</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="font-semibold mb-4">Trips by Stock Point</h3>
              <div className="h-[200px]">
                {donutData.tripsByStockPoint.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData.tripsByStockPoint} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} isAnimationActive={false}>
                        {donutData.tripsByStockPoint.map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value, 'Trips']}
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <p className="font-medium">{payload[0]?.name}</p>
                              <p className="text-sm text-muted-foreground">{payload[0]?.value} trips</p>
                            </div>
                          ) : null
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                    <Truck className="w-10 h-10 opacity-40" />
                    <p>No trips recorded yet</p>
                  </div>
                )}
              </div>
              {donutData.tripsByStockPoint.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                  {donutData.tripsByStockPoint.map((item, i) => {
                    const total = donutData.tripsByStockPoint.reduce((s, d) => s + d.value, 0);
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium text-foreground">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="font-semibold mb-4">Net Weight by Source (kg)</h3>
              <div className="h-[200px]">
                {donutData.netWeightBySource.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData.netWeightBySource.filter((d) => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} isAnimationActive={false}>
                        {donutData.netWeightBySource.filter((d) => d.value > 0).map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${Number(value).toLocaleString()} kg`, 'Net Weight']}
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <p className="font-medium">{payload[0]?.name}</p>
                              <p className="text-sm text-muted-foreground">{Number(payload[0]?.value).toLocaleString()} kg</p>
                            </div>
                          ) : null
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                    <Weight className="w-10 h-10 opacity-40" />
                    <p>No procurement data yet</p>
                  </div>
                )}
              </div>
              {donutData.netWeightBySource.some((d) => d.value > 0) && (
                <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                  {donutData.netWeightBySource
                    .filter((d) => d.value > 0)
                    .map((item, i) => {
                      const filtered = donutData.netWeightBySource.filter((d) => d.value > 0);
                      const total = filtered.reduce((s, d) => s + d.value, 0);
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
                      return (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium text-foreground">{pct}%</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            <div className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="font-semibold mb-4">Breakdown by Role</h3>
              <div className="h-[200px]">
                {donutData.usersByRole.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData.usersByRole} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} isAnimationActive={false}>
                        {donutData.usersByRole.map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value, 'Users']}
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <p className="font-medium">{payload[0]?.name}</p>
                              <p className="text-sm text-muted-foreground">{payload[0]?.value} users</p>
                            </div>
                          ) : null
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                    <Users className="w-10 h-10 opacity-40" />
                    <p>No users yet</p>
                  </div>
                )}
              </div>
              {donutData.usersByRole.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                  {donutData.usersByRole.map((item, i) => {
                    const total = donutData.usersByRole.reduce((s, d) => s + d.value, 0);
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium text-foreground">{pct}%</span>
                        <span className="text-muted-foreground">({item.value} users)</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => loadUsers()}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
