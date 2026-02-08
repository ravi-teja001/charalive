import express from 'express';
import cors from 'cors';
import { hashPassword, verifyPassword } from './password.js';
import { pool } from './db.js';
import { authMiddleware, optionalAuth, createToken, verifyToken } from './auth.js';
import { runMigrationsAutomatically } from './migrate.js';
import type { JwtPayload } from './auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
// 50mb for Raw Biomass Procurement with multiple base64 photos (vehicle, weight, moisture)
app.use(express.json({ limit: '50mb' }));

// Root - avoid "Cannot GET /" when visiting API URL directly
app.get('/', (_, res) => res.json({ service: 'Biochar API', status: 'ok', docs: '/api/health' }));
app.get('/api', (_, res) => res.json({ message: 'Biochar API', endpoints: ['/api/health', '/api/auth/login', '/api/auth/me'] }));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', database: 'railway' }));

// ============ DASHBOARD STATS ============
app.get('/api/dashboard-stats', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    if (user.role === 'supervisor_stockpoint') {
      const { rows: todayRows } = await pool.query(
        `SELECT COUNT(*) as count, COALESCE(SUM(net_weight), 0) as net_weight
         FROM raw_biomass_procurement
         WHERE (created_by = $1 OR created_by_email = $2) AND procurement_date = $3`,
        [user.userId, user.email, today]
      );
      const { rows: weekRows } = await pool.query(
        `SELECT COALESCE(SUM(net_weight), 0) as net_weight
         FROM raw_biomass_procurement
         WHERE (created_by = $1 OR created_by_email = $2) AND procurement_date >= $3`,
        [user.userId, user.email, weekStartStr]
      );
      const { rows: pendingRows } = await pool.query(
        `SELECT COUNT(*) as count FROM raw_biomass_procurement
         WHERE (created_by = $1 OR created_by_email = $2) AND procurement_date = $3
         AND (vehicle_photo IS NULL OR vehicle_photo = '' OR weight_record_photo IS NULL OR weight_record_photo = '')`,
        [user.userId, user.email, today]
      );
      res.json({
        totalTripsToday: parseInt(todayRows[0]?.count || '0', 10),
        netWeightToday: parseFloat(todayRows[0]?.net_weight || '0'),
        netWeightThisWeek: parseFloat(weekRows[0]?.net_weight || '0'),
        pendingUploads: parseInt(pendingRows[0]?.count || '0', 10),
        totalExpenses: 0,
        fuelExpenses: 0,
        pendingPayments: 0,
        clearedPayments: 0,
        processedBiomass: 0,
        biocharProduced: 0,
        farmersDeployed: 0,
        landCovered: 0,
      });
    } else if (user.role === 'incharge') {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const { rows } = await pool.query(
        `SELECT COALESCE(SUM(expense_amount), 0) as total,
         COALESCE(SUM(CASE WHEN expense_type = 'Fuel Expenses' THEN expense_amount ELSE 0 END), 0) as fuel
         FROM expenses WHERE incharge_id = $1 AND expense_date >= $2`,
        [user.userId, monthStart]
      );
      res.json({
        totalTripsToday: 0,
        netWeightToday: 0,
        netWeightThisWeek: 0,
        pendingUploads: 0,
        totalExpenses: parseFloat(rows[0]?.total || '0'),
        fuelExpenses: parseFloat(rows[0]?.fuel || '0'),
        pendingPayments: 0,
        clearedPayments: 0,
        processedBiomass: 0,
        biocharProduced: 0,
        farmersDeployed: 0,
        landCovered: 0,
      });
    } else {
      res.json({
        totalTripsToday: 0,
        netWeightToday: 0,
        netWeightThisWeek: 0,
        pendingUploads: 0,
        totalExpenses: 0,
        fuelExpenses: 0,
        pendingPayments: 0,
        clearedPayments: 0,
        processedBiomass: 0,
        biocharProduced: 0,
        farmersDeployed: 0,
        landCovered: 0,
      });
    }
  } catch (e: any) {
    console.error('Dashboard stats error:', e);
    res.status(500).json({ error: e.message || 'Failed to load dashboard stats' });
  }
});

// ============ AUTH ============
const MAX_ADMIN_USERS = 5;

// Helper: count distinct users with admin role
async function getAdminUserCount(): Promise<number> {
  const { rows } = await pool.query(`
    SELECT COUNT(DISTINCT uid)::int as count FROM (
      SELECT id as uid FROM users WHERE role = 'admin'
      UNION
      SELECT user_id as uid FROM user_roles WHERE role = 'admin'
    ) sub
  `);
  return rows[0]?.count ?? 0;
}

