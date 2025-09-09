-- Add profile_id column to bill_type_change_history table
ALTER TABLE bill_type_change_history 
ADD COLUMN profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE;

-- Create index on profile_id for better query performance
CREATE INDEX IF NOT EXISTS idx_bill_type_change_history_profile_id 
ON bill_type_change_history(profile_id);

-- Update RLS policies to include profile_id in access control
DROP POLICY IF EXISTS "Admins and managers can view bill type change history" ON bill_type_change_history;

CREATE POLICY "Admins and managers can view bill type change history" 
ON bill_type_change_history 
FOR SELECT 
USING (is_admin_or_manager());

CREATE POLICY "Users can view their own bill type change history" 
ON bill_type_change_history 
FOR SELECT 
USING (profile_id = auth.uid());

-- Allow system to insert bill type change history records
CREATE POLICY "System can insert bill type change history" 
ON bill_type_change_history 
FOR INSERT 
WITH CHECK (true);