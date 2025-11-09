-- Contractor qualification and induction tracking
CREATE TYPE certification_type AS ENUM ('cscs', 'smsts', 'sssts', 'first_aid', 'confined_space', 'working_at_height', 'ipaf', 'cpcs', 'ecs', 'jib', 'eusr');

-- Contractor qualifications table
CREATE TABLE IF NOT EXISTS public.contractor_qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certification_type certification_type NOT NULL,
  certification_number TEXT,
  issued_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuing_authority TEXT,
  document_url TEXT, -- Scanned certificate/card
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- active, expired, pending_renewal, revoked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site induction records
CREATE TABLE IF NOT EXISTS public.site_inductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  inducted_by UUID NOT NULL REFERENCES public.profiles(id),
  induction_date TIMESTAMPTZ NOT NULL,
  induction_type TEXT DEFAULT 'general', -- general, specific, refresher
  hazards_briefed TEXT[], -- Array of hazards covered
  ppe_issued TEXT[], -- PPE provided
  emergency_procedures_covered BOOLEAN DEFAULT TRUE,
  signature_url TEXT, -- Digital signature
  valid_until DATE,
  status TEXT DEFAULT 'valid', -- valid, expired, revoked
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance records
CREATE TABLE IF NOT EXISTS public.contractor_insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insurance_type TEXT NOT NULL, -- 'public_liability', 'employers_liability', 'professional_indemnity'
  policy_number TEXT NOT NULL,
  provider TEXT NOT NULL,
  coverage_amount DECIMAL(12, 2),
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  document_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permit handover tracking
CREATE TABLE IF NOT EXISTS public.permit_handovers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permit_id UUID NOT NULL REFERENCES public.permits(id) ON DELETE CASCADE,
  handover_type TEXT NOT NULL, -- 'shift_change', 'work_complete', 'work_suspended', 'emergency_revocation'
  handed_over_by UUID NOT NULL REFERENCES public.profiles(id),
  handed_over_to UUID REFERENCES public.profiles(id),
  handover_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  work_status TEXT NOT NULL, -- 'complete', 'in_progress', 'suspended', 'equipment_isolated', 'area_secured'
  handover_notes TEXT NOT NULL,
  outstanding_actions TEXT,
  hazards_remaining TEXT,
  signature_from TEXT, -- Digital signature
  signature_to TEXT, -- Digital signature
  witness_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift handover logs
CREATE TABLE IF NOT EXISTS public.shift_handovers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL, -- 'day_to_night', 'night_to_day', 'weekend_to_weekday'
  outgoing_supervisor UUID NOT NULL REFERENCES public.profiles(id),
  incoming_supervisor UUID NOT NULL REFERENCES public.profiles(id),
  handover_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Key information to hand over
  active_permits UUID[], -- Array of active permit IDs
  ongoing_tasks UUID[], -- Array of task IDs in progress
  active_incidents UUID[], -- Array of open incident IDs
  equipment_status JSONB, -- Status of key equipment
  site_access_changes TEXT, -- Any access restrictions
  weather_concerns TEXT,
  safety_briefing TEXT NOT NULL,
  outstanding_actions TEXT,
  next_shift_priorities TEXT,
  
  -- Signatures
  signature_from TEXT,
  signature_to TEXT,
  handover_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SIMOPS (Simultaneous Operations) tracking
CREATE TABLE IF NOT EXISTS public.simops_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analyzed_by UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Tasks/permits being analyzed for conflicts
  permit_ids UUID[] NOT NULL,
  task_ids UUID[],
  zone_ids UUID[] NOT NULL,
  
  -- Risk assessment
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  potential_conflicts TEXT NOT NULL,
  control_measures TEXT NOT NULL,
  communication_plan TEXT NOT NULL,
  emergency_procedures TEXT,
  
  -- Approval
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Near miss tracking (separate from incidents)
CREATE TABLE IF NOT EXISTS public.near_misses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id),
  occurred_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  zone_id UUID REFERENCES public.zones(id),
  
  description TEXT NOT NULL,
  what_could_have_happened TEXT NOT NULL, -- Potential severity
  immediate_action_taken TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  preventive_measures TEXT,
  
  -- Learning and sharing
  lessons_learned TEXT,
  shared_with_team BOOLEAN DEFAULT FALSE,
  toolbox_talk_given BOOLEAN DEFAULT FALSE,
  
  status TEXT DEFAULT 'reported', -- reported, investigating, actions_complete, closed
  closed_by UUID REFERENCES public.profiles(id),
  closed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance checks (PUWER, LOLER, etc.)
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL, -- 'puwer', 'loler', 'coshh', 'dsear', 'work_at_height'
  asset_id UUID REFERENCES public.assets(id),
  zone_id UUID REFERENCES public.zones(id),
  
  check_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  performed_by UUID NOT NULL REFERENCES public.profiles(id),
  
  checklist_items JSONB NOT NULL, -- Array of check items with pass/fail
  overall_result TEXT NOT NULL, -- 'pass', 'fail', 'advisory'
  defects_found TEXT,
  immediate_actions_required TEXT,
  recommendations TEXT,
  
  next_check_due DATE,
  signed_off_by UUID REFERENCES public.profiles(id),
  signed_off_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_qualifications_profile ON public.contractor_qualifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_qualifications_expiry ON public.contractor_qualifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_qualifications_status ON public.contractor_qualifications(status);
CREATE INDEX IF NOT EXISTS idx_inductions_profile ON public.site_inductions(profile_id);
CREATE INDEX IF NOT EXISTS idx_inductions_tenant ON public.site_inductions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_profile ON public.contractor_insurance(profile_id);
CREATE INDEX IF NOT EXISTS idx_permit_handovers_permit ON public.permit_handovers(permit_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_tenant ON public.shift_handovers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_date ON public.shift_handovers(shift_date);
CREATE INDEX IF NOT EXISTS idx_simops_tenant ON public.simops_analysis(tenant_id);
CREATE INDEX IF NOT EXISTS idx_near_misses_tenant ON public.near_misses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_tenant ON public.compliance_checks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_asset ON public.compliance_checks(asset_id);

-- Triggers
CREATE TRIGGER update_qualifications_updated_at BEFORE UPDATE ON public.contractor_qualifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_updated_at BEFORE UPDATE ON public.contractor_insurance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_near_misses_updated_at BEFORE UPDATE ON public.near_misses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