// Helper: get user's roles (from user_roles if exists, else fallback to users.role)
async function getUserRoles(userId: string): Promise<{ role: string; stock_point_id?: string; plant_id?: string }[]> {
  const { rows } = await pool.query(
    `SELECT role, stock_point_id, plant_id FROM user_roles WHERE user_id = $1`,
    [userId]
  );
  if (rows.length > 0) return rows;
  const { rows: u } = await pool.query('SELECT role, stock_point_id, plant_id FROM users WHERE id = $1', [userId]);
  return u[0] ? [{ role: u[0].role, stock_point_id: u[0].stock_point_id, plant_id: u[0].plant_id }] : [];
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role, plantId: reqPlantId, stockPointId: reqStockPointId } = req.body;
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Email, password, name, and role are required' });
      return;
    }
    const plantId = role === 'supervisor_plant' ? (reqPlantId || 'plant1') : null;
    const stockPointId = (role === 'supervisor_stockpoint' || role === 'incharge') ? reqStockPointId || null : null;
    const { rows: existing } = await pool.query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      const user = existing[0];
      if (!(await verifyPassword(password, user.password_hash))) {
        res.status(400).json({ success: false, message: 'Email already registered. Please login with your password.' });
        return;
      }
      if (role === 'admin') {
        const roles = await getUserRoles(user.id);
        const hasAdmin = roles.some((r: { role: string }) => r.role === 'admin');
        if (!hasAdmin) {
          const adminCount = await getAdminUserCount();
          if (adminCount >= MAX_ADMIN_USERS) {
            res.status(400).json({ success: false, message: `Only ${MAX_ADMIN_USERS} admin users are allowed. Maximum reached.` });
            return;
          }
        }
      }
      await pool.query(
        `INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO NOTHING`,
        [user.id, role]
      );
      const token = createToken({ userId: user.id, email: user.email, role });
      res.json({
        success: true,
        message: 'Role added! Logged in successfully.',
        user: { id: user.id, email: user.email, name: user.name, role },
        token,
      });
      return;
    }
    if (role === 'admin') {
      const adminCount = await getAdminUserCount();
      if (adminCount >= MAX_ADMIN_USERS) {
        res.status(400).json({ success: false, message: `Only ${MAX_ADMIN_USERS} admin users are allowed. Maximum reached.` });
        return;
      }
    }
    const hash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash, role, stock_point_id, plant_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, stock_point_id, plant_id`,
      [email, name, hash, role, stockPointId, plantId]
    );
    const user = result.rows[0];
    await pool.query(`INSERT INTO user_roles (user_id, role, stock_point_id, plant_id) VALUES ($1, $2, $3, $4)`,
      [user.id, role, stockPointId, plantId]);
    const token = createToken({ userId: user.id, email: user.email, role: user.role });
    res.json({
      success: true,
      message: 'Account created and logged in successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        stockPointId: user.stock_point_id || undefined,
        plantId: user.plant_id || undefined,
      },
      token,
    });
  } catch (e: any) {
    const errMsg = e?.message ?? (typeof e === 'string' ? e : '');
    const errCode = e?.code ?? e?.errno ?? '';
    const errStr = errMsg || (e && typeof e === 'object' ? JSON.stringify(e).slice(0, 200) : String(e));
    console.error('Signup error:', errMsg || errStr, 'code:', errCode, e);
    if (e?.code === '23505') {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }
    if (e?.code === '23514') {
      res.status(400).json({ success: false, message: 'Invalid role. Use: admin, supervisor_stockpoint, incharge, or supervisor_plant.' });
      return;
    }
    if (e?.code === '42P01') {
      res.status(500).json({ success: false, message: 'Database table missing. Run migrations: npm run setup-db with DATABASE_URL set.' });
      return;
    }
    if (errCode === 'ECONNREFUSED' || (errStr && (errStr.includes('connect') || errStr.includes('ECONNREFUSED')))) {
      res.status(500).json({ success: false, message: 'Database connection failed. Set DATABASE_URL on Railway and redeploy.' });
      return;
    }
    if (errStr && (errStr.includes('SASL') || errStr.includes('password must be a string'))) {
      res.status(500).json({ success: false, message: 'Database auth failed. Check DATABASE_URL password on Railway.' });
      return;
    }
    const msg = errStr || 'Failed to create account';
    res.status(500).json({ success: false, message: msg });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role: selectedRole } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const { rows } = await pool.query(
      'SELECT id, email, name, role, password_hash, stock_point_id, plant_id FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const roles = await getUserRoles(user.id);
    const roleStrings = roles.map((r: any) => r.role);
    const role = selectedRole && roleStrings.includes(selectedRole) ? selectedRole : roleStrings[0] || user.role;
    const roleData = roles.find((r: any) => r.role === role);
    let plantId = roleData?.plant_id ?? user.plant_id ?? null;
    let stockPointId = roleData?.stock_point_id ?? user.stock_point_id ?? null;
    if (role === 'supervisor_plant' && !plantId) plantId = 'plant1';
    const token = createToken({
      userId: user.id,
      email: user.email,
      role,
    });
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        roles: roleStrings,
        stockPointId: stockPointId || undefined,
        plantId: plantId || undefined,
      },
      token,
    });
  } catch (e: any) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message || 'Login failed' });
  }
});

const authMeHandler = async (req: express.Request, res: express.Response) => {
  try {
    const payload = (req as any).user as JwtPayload;
    const { rows } = await pool.query(
      'SELECT id, email, name, role, stock_point_id, plant_id FROM users WHERE id = $1',
      [payload.userId]
    );
    if (!rows[0]) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const u = rows[0];
    const roles = await getUserRoles(payload.userId);
    const roleData = roles.find((r: any) => r.role === payload.role) || roles[0];
    let plantId = roleData?.plant_id ?? u.plant_id ?? null;
    let stockPointId = roleData?.stock_point_id ?? u.stock_point_id ?? null;
    const role = payload.role || u.role;
    if (role === 'supervisor_plant' && !plantId) plantId = 'plant1';
    res.json({
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        role,
        stockPointId: stockPointId || undefined,
        plantId: plantId || undefined,
      },
    });
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Auth /me error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load user' });
    }
  }
};
app.get('/api/auth/me', authMiddleware, authMeHandler);
app.post('/api/auth/me', authMiddleware, authMeHandler);

// Admin middleware: requires auth + role === 'admin'
const adminMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  authMiddleware(req, res, () => {
    const user = (req as any).user as JwtPayload;
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  });
};

// ============ ADMIN ============
app.get('/api/admin/users', adminMiddleware, async (_, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.name,
         COALESCE(ur.role, u.role) as role,
         COALESCE(ur.stock_point_id, u.stock_point_id) as stock_point_id,
         COALESCE(ur.plant_id, u.plant_id) as plant_id,
         u.created_at
       FROM users u
       LEFT JOIN LATERAL (
         SELECT role, stock_point_id, plant_id FROM user_roles WHERE user_id = u.id LIMIT 1
       ) ur ON true
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Admin users error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load users' });
    }
  }
});

// Admin: update user
app.put('/api/admin/users/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).user as JwtPayload;
    if (id === adminUser.userId) {
      res.status(400).json({ error: 'Cannot edit your own account here. Use profile settings.' });
      return;
    }
    const { name, role, stock_point_id, plant_id } = req.body;
    const validRoles = ['admin', 'supervisor_stockpoint', 'incharge', 'supervisor_plant'];
    const newRole = role && validRoles.includes(String(role).toLowerCase()) ? String(role).toLowerCase() : null;
    if (newRole === 'admin') {
      const roles = await getUserRoles(id);
      const alreadyAdmin = roles.some((r: { role: string }) => r.role === 'admin');
      if (!alreadyAdmin) {
        const adminCount = await getAdminUserCount();
        if (adminCount >= MAX_ADMIN_USERS) {
          res.status(400).json({ error: `Only ${MAX_ADMIN_USERS} admin users are allowed. Maximum reached.` });
          return;
        }
      }
    }
    const updates: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (name != null) {
      updates.push(`name = $${idx++}`);
      params.push(String(name).trim());
    }
    if (newRole != null) {
      updates.push(`role = $${idx++}`);
      params.push(newRole);
    }
    if (stock_point_id !== undefined) {
      updates.push(`stock_point_id = $${idx++}`);
      params.push(stock_point_id === '' || stock_point_id == null ? null : String(stock_point_id));
    }
    if (plant_id !== undefined) {
      updates.push(`plant_id = $${idx++}`);
      params.push(plant_id === '' || plant_id == null ? null : String(plant_id));
    }
    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, email, name, role, stock_point_id, plant_id, created_at`,
      params
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Update user_roles if exists
    await pool.query(`UPDATE user_roles SET role = $1, stock_point_id = $2, plant_id = $3 WHERE user_id = $4`, [
      rows[0].role,
      rows[0].stock_point_id,
      rows[0].plant_id,
      id,
    ]);
    res.json(rows[0]);
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Admin user update error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to update user' });
    }
  }
});

