-- Add onboarding and provisioning tables

-- Site templates table for rapid deployment
CREATE TABLE IF NOT EXISTS public.site_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_master BOOLEAN DEFAULT FALSE,
  template_data JSONB NOT NULL, -- stores zones, roles, permits, forms structure
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding tokens for QR-based account claiming
CREATE TABLE IF NOT EXISTS public.onboarding_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker documents for right-to-work and compliance
CREATE TABLE IF NOT EXISTS public.worker_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'passport', 'visa', 'cscs_card', 'driving_license', 'qualification'
  document_number TEXT,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Induction modules and content
CREATE TABLE IF NOT EXISTS public.induction_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL, -- 'full', 'visitor', 'contractor_specific'
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- structured content: videos, PDFs, questions, acknowledgments
  duration_minutes INTEGER,
  mandatory BOOLEAN DEFAULT TRUE,
  for_roles TEXT[], -- array of roles this module applies to
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RAMS (Risk Assessment Method Statements) documents
CREATE TABLE IF NOT EXISTS public.rams_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_number TEXT UNIQUE,
  activity_description TEXT NOT NULL,
  hazards JSONB, -- array of identified hazards
  risk_level TEXT, -- 'low', 'medium', 'high', 'very_high'
  control_measures JSONB, -- array of control measures
  required_ppe TEXT[],
  required_qualifications TEXT[],
  file_url TEXT,
  status TEXT DEFAULT 'draft', -- draft, pending_approval, approved, archived
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  valid_from DATE,
  valid_to DATE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RAMS acknowledgments/signatures
CREATE TABLE IF NOT EXISTS public.rams_acknowledgments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rams_id UUID NOT NULL REFERENCES public.rams_documents(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signature_data TEXT, -- base64 signature image
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  device_info TEXT,
  UNIQUE(rams_id, profile_id)
);

-- Induction completions
CREATE TABLE IF NOT EXISTS public.induction_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.induction_modules(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER, -- if module has quiz
  passed BOOLEAN DEFAULT TRUE,
  completion_data JSONB, -- stores answers, acknowledgments, etc.
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  certificate_url TEXT,
  UNIQUE(module_id, profile_id)
);

-- Site attendance tracking for real-time roll-call
CREATE TABLE IF NOT EXISTS public.site_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  zone_id UUID REFERENCES public.zones(id),
  check_in_method TEXT, -- 'qr', 'kiosk', 'app', 'rfid'
  is_visitor BOOLEAN DEFAULT FALSE,
  escort_name TEXT, -- if visitor is escorted
  purpose TEXT, -- for visitors
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor pre-registration
CREATE TABLE IF NOT EXISTS public.visitor_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  visitor_phone TEXT,
  visitor_company TEXT,
  host_id UUID REFERENCES public.profiles(id),
  expected_date DATE NOT NULL,
  purpose TEXT,
  requires_escort BOOLEAN DEFAULT TRUE,
  induction_completed BOOLEAN DEFAULT FALSE,
  qr_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, approved, checked_in, checked_out, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_tokens_token ON public.onboarding_tokens(token);
CREATE INDEX IF NOT EXISTS idx_onboarding_tokens_profile ON public.onboarding_tokens(profile_id);
CREATE INDEX IF NOT EXISTS idx_worker_docs_profile ON public.worker_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_worker_docs_expiry ON public.worker_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_induction_modules_tenant ON public.induction_modules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rams_tenant ON public.rams_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rams_ack_profile ON public.rams_acknowledgments(profile_id);
CREATE INDEX IF NOT EXISTS idx_induction_completions_profile ON public.induction_completions(profile_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date ON public.site_attendance(tenant_id, check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_active ON public.site_attendance(tenant_id, profile_id) WHERE check_out_time IS NULL;
CREATE INDEX IF NOT EXISTS idx_visitor_reg_tenant ON public.visitor_registrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitor_reg_date ON public.visitor_registrations(expected_date);

-- Add triggers for updated_at
CREATE TRIGGER update_site_templates_updated_at BEFORE UPDATE ON public.site_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_documents_updated_at BEFORE UPDATE ON public.worker_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_induction_modules_updated_at BEFORE UPDATE ON public.induction_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rams_documents_updated_at BEFORE UPDATE ON public.rams_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visitor_registrations_updated_at BEFORE UPDATE ON public.visitor_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
