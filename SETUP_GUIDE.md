# Rapid Site Connect - Setup Guide

## Quick Start (5 minutes)

### Step 1: Run Database Scripts

1. Open the Supabase SQL Editor from your project dashboard
2. Run each script in order:

**001_initial_schema.sql**
- Creates all database tables
- Sets up user roles and enums
- Installs PostGIS for mapping

**002_rls_policies.sql**
- Enables Row Level Security
- Creates tenant isolation policies
- Sets up role-based access

**003_profile_trigger.sql**
- Auto-creates profiles for new users
- Links users to tenants

**004_seed_data.sql**
- Creates sample tenant "Greenfield Construction"
- Adds example zones and data

### Step 2: Create Your First User

1. Go to `/auth/signup` in your app
2. Sign up with your email
3. Check email for verification link
4. You'll be assigned to the default tenant

### Step 3: Configure Storage (for photos)

1. In Supabase Dashboard → Storage
2. Create buckets:
   - Name: `attachments`, Public: Yes
   - Name: `incident-photos`, Public: Yes
3. Set policies to allow authenticated uploads

### Step 4: Optional Features

**Live Site Mapping**
- Add `NEXT_PUBLIC_MAPBOX_TOKEN` in Vars section
- Get token from mapbox.com (free tier available)

**Custom Email Domain**
- Configure in Supabase → Authentication → Email Templates

## User Management

### Adding Team Members

1. Navigate to Settings → Team (when implemented)
2. Or: Invite via email signup link
3. Set role in database profiles table

### Roles & Permissions

| Role | Permissions |
|------|------------|
| Admin | Full access, user management |
| Main Contractor | Approve permits, oversight |
| Safety Officer | Incident management, compliance |
| Supervisor | Task assignment, team coordination |
| Subcontractor | Task management |
| Worker | View tasks, report incidents |

## Troubleshooting

**Can't create tasks/incidents**
- Check RLS policies are enabled
- Verify user has profile in profiles table
- Ensure tenant_id is set

**Photos not uploading**
- Create storage buckets in Supabase
- Set public access policies
- Check browser console for errors

**Offline sync not working**
- Enable service worker in browser
- Check IndexedDB is available
- Clear browser cache and retry

**Map not loading**
- Add NEXT_PUBLIC_MAPBOX_TOKEN to env vars
- Verify token is valid at mapbox.com
- Check browser console for errors

## Production Checklist

- [ ] Run all database scripts
- [ ] Configure RLS policies
- [ ] Set up storage buckets
- [ ] Configure email templates
- [ ] Add custom domain
- [ ] Enable SSL/HTTPS
- [ ] Configure backup schedule
- [ ] Test offline functionality
- [ ] Train site managers
- [ ] Create user documentation

## Support

Environment variables managed in Vars section (sidebar)
Database access via Supabase dashboard
File uploads via Supabase Storage

For technical support: vercel.com/help