// Admin: delete user
app.delete('/api/admin/users/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).user as JwtPayload;
    if (id === adminUser.userId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }
    // Delete from user_roles first (if exists)
    await pool.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(204).send();
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Admin user delete error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to delete user' });
    }
  }
});

app.get('/api/admin/stats', adminMiddleware, async (_, res) => {
  try {
    // Total trips and net weight across all records (all-time) — Admin "Total Trips" / "Net Weight Collected"
    const { rows: rawRows } = await pool.query(
      `SELECT COUNT(*) as trips, COALESCE(SUM(net_weight), 0) as net_weight
       FROM raw_biomass_procurement`
    );
    const { rows: procRows } = await pool.query(
      `SELECT COALESCE(SUM(net_weight), 0) as processed
       FROM processed_biomass_procurement
       WHERE procurement_date::date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date`
    );
    const { rows: biocharRows } = await pool.query(
      `SELECT COUNT(*) as farmers, COALESCE(SUM(biochar_weight), 0) as biochar, COALESCE(SUM(land_area), 0) as land
       FROM biochar_deployment
       WHERE (created_at AT TIME ZONE 'Asia/Kolkata')::date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date`
    );
    res.json({
      totalTripsToday: parseInt(rawRows[0]?.trips || '0', 10),
      netWeightToday: parseFloat(rawRows[0]?.net_weight || '0'),
      processedBiomass: parseFloat(procRows[0]?.processed || '0'),
      biocharProduced: parseFloat(biocharRows[0]?.biochar || '0'),
      farmersDeployed: parseInt(biocharRows[0]?.farmers || '0', 10),
      landCovered: parseFloat(biocharRows[0]?.land || '0'),
    });
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Admin stats error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load stats' });
    }
  }
});

