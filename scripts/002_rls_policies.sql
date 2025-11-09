-- Enable Row Level Security on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.current_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE;

-- PROFILES POLICIES
CREATE POLICY "Users can view profiles in their tenant"
  ON public.profiles FOR SELECT
  USING (tenant_id = auth.current_user_tenant_id());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can insert profiles in their tenant"
  ON public.profiles FOR INSERT
  WITH CHECK (tenant_id = auth.current_user_tenant_id() AND auth.current_user_role() = 'admin');

-- TENANTS POLICIES (only admins can modify)
CREATE POLICY "Users can view their own tenant"
  ON public.tenants FOR SELECT
  USING (id = auth.current_user_tenant_id());

CREATE POLICY "Admins can update their tenant"
  ON public.tenants FOR UPDATE
  USING (id = auth.current_user_tenant_id() AND auth.current_user_role() = 'admin');

-- ZONES POLICIES
CREATE POLICY "Users can view zones in their tenant"
  ON public.zones FOR SELECT
  USING (tenant_id = auth.current_user_tenant_id());

CREATE POLICY "Supervisors and above can create zones"
  ON public.zones FOR INSERT
  WITH CHECK (
    tenant_id = auth.current_user_tenant_id() AND 
    auth.current_user_role() IN ('admin', 'main_contractor', 'supervisor', 'safety_officer')
  );

CREATE POLICY "Supervisors and above can update zones"
  ON public.zones FOR UPDATE
  USING (
    tenant_id = auth.current_user_tenant_id() AND 
    auth.current_user_role() IN ('admin', 'main_contractor', 'supervisor', 'safety_officer')
  );

-- TASKS POLICIES
CREATE POLICY "Users can view tasks in their tenant"
  ON public.tasks FOR SELECT
  USING (tenant_id = auth.current_user_tenant_id());

CREATE POLICY "Users can create tasks in their tenant"
  ON public.tasks FOR INSERT
  WITH CHECK (tenant_id = auth.current_user_tenant_id());

CREATE POLICY "Users can update tasks they created or are assigned to"
  ON public.tasks FOR UPDATE
  USING (
    tenant_id = auth.current_user_tenant_id() AND 
    (created_by = auth.uid() OR assigned_to = auth.uid() OR auth.current_user_role() IN ('admin', 'main_contractor', 'supervisor'))
  );

CREATE POLICY "Supervisors and above can delete tasks"
  ON public.tasks FOR DELETE
  USING (
    tenant_id = auth.current_user_tenant_id() AND 
    auth.current_user_role() IN ('admin', 'main_contractor', 'supervisor')
  );

-- TASK ATTACHMENTS POLICIES
CREATE POLICY "Users can view attachments for tasks they can see"
  ON public.task_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_attachments.task_id 
      AND tasks.tenant_id = auth.current_user_tenant_id()
    )
  );

CREATE POLICY "Users can add attachments to tasks in their tenant"
  ON public.task_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_attachments.task_id 
      AND tasks.tenant_id = auth.current_user_tenant_id()
    )
  );

-- MESSAGES POLICIES
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (
    tenant_id = auth.current_user_tenant_id() AND 
    (sender_id = auth.uid() OR recipient_id = auth.uid() OR message_type IN ('announcement', 'safety_alert'))
  );

CREATE POLICY "Users can send messages in their tenant"
  ON public.messages FOR INSERT
  WITH CHECK (tenant_id = auth.current_user_tenant_id() AND sender_id = auth.uid());

CREATE POLICY "Users can update their sent messages"
  ON public.messages FOR UPDATE
  USING (tenant_id = auth.current_user_tenant_id() AND sender_id = auth.uid());

-- INCIDENTS POLICIES
CREATE POLICY "Users can view incidents in their tenant"
  ON public.incidents FOR SELECT
  USING (tenant_id = auth.current_user_tenant_id());

