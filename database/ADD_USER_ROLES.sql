-- Allow same email to have multiple roles
-- Run: node --env-file=.env -e "require('fs').readFileSync('database/ADD_USER_ROLES.sql','utf8')" | psql $DATABASE_URL
-- Or run manually in Railway Query tab

-- User roles table (one user can have many roles)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('supervisor_stockpoint', 'incharge', 'supervisor_plant')),
  stock_point_id TEXT,
  plant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Migrate existing users: copy their role to user_roles
INSERT INTO user_roles (user_id, role, stock_point_id, plant_id)
SELECT id, role, stock_point_id, plant_id FROM users
ON CONFLICT (user_id, role) DO NOTHING;