app.get('/api/admin/chart-data', adminMiddleware, async (req, res) => {
  try {
    const days = Math.min(90, Math.max(7, parseInt(String(req.query.days || '14'), 10)));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split('T')[0];
    const dates: { date: string }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push({ date: d.toISOString().split('T')[0] });
    }
    const { rows: rawRows } = await pool.query(
      `SELECT procurement_date::text as date, COUNT(*)::int as trips, COALESCE(SUM(net_weight), 0)::float as net_weight
       FROM raw_biomass_procurement WHERE procurement_date >= $1 GROUP BY procurement_date`,
      [startStr]
    );
    const { rows: procRows } = await pool.query(
      `SELECT procurement_date::text as date, COALESCE(SUM(net_weight), 0)::float as processed
       FROM processed_biomass_procurement WHERE procurement_date >= $1 GROUP BY procurement_date`,
      [startStr]
    );
    const { rows: biocharRows } = await pool.query(
      `SELECT created_at::date::text as date, COUNT(*)::int as farmers,
        COALESCE(SUM(biochar_weight), 0)::float as biochar, COALESCE(SUM(land_area), 0)::float as land
       FROM biochar_deployment WHERE created_at::date >= $1::date GROUP BY created_at::date`,
      [startStr]
    );
    const rawByDate = Object.fromEntries(rawRows.map((r: any) => [r.date, { trips: r.trips, net_weight: r.net_weight }]));
    const procByDate = Object.fromEntries(procRows.map((r: any) => [r.date, r.processed]));
    const biocharByDate = Object.fromEntries(biocharRows.map((r: any) => [r.date, { farmers: r.farmers, biochar: r.biochar, land: r.land }]));
    const chartData = dates.map(({ date }) => {
      const raw = rawByDate[date] || { trips: 0, net_weight: 0 };
      const bio = biocharByDate[date] || { farmers: 0, biochar: 0, land: 0 };
      return {
        date,
        label: new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        trips: raw.trips,
        netWeight: Math.round(raw.net_weight * 100) / 100,
        processedBiomass: Math.round((procByDate[date] || 0) * 100) / 100,
        biocharProduced: Math.round(bio.biochar * 100) / 100,
        farmersDeployed: bio.farmers,
        landCovered: Math.round(bio.land * 100) / 100,
      };
    });
    res.json(chartData);
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Admin chart-data error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load chart data' });
    }
  }
});

app.get('/api/admin/donut-data', adminMiddleware, async (_, res) => {
  try {
    // Limit to last 365 days so queries use idx_raw_biomass_date (avoids full table scan on large table)
    const fromStr = new Date();
    fromStr.setDate(fromStr.getDate() - 365);
    const fromDate = fromStr.toISOString().split('T')[0];
    const { rows: tripsRows } = await pool.query(
      `SELECT COALESCE(sp.name, r.stock_point_id, 'Unknown') as name, COUNT(*)::int as value
       FROM raw_biomass_procurement r
       LEFT JOIN stock_points sp ON r.stock_point_id = sp.id
       WHERE r.procurement_date >= $1
       GROUP BY r.stock_point_id, sp.name`,
      [fromDate]
    );
    const { rows: sourceRows } = await pool.query(
      `SELECT COALESCE(
         CASE source
           WHEN 'own' THEN 'Own'
           WHEN 'vendor' THEN 'Vendor'
           WHEN 'cotton_stalks' THEN 'Cotton Stalks'
           WHEN 'chickpea_hulls' THEN 'Chickpea Hulls'
           WHEN 'chilli_stalks' THEN 'Chilli Stalks'
           ELSE source
         END, 'Other') as name,
         COALESCE(SUM(net_weight), 0)::float as value
       FROM raw_biomass_procurement WHERE procurement_date >= $1 GROUP BY source`,
      [fromDate]
    );
    const { rows: roleRows } = await pool.query(
      `SELECT COALESCE(
         CASE role
           WHEN 'admin' THEN 'Admin'
           WHEN 'supervisor_stockpoint' THEN 'Stock Point Supervisor'
           WHEN 'supervisor_plant' THEN 'Plant Supervisor'
           WHEN 'incharge' THEN 'Incharge'
           ELSE role
         END, 'Other') as name,
         COUNT(*)::int as value
       FROM users GROUP BY role`
    );
    res.json({
      tripsByStockPoint: tripsRows,
      netWeightBySource: sourceRows.map((r: any) => ({ name: r.name, value: Math.round(r.value * 100) / 100 })),
      usersByRole: roleRows,
    });
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Admin donut-data error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load donut data' });
    }
  }
});

app.get('/api/admin/user-activity-today', adminMiddleware, async (_, res) => {
  const { rows } = await pool.query(
    `SELECT COALESCE(u.name, r.created_by_email, 'Unknown') as user_name,
       COALESCE(u.email, r.created_by_email, '') as email,
       r.created_by as user_id,
       COUNT(*)::int as trips,
       COALESCE(SUM(r.net_weight), 0)::float as net_weight
     FROM raw_biomass_procurement r
     LEFT JOIN users u ON u.id::text = r.created_by
     WHERE r.procurement_date::date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date
     GROUP BY r.created_by, r.created_by_email, u.name, u.email
     ORDER BY trips DESC, net_weight DESC`
  );
  res.json(rows.map((r: any) => ({
    userId: r.user_id,
    userName: r.user_name,
    email: r.email,
    trips: r.trips,
    netWeight: Math.round(r.net_weight * 100) / 100,
  })));
});

