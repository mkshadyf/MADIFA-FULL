-- Function to create initial profile
CREATE OR REPLACE FUNCTION create_initial_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT
) RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_profiles (
    user_id,
    email,
    full_name,
    role,
    subscription_tier,
    subscription_status,
    is_email_verified,
    is_active
  )
  VALUES (
    p_user_id,
    p_email,
    p_full_name,
    p_role,
    'premium',
    'active',
    true,
    true
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Function to create initial permission
CREATE OR REPLACE FUNCTION create_initial_permission(
  p_name TEXT,
  p_description TEXT,
  p_resource TEXT,
  p_action TEXT
) RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO permissions (
    name,
    description,
    resource,
    action
  )
  VALUES (
    p_name,
    p_description,
    p_resource,
    p_action
  )
  ON CONFLICT (name) DO UPDATE
  SET
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action;
END;
$$;

-- Function to create initial role permission
CREATE OR REPLACE FUNCTION create_initial_role_permission(
  p_role TEXT,
  p_permission_id UUID
) RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO role_permissions (
    role,
    permission_id
  )
  VALUES (
    p_role,
    p_permission_id
  )
  ON CONFLICT (role, permission_id) DO NOTHING;
END;
$$;

-- Function to delete user profile
CREATE OR REPLACE FUNCTION delete_user_profile(
  p_user_id UUID
) RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete from role_permissions first (if any role-based entries exist)
  DELETE FROM role_permissions
  WHERE role IN (
    SELECT role FROM user_profiles WHERE user_id = p_user_id
  );
  
  -- Then delete the user profile
  DELETE FROM user_profiles
  WHERE user_id = p_user_id;
END;
$$;

-- Update RLS policies to use app_metadata
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin'); 