import { useEffect, useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { Shield, Users, UserCog, Search, RefreshCw, UserCheck, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  stock_point_id: string | null;
  plant_id: string | null;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  supervisor_stockpoint: 'Stock Point Supervisor',
  incharge: 'Incharge',
  supervisor_plant: 'Plant Supervisor',
};

const roleBadgeClass: Record<string, string> = {
  admin: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  supervisor_stockpoint: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  incharge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  supervisor_plant: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30',
};

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor_stockpoint', label: 'Stock Point Supervisor' },
  { value: 'incharge', label: 'Incharge' },
  { value: 'supervisor_plant', label: 'Plant Supervisor' },
];

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: '' });
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await apiFetch<AdminUser[]>('/api/admin/users');
      setUsers(data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEdit = (u: AdminUser) => {
    setEditUser(u);
    setEditForm({ name: u.name || '', role: u.role || '' });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const updated = await apiFetch<AdminUser>(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editForm.name.trim(), role: editForm.role }),
      });
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, ...updated } : u)));
      setEditUser(null);
      toast.success('User updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (u: AdminUser) => setDeleteUser(u);

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
      toast.success('User deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete user');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const userStats = useMemo(() => {
    const norm = (r: string | null) => (r || '').toLowerCase().trim();
    const adminCount = users.filter((u) => norm(u.role) === 'admin').length;
    const supervisorCount = users.filter((u) =>
      ['supervisor_stockpoint', 'supervisor_plant'].includes(norm(u.role))
    ).length;
    const inchargeCount = users.filter((u) => norm(u.role) === 'incharge').length;
    return {
      total: users.length,
      admin: adminCount,
      supervisors: supervisorCount,
      incharge: inchargeCount,
    };
  }, [users]);

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="User Summary"
        description="View and manage all users"
        icon={Users}
      />

      <div className="space-y-6">
        {/* User Summary cards */}
        {!loading && !error && users.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-muted-foreground">User Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={userStats.total}
                icon={<Users className="w-6 h-6" />}
              />
              <StatCard
                title="Admins"
                value={userStats.admin}
                icon={<Shield className="w-6 h-6" />}
              />
              <StatCard
                title="Supervisors"
                value={userStats.supervisors}
                subtitle="Stock Point & Plant"
                icon={<UserCog className="w-6 h-6" />}
              />
              <StatCard
                title="Incharge"
                value={userStats.incharge}
                icon={<UserCheck className="w-6 h-6" />}
              />
            </div>
          </>
        )}

        {/* All Users table */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Users className="w-5 h-5 text-primary" />
                All Users
                {filteredUsers.length !== users.length && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({filteredUsers.length} of {users.length})
                  </span>
                )}
              </h2>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => loadUsers(true)}
                  disabled={refreshing}
                  title="Refresh"
                >
                  <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                </Button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" className="mt-3" onClick={() => loadUsers()}>
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                {search ? 'No users match your search' : 'No users found'}
              </p>
              {search && (
                <Button variant="ghost" className="mt-2" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              )}
            </div>
          )}

          {!loading && !error && filteredUsers.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Stock Point</TableHead>
                    <TableHead className="hidden md:table-cell">Plant</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <span className="font-medium">{u.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{u.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-medium',
                            roleBadgeClass[u.role] || 'bg-muted text-muted-foreground'
                          )}
                        >
                          {roleLabels[u.role] || u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {u.stock_point_id || '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {u.plant_id || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {u.created_at
                          ? format(new Date(u.created_at), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(u)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(u)}
                            title="Delete"
                            disabled={u.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update name and role for {editUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="User name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteUser?.name} ({deleteUser?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