app.get('/api/admin/daily-activity', adminMiddleware, async (req, res) => {
  try {
    const dateStr = String(req.query.date || new Date().toISOString().split('T')[0]);
    const userId = req.query.userId ? String(req.query.userId) : null;
    const { rows } = await pool.query(
      `SELECT COALESCE(u.name, r.created_by_email, 'Unknown') as user_name,
         COALESCE(u.email, r.created_by_email, '') as email,
         r.created_by as user_id,
         COUNT(*)::int as trips,
         COALESCE(SUM(r.net_weight), 0)::float as net_weight
       FROM raw_biomass_procurement r
       LEFT JOIN users u ON u.id::text = r.created_by
       WHERE r.procurement_date = $1
       ${userId ? 'AND (r.created_by = $2 OR u.id::text = $2)' : ''}
       GROUP BY r.created_by, r.created_by_email, u.name, u.email
       ORDER BY trips DESC, net_weight DESC`,
      userId ? [dateStr, userId] : [dateStr]
    );
    res.json(rows.map((r: any) => ({
      userId: r.user_id,
      userName: r.user_name,
      email: r.email,
      trips: r.trips,
      netWeight: Math.round(r.net_weight * 100) / 100,
    })));
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Admin daily-activity error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load daily activity' });
    }
  }
});

// Individual trip records for one user on one date (for Daily Activity row click)
app.get('/api/admin/daily-activity/records', adminMiddleware, async (req, res) => {
  try {
    const dateStr = String(req.query.date || new Date().toISOString().split('T')[0]);
    const userId = req.query.userId ? String(req.query.userId) : null;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    const { rows } = await pool.query(
      `SELECT r.* FROM raw_biomass_procurement r
       LEFT JOIN users u ON u.id::text = r.created_by
       WHERE r.procurement_date = $1 AND (r.created_by = $2 OR u.id::text = $2)
       ORDER BY r.created_at ASC, r.id ASC`,
      [dateStr, userId]
    );
    res.json(rows.map(mapProcurement));
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Admin daily-activity/records error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load trip records' });
    }
  }
});

// ============ STOCK POINTS ============
app.get('/api/stock-points', authMiddleware, async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM stock_points ORDER BY name');
    res.json(rows);
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Stock points error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load stock points' });
    }
  }
});

// ============ PLANTS ============
app.get('/api/plants', authMiddleware, async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM plants ORDER BY name');
    res.json(rows);
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Plants error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load plants' });
    }
  }
});

// ============ VEHICLES ============
app.get('/api/vehicles', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userId = user.userId;
    const { rows } = await pool.query(
      'SELECT * FROM vehicles WHERE created_by = $1 ORDER BY vehicle_number',
      [userId]
    );
    res.json(rows.map(mapVehicle));
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Vehicles GET error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load vehicles' });
    }
  }
});

