# Rapid Site Connect

A comprehensive Progressive Web Application (PWA) for construction site management, built with Next.js, Supabase, and deployed on Vercel.

## Features

### Core Modules
- **Authentication & Authorization** - Secure email/password login with role-based access control
- **Dashboard** - Real-time statistics and overview of site activity
- **Task Management** - Create, assign, and track tasks across the site
- **Safety & Compliance** - Incident reporting and CDM 2015 compliance tracking
- **Permit Management** - Digital Permit-to-Work system
- **PPM Tracking** - Planned Preventive Maintenance for assets and equipment
- **Communication** - Team messaging, announcements, and safety alerts
- **Team Directory** - View and contact all site personnel
- **Site Mapping** - Interactive zone management (integration ready)

### Technical Features
- **Offline Support** - Works without internet, syncs when connection restored
- **PWA Capabilities** - Install on mobile devices, works like a native app
- **Multi-tenant Architecture** - Secure data isolation per construction site
- **Row Level Security** - Database-level security with Supabase RLS
- **Real-time Updates** - Live data synchronization across team members
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **State Management**: React Server Components + Client Components
- **Offline Storage**: IndexedDB

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project
- A Vercel account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   - The Supabase integration is already connected in this v0 workspace
   - For local development, add `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

4. Run the database scripts in order from the `scripts/` folder:
   - `001_initial_schema.sql` - Creates all tables and indexes
   - `002_rls_policies.sql` - Sets up Row Level Security
   - `003_profile_trigger.sql` - Auto-creates profiles on signup
   - `004_seed_data.sql` - Seeds demo tenant data

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

### Optional: Enable Live Site Mapping

To enable interactive Mapbox site maps:
1. Sign up for a free Mapbox account at mapbox.com
2. Add your Mapbox token to environment variables via the Vars section in the sidebar
3. Restart the development server to activate mapping features

### Optional: Enable File Uploads

To enable photo uploads for incidents and maintenance:
1. In Supabase Dashboard, go to Storage
2. Create public buckets: `attachments` and `incident-photos`
3. Configure bucket policies for authenticated uploads

## Database Schema

The application uses a multi-tenant architecture with the following main tables:

- `tenants` - Construction sites (each site is a tenant)
- `profiles` - User profiles extending Supabase auth
- `tasks` - Task management with assignments
- `incidents` - Safety incident reporting
- `permits` - Permit-to-Work records
- `assets` - Equipment and asset tracking
- `maintenance_records` - PPM history
- `messages` - Team communication
- `zones` - Geofenced site areas
- `audit_log` - Full activity audit trail
- `notifications` - User notifications

All tables have Row Level Security enabled to ensure data isolation between tenants and proper access control.

## User Roles

- **Admin** - Full system access
- **Main Contractor** - Site-wide management
- **Safety Officer** - Safety and compliance management
- **Supervisor** - Team and task management
- **Subcontractor** - Limited access to assigned work
- **Worker** - View and update assigned tasks

## Deployment

This application is designed to be deployed on Vercel:

1. Push to GitHub
2. Import to Vercel
3. Connect Supabase integration
4. Deploy

The application will automatically use Vercel's environment variables for Supabase.

## Offline Functionality

The PWA uses IndexedDB to cache data for offline use:
- Tasks and their details
- Safety forms and incident reports
- Team directory
- Recent messages

Changes made offline are queued and automatically synced when connection is restored.

## CDM 2015 Compliance

The system supports CDM 2015 compliance requirements:
- Digital audit trail of all activities
- Incident and near-miss reporting
- RIDDOR incident flagging
- Permit-to-Work system
- Risk assessment documentation
- Competency tracking via user profiles

## What Makes This App Unique

### Solves Real Construction Problems
- **Replaces WhatsApp chaos** - Centralized, auditable communication
- **Eliminates paper trails** - Digital forms with photo evidence
- **Ensures accountability** - Every action logged with timestamp and user
- **Works offline** - Field workers stay productive without connectivity
- **Real-time visibility** - Site managers see live activity across all zones
- **Compliance by design** - CDM 2015 and RIDDOR built into workflows

### Built for Construction Sites
- Multi-tenant architecture for multiple simultaneous projects
- Role-based access for different contractor types
- Photo evidence capture for completed work
- Zone-based work tracking with geofencing ready
- Emergency contact integration
- Audit trail for HSE inspections

## Future Enhancements

- Mapbox integration for interactive site mapping
- QR code scanning for asset identification
- Push notifications via Web Push API
- Document storage with Supabase Storage
- Advanced analytics and reporting
- AI-powered safety insights
- Integration with external HSE systems

## Support

For issues or questions, please refer to the project documentation or contact your system administrator.

## License

Proprietary - All rights reserved
