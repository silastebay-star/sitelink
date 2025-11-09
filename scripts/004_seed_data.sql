-- Seed a demo tenant
INSERT INTO public.tenants (id, name, location, contact_email, contact_phone)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Crossrail Station Development',
  'London, UK',
  'admin@crossrail-demo.com',
  '+44 20 7946 0958'
)
ON CONFLICT (id) DO NOTHING;

-- Note: Users will be created through the signup flow
-- The trigger will automatically create their profiles