app.post('/api/vehicles', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    const { vehicleNumber, weight, type, name, district, subDistrict, village, state } = req.body;
    const validType = normalizeVehicleType(type) || 'other';
    const { rows } = await pool.query(
      `INSERT INTO vehicles (vehicle_number, weight_kg, vehicle_type, name, district, sub_district, village, state, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        vehicleNumber,
        weight ?? 0,
        validType,
        name || null,
        district || null,
        subDistrict || null,
        village || null,
        state || null,
        user.userId,
      ]
    );
    res.json(mapVehicle(rows[0]));
  } catch (e: any) {
    console.error('Create vehicle error:', e);
    if (e.code === '23505') {
      res.status(400).json({ error: 'Vehicle number already exists' });
    } else {
      res.status(500).json({ error: e.message || 'Failed to create vehicle' });
    }
  }
});

const VEHICLE_TYPES = ['registered', 'tractor', 'truck', 'trailer', 'tempo', 'auto', 'other'];
function normalizeVehicleType(type: unknown): string | null {
  if (type == null) return null;
  const t = String(type).toLowerCase().trim();
  return VEHICLE_TYPES.includes(t) ? t : null;
}

app.put('/api/vehicles/:id', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    const { id } = req.params;
    const { vehicleNumber, weight, type, name, district, subDistrict, village, state } = req.body;
    const validType = normalizeVehicleType(type);
    const { rows } = await pool.query(
      `UPDATE vehicles SET
         vehicle_number = COALESCE($2, vehicle_number),
         weight_kg = COALESCE($3, weight_kg),
         vehicle_type = COALESCE($4, vehicle_type),
         name = $5, district = $6, sub_district = $7, village = $8, state = $9
       WHERE id = $1 AND created_by = $10
       RETURNING *`,
      [id, vehicleNumber, weight, validType, name ?? null, district ?? null, subDistrict ?? null, village ?? null, state ?? null, user.userId]
    );
    if (!rows[0]) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json(mapVehicle(rows[0]));
  } catch (e: any) {
    console.error('Update vehicle error:', e);
    res.status(500).json({ error: e.message || 'Failed to update vehicle' });
  }
});

app.delete('/api/vehicles/:id', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM vehicles WHERE id = $1 AND created_by = $2', [
      id,
      user.userId,
    ]);
    if (rowCount === 0) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.status(204).send();
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Vehicles DELETE error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to delete vehicle' });
    }
  }
});

function mapVehicle(row: any) {
  return {
    id: row.id,
    vehicleNumber: row.vehicle_number,
    weight: parseFloat(row.weight_kg) || 0,
    type: row.vehicle_type,
    name: row.name,
    district: row.district,
    subDistrict: row.sub_district,
    village: row.village,
    state: row.state,
    created_at: row.created_at,
  };
}

// ============ RAW BIOMASS PROCUREMENT ============
app.get('/api/raw-biomass-procurement', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    if (!user?.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const { stockPointId, fromDate, toDate } = req.query;
    // Filter by user ID and optionally email (email may be missing on older tokens)
    const hasEmail = user.email && String(user.email).trim().length > 0;
    const qWhere = hasEmail
      ? `WHERE (created_by = $1 OR created_by_email = $2)`
      : `WHERE created_by = $1`;
    let q = `SELECT * FROM raw_biomass_procurement ${qWhere}`;
    const params: any[] = hasEmail ? [user.userId, user.email] : [user.userId];
    let idx = params.length + 1;
    if (stockPointId) {
      q += ` AND stock_point_id = $${idx++}`;
      params.push(stockPointId);
    }
    if (fromDate) {
      q += ` AND procurement_date >= $${idx++}`;
      params.push(fromDate);
    }
    if (toDate) {
      q += ` AND procurement_date <= $${idx++}`;
      params.push(toDate);
    }
    q += ` ORDER BY procurement_date DESC`;

    // Cap result size to avoid "Ran out of memory retrieving query results" (SQL 53200)
    const requestedLimit = Math.min(10000, Math.max(1, parseInt(String(req.query.limit || '5000'), 10) || 5000));
    q += ` LIMIT ${requestedLimit}`;

    const { rows } = await pool.query(q, params);
    res.json(rows.map(mapProcurement));
  } catch (e: any) {
    if (res.headersSent) return;
    console.error('GET /api/raw-biomass-procurement error:', e?.message || e);
    const code = e?.code;
    const msg = e?.message || 'Failed to load procurement records';
    if (code === '42P01') {
      res.status(500).json({ error: 'Database table missing. Run migrations with DATABASE_URL set.' });
      return;
    }
    if (code === 'ECONNREFUSED' || msg?.includes('connect') || msg?.includes('ECONNREFUSED')) {
      res.status(503).json({ error: 'Database unavailable. Please try again later.' });
      return;
    }
    if (code === '42703') {
      res.status(500).json({ error: 'Database column missing. Run migrations (e.g. created_by_email).' });
      return;
    }
    res.status(500).json({ error: msg });
  }
});

app.post('/api/raw-biomass-procurement', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    const body = req.body;

    // Normalize source and stock_point_id
    const validSources = ['cotton_stalks', 'chickpea_hulls', 'chilli_stalks', 'own', 'vendor'];
    const rawSource = (body.source || 'cotton_stalks').toString().toLowerCase().replace(/\s+/g, '_');
    const source = validSources.includes(rawSource) ? rawSource : 'cotton_stalks';

    // Resolve stock_point_id - use null if invalid (avoids FK violation)
    let stockPointId = body.stockPointId || null;
    if (stockPointId === 'default-stockpoint-001' || stockPointId === '') {
      stockPointId = null;
    }

    const procurementId = await generateProcurementId(pool, source);

    const procDate = body.procurementDate;
    const procDateStr = typeof procDate === 'string' ? procDate.split('T')[0] : (procDate instanceof Date ? procDate.toISOString().split('T')[0] : null);

    const { rows } = await pool.query(
      `INSERT INTO raw_biomass_procurement (
        procurement_id, stock_point_id, source, vehicle_number, vehicle_weight, vehicle_photo,
        gross_weight, weight_record_photo, net_weight, procurement_date,
        created_by, created_by_email, location_latitude, location_longitude,
        geojson_data, name, state, district, village, vehicle_type, moisture
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        procurementId,
        stockPointId,
        source,
      body.vehicleNumber,
      body.vehicleWeight ?? 0,
      body.vehiclePhoto || null,
      body.grossWeight ?? 0,
      body.weightRecordPhoto || null,
      body.netWeight ?? 0,
      procDateStr ?? new Date().toISOString().split('T')[0],
      user.userId,
      user.email,
      body.locationLatitude ?? null,
      body.locationLongitude ?? null,
      body.geojsonData ?? null,
      body.name || null,
      body.state || null,
      body.district || null,
      body.village || null,
      body.vehicleType || null,
      body.moisture ?? null,
    ]
    );
    res.json(mapProcurement(rows[0]));
  } catch (e: any) {
    console.error('Create procurement error:', e);
    if (e.code === '23503') {
      res.status(400).json({ error: 'Invalid stock point or reference' });
    } else if (e.code === '23514') {
      res.status(400).json({ error: 'Invalid source type. Use: cotton_stalks, chilli_stalks, chickpea_hulls, own, or vendor' });
    } else {
      res.status(500).json({ error: e.message || 'Failed to create procurement' });
    }
  }
});