CREATE POLICY "Users can report incidents in their tenant"
  ON public.incidents FOR INSERT
  WITH CHECK (tenant_id = auth.current_user_tenant_id());

CREATE POLICY "Safety officers and above can update incidents"
  ON public.incidents FOR UPDATE
  USING (
    tenant_id = auth.current_user_tenant_id() AND 
    auth.current_user_role() IN ('admin', 'main_contractor', 'safety_officer')
  );

-- INCIDENT ATTACHMENTS POLICIES
CREATE POLICY "Users can view incident attachments in their tenant"
  ON public.incident_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents 
      WHERE incidents.id = incident_attachments.incident_id 
      AND incidents.tenant_id = auth.current_user_tenant_id()
    )
  );

CREATE POLICY "Users can add incident attachments"
  ON public.incident_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.incidents 
      WHERE incidents.id = incident_attachments.incident_id 
      AND incidents.tenant_id = auth.current_user_tenant_id()
    )
  );

-- PERMITS POLICIES
CREATE POLICY "Users can view permits in their tenant"
  ON public.permits FOR SELECT
  USING (tenant_id = auth.current_user_tenant_id());

CREATE POLICY "Supervisors and above can create permits"
  ON public.permits FOR INSERT
  WITH CHECK (
    tenant_id = auth.current_user_tenant_id() AND 
    auth.current_user_role() IN ('admin', 'main_contractor', 'supervisor', 'safety_officer')
  );

CREATE POLICY "Authorized users can update permits"
  ON public.permits FOR UPDATE
  USING (
    tenant_id = auth.current_user_tenant_id() AND 
    (issued_by = auth.uid() OR auth.current_user_role() IN ('admin', 'main_contractor', 'safety_officer'))
  );

-- ASSETS POLICIES
CREATE POLICY "Users can view assets in their tenant"
  ON public.assets FOR SELECT
  USING (tenant_id = auth.current_user_tenant_id());

CREATE POLICY "Supervisors and above can create assets"
  ON public.assets FOR INSERT
  WITH CHECK (
    tenant_id = auth.current_user_tenant_id() AND 
    auth.current_user_role() IN ('admin', 'main_contractor', 'supervisor')
  );

CREATE POLICY "Supervisors and above can update assets"
  ON public.assets FOR UPDATE
  USING (
    tenant_id = auth.current_user_tenant_id() AND 
    auth.current_user_role() IN ('admin', 'main_contractor', 'supervisor')
  );

-- MAINTENANCE RECORDS POLICIES
CREATE POLICY "Users can view maintenance records in their tenant"
  ON public.maintenance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = maintenance_records.asset_id 
      AND assets.tenant_id = auth.current_user_tenant_id()
    )
  );

CREATE POLICY "Users can create maintenance records"
  ON public.maintenance_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = maintenance_records.asset_id 
      AND assets.tenant_id = auth.current_user_tenant_id()
    )
  );

-- MAINTENANCE ATTACHMENTS POLICIES
CREATE POLICY "Users can view maintenance attachments"
  ON public.maintenance_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.maintenance_records mr
      JOIN public.assets a ON a.id = mr.asset_id
      WHERE mr.id = maintenance_attachments.maintenance_id 
      AND a.tenant_id = auth.current_user_tenant_id()
    )
  );

CREATE POLICY "Users can add maintenance attachments"
  ON public.maintenance_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.maintenance_records mr
      JOIN public.assets a ON a.id = mr.asset_id
      WHERE mr.id = maintenance_attachments.maintenance_id 
      AND a.tenant_id = auth.current_user_tenant_id()
    )
  );

-- AUDIT LOG POLICIES (read-only for most users)
CREATE POLICY "Admins can view audit logs for their tenant"
  ON public.audit_log FOR SELECT
  USING (
    tenant_id = auth.current_user_tenant_id() AND 
    auth.current_user_role() IN ('admin', 'main_contractor')
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true); -- Allow system to log everything

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (tenant_id = auth.current_user_tenant_id());