async function generateProcurementId(pool: any, source: string): Promise<string> {
  const prefix = source === 'cotton_stalks' ? 'COT' : 'CHL';
  const dateStr =
    new Date().getFullYear().toString() +
    (new Date().getMonth() + 1).toString().padStart(2, '0') +
    new Date().getDate().toString().padStart(2, '0');
  const { rows } = await pool.query(
    `SELECT procurement_id FROM raw_biomass_procurement
     WHERE procurement_id LIKE 'BMP-%' ORDER BY procurement_id DESC LIMIT 1`
  );
  let next = 1;
  if (rows[0]?.procurement_id) {
    const parts = rows[0].procurement_id.split('-');
    const n = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(n)) next = n + 1;
  }
  return `BMP-${prefix}-${dateStr}-${next.toString().padStart(4, '0')}`;
}

function mapProcurement(row: any) {
  return {
    id: row.id,
    stockPointId: row.stock_point_id,
    source: row.source,
    vehicleNumber: row.vehicle_number,
    vehicleWeight: row.vehicle_weight,
    vehiclePhoto: row.vehicle_photo,
    grossWeight: row.gross_weight,
    weightRecordPhoto: row.weight_record_photo,
    netWeight: row.net_weight,
    procurementDate: row.procurement_date,
    createdBy: row.created_by,
    createdByEmail: row.created_by_email,
    procurementId: row.procurement_id,
    locationLatitude: row.location_latitude,
    locationLongitude: row.location_longitude,
    geojsonData: row.geojson_data,
    createdAt: row.created_at,
    name: row.name,
    state: row.state,
    district: row.district,
    village: row.village,
    vehicleType: row.vehicle_type,
    moisture: row.moisture,
  };
}

// ============ EXPENSES ============
const expenseTypeMap: Record<string, string> = {
  fuel: 'Fuel Expenses',
  cash_advance: 'Cash Advance',
  other: 'Other Expenses',
};
const paymentModeMap: Record<string, string> = { cash: 'Cash', upi: 'UPI' };
const expenseTypeRev: Record<string, string> = {
  'Fuel Expenses': 'fuel',
  'Cash Advance': 'cash_advance',
  'Other Expenses': 'other',
};
const paymentModeRev: Record<string, string> = { Cash: 'cash', UPI: 'upi' };

app.get('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const { stockPointId, fromDate, toDate, expenseType, inchargeId } = req.query;
    let q = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];
    let idx = 1;
    if (stockPointId) {
      q += ` AND stock_point_id = $${idx++}`;
      params.push(stockPointId);
    }
    if (inchargeId) {
      q += ` AND incharge_id = $${idx++}`;
      params.push(inchargeId);
    }
    if (expenseType) {
      q += ` AND expense_type = $${idx++}`;
      params.push(expenseTypeMap[expenseType as string] || expenseType);
    }
    if (fromDate) {
      q += ` AND expense_date >= $${idx++}`;
      params.push(fromDate);
    }
    if (toDate) {
      q += ` AND expense_date <= $${idx++}`;
      params.push(toDate);
    }
    q += ' ORDER BY expense_date DESC';
    const { rows } = await pool.query(q, params);
    res.json(
      rows.map((r: any) => ({
        id: r.id,
        stockPointId: r.stock_point_id,
        date: r.expense_date,
        amount: parseFloat(r.expense_amount),
        type: expenseTypeRev[r.expense_type] || r.expense_type,
        paymentMode: paymentModeRev[r.payment_mode] || r.payment_mode,
        receiptUrl: r.receipt_url || '',
        createdBy: r.incharge_id,
        createdAt: r.created_at,
      }))
    );
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Expenses GET error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load expenses' });
    }
  }
});

app.post('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    const { stockPointId, date, amount, type, paymentMode, receiptUrl } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO expenses (stock_point_id, expense_date, expense_amount, expense_type, payment_mode, receipt_url, incharge_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        stockPointId,
        date?.split?.('T')[0] ?? date,
        amount,
        expenseTypeMap[type] || type,
        paymentModeMap[paymentMode] || paymentMode,
        receiptUrl || null,
        user.userId,
      ]
    );
    const r = rows[0];
    res.json({
      id: r.id,
      stockPointId: r.stock_point_id,
      date: r.expense_date,
      amount: parseFloat(r.expense_amount),
      type: expenseTypeRev[r.expense_type] || r.expense_type,
      paymentMode: paymentModeRev[r.payment_mode] || r.payment_mode,
      receiptUrl: r.receipt_url || '',
      createdBy: r.incharge_id,
      createdAt: r.created_at,
    });
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Expenses POST error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to create expense' });
    }
  }
});

// ============ PROCESSED BIOMASS ============
app.get('/api/processed-biomass-procurement', authMiddleware, async (req, res) => {
  try {
    const { plantId } = req.query;
    let q = 'SELECT * FROM processed_biomass_procurement WHERE 1=1';
    const params: any[] = [];
    if (plantId) {
      q += ' AND plant_id = $1';
      params.push(plantId);
    }
    q += ' ORDER BY procurement_date DESC';
    const { rows } = await pool.query(q, params);
    res.json(
      rows.map((r: any) => ({
        id: r.id,
        plantId: r.plant_id,
        sourceStockPointId: r.source_stock_point_id,
        vehicleNumber: r.vehicle_number,
        vehicleWeight: r.vehicle_weight,
        vehiclePhoto: r.vehicle_photo,
        grossWeight: r.gross_weight,
        weightRecordPhoto: r.weight_record_photo,
        netWeight: r.net_weight,
        procurementDate: r.procurement_date,
        createdBy: r.created_by,
      }))
    );
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Processed biomass GET error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load processed biomass' });
    }
  }
});

app.post('/api/processed-biomass-procurement', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    const b = req.body;
    const { rows } = await pool.query(
      `INSERT INTO processed_biomass_procurement (
        plant_id, source_stock_point_id, vehicle_number, vehicle_weight, vehicle_photo,
        vehicle_photo_latitude, vehicle_photo_longitude, gross_weight, weight_record_photo,
        weight_photo_latitude, weight_photo_longitude, net_weight, procurement_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        b.plantId,
        b.sourceStockPointId,
        b.vehicleNumber,
        b.vehicleWeight ?? 0,
        b.vehiclePhoto || null,
        b.vehiclePhotoLatitude ?? null,
        b.vehiclePhotoLongitude ?? null,
        b.grossWeight ?? 0,
        b.weightRecordPhoto || null,
        b.weightPhotoLatitude ?? null,
        b.weightPhotoLongitude ?? null,
        b.netWeight ?? 0,
        b.procurementDate?.split?.('T')[0] ?? b.procurementDate,
        user.userId,
      ]
    );
    const r = rows[0];
    res.json({
      id: r.id,
      plantId: r.plant_id,
      sourceStockPointId: r.source_stock_point_id,
      vehicleNumber: r.vehicle_number,
      vehicleWeight: r.vehicle_weight,
      vehiclePhoto: r.vehicle_photo,
      grossWeight: r.gross_weight,
      weightRecordPhoto: r.weight_record_photo,
      netWeight: r.net_weight,
      procurementDate: r.procurement_date,
      createdBy: r.created_by,
    });
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Processed biomass POST error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to create processed biomass' });
    }
  }
});

// ============ BIOCHAR DEPLOYMENT ============
app.get('/api/biochar-deployment', authMiddleware, async (req, res) => {
  try {
    const { plantId } = req.query;
    let q = 'SELECT * FROM biochar_deployment WHERE 1=1';
    const params: any[] = [];
    if (plantId) {
      q += ' AND plant_id = $1';
      params.push(plantId);
    }
    q += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(q, params);
    res.json(
      rows.map((r: any) => ({
        id: r.id,
        plantId: r.plant_id,
        farmerName: r.farmer_name,
        mobileNumber: r.mobile_number,
        aadhaarNumber: r.aadhaar_number,
        village: r.village,
        mandal: r.mandal,
        district: r.district,
        landArea: r.land_area,
        biocharWeight: r.biochar_weight,
        numberOfBags: r.number_of_bags,
        kmlData: r.kml_data,
        createdBy: r.created_by,
        createdAt: r.created_at,
      }))
    );
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Biochar deployment GET error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to load biochar deployments' });
    }
  }
});

app.post('/api/biochar-deployment', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as JwtPayload;
    const b = req.body;
    const { rows } = await pool.query(
      `INSERT INTO biochar_deployment (
        plant_id, farmer_name, mobile_number, aadhaar_number, village, mandal, district,
        land_area, biochar_weight, number_of_bags, kml_data, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        b.plantId,
        b.farmerName,
        b.mobileNumber,
        b.aadhaarNumber,
        b.village,
        b.mandal,
        b.district,
        b.landArea,
        b.biocharWeight,
        b.numberOfBags,
        b.kmlData || null,
        user.userId,
      ]
    );
    const r = rows[0];
    res.json({
      id: r.id,
      plantId: r.plant_id,
      farmerName: r.farmer_name,
      mobileNumber: r.mobile_number,
      aadhaarNumber: r.aadhaar_number,
      village: r.village,
      mandal: r.mandal,
      district: r.district,
      landArea: r.land_area,
      biocharWeight: r.biochar_weight,
      numberOfBags: r.number_of_bags,
      kmlData: r.kml_data,
      createdBy: r.created_by,
      createdAt: r.created_at,
    });
  } catch (e: any) {
    if (!res.headersSent) {
      console.error('Biochar deployment POST error:', e?.message || e);
      res.status(500).json({ error: e?.message || 'Failed to create biochar deployment' });
    }
  }
});

// Global error handler: ensure all errors return JSON (no HTML 500)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (res.headersSent) return;
  const msg = err?.message || String(err);
  console.error('Unhandled error:', msg);
  res.status(500).json({ error: msg || 'Internal Server Error' });
});

// Start server, verify DB connection, and run migrations automatically
app.listen(PORT, async () => {
  console.log(`🚀 Biochar API server running on port ${PORT}`);
  const hasDb = !!process.env.DATABASE_PUBLIC_URL || !!process.env.DATABASE_URL || !!process.env.PG_CONNECTION_STRING;
  if (!hasDb) {
    console.error('❌ DATABASE_URL or DATABASE_PUBLIC_URL not set. Signup and all DB features will fail.');
  } else {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connected (Railway Postgres)');
      await runMigrationsAutomatically(pool);
    } catch (e: any) {
      console.error('❌ Database connection failed:', e?.message || e);
    }
  }
});
