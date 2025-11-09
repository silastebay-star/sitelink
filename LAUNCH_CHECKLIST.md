# Rapid Site Connect - Production Launch Checklist

## Pre-Launch Tasks

### Infrastructure Setup
- [ ] Supabase production project created
- [ ] Vercel project configured for production
- [ ] GitHub repository set up with branch protection
- [ ] CI/CD pipeline configured and tested
- [ ] All environment variables set in Vercel
- [ ] Database migrations tested in staging
- [ ] Backup strategy implemented and tested

### Security & Compliance
- [ ] All RLS policies reviewed and tested
- [ ] TLS/HTTPS enforced on all endpoints
- [ ] MFA enabled for admin accounts
- [ ] Data retention policies configured
- [ ] GDPR compliance verified
- [ ] Penetration testing completed
- [ ] Security headers configured
- [ ] API rate limiting implemented

### Database
- [ ] All migration scripts run successfully
- [ ] PostGIS extension enabled
- [ ] Indexes created on critical columns
- [ ] RLS isolation tested (cross-tenant access blocked)
- [ ] Backup schedule configured
- [ ] Connection pooling configured

### Storage & Media
- [ ] Supabase Storage buckets created
- [ ] Bucket policies configured (private by default)
- [ ] Signed URLs implemented
- [ ] Checksum validation working
- [ ] Storage lifecycle policies defined
- [ ] Media retention tested

### Offline & PWA
- [ ] Service worker registered successfully
- [ ] IndexedDB schema implemented
- [ ] Offline sync tested (create/edit/delete)
- [ ] Conflict resolution UI tested
- [ ] PWA installable on mobile devices
- [ ] Push notifications working

### Integrations
- [ ] Mapbox integration tested (optional)
- [ ] SendGrid/email service configured
- [ ] SMS service configured (Twilio)
- [ ] Payment integration tested (Stripe)
- [ ] SSO integrations tested (Azure AD/Okta)
- [ ] ID verification service tested

### Monitoring & Observability
- [ ] Error tracking configured (Sentry)
- [ ] Application logs centralized
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Alert channels configured (Slack/Teams)
- [ ] Dashboard created for key metrics

### Testing
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing (critical flows)
- [ ] Load testing completed (5k concurrent users)
- [ ] Security scanning passed (SAST)
- [ ] Accessibility audit completed

### Performance
- [ ] API latency < 200ms for core endpoints
- [ ] Database query optimization complete
- [ ] CDN configured for static assets
- [ ] Image optimization enabled
- [ ] Bundle size optimized
- [ ] Lighthouse score > 90

### Documentation
- [ ] API documentation published (OpenAPI)
- [ ] Admin user guide complete
- [ ] Worker onboarding guide complete
- [ ] Runbook for incidents complete
- [ ] Architecture diagrams updated
- [ ] Data flow diagrams complete

### Legal & Compliance
- [ ] Terms of Service finalized
- [ ] Data Processing Agreement signed
- [ ] Privacy Policy published
- [ ] Cookie policy implemented
- [ ] GDPR data export tested
- [ ] CDM 2015 compliance verified

### Pilot Site Setup (EREN Shotton)
- [ ] Tenant created and configured
- [ ] Admin accounts provisioned
- [ ] Site zones mapped
- [ ] Sample data seeded
- [ ] Worker accounts pre-provisioned
- [ ] QR codes generated for onboarding
- [ ] Induction modules configured
- [ ] RAMS documents uploaded

### Training & Support
- [ ] Admin training completed
- [ ] Worker onboarding tested
- [ ] Support team trained
- [ ] On-call rotation established
- [ ] Escalation matrix defined
- [ ] SLA definitions agreed

### Launch Day
- [ ] Final DB migration applied
- [ ] Production deployment completed
- [ ] Health checks passing
- [ ] DNS configured
- [ ] SSL certificates valid
- [ ] Monitoring alerts active
- [ ] Support team on standby
- [ ] Communication plan executed

### Post-Launch (Week 1)
- [ ] Daily health checks
- [ ] User feedback collected
- [ ] Performance metrics reviewed
- [ ] Error rate monitored
- [ ] Support tickets triaged
- [ ] Hotfix process tested

### Post-Launch (30/60/90 Days)
- [ ] KPI tracking dashboard
- [ ] User satisfaction survey
- [ ] Performance optimization review
- [ ] Feature usage analytics
- [ ] Cost optimization review
- [ ] Security audit scheduled

## Critical Success Metrics

### Week 1 Targets
- System uptime: > 99.5%
- API error rate: < 1%
- Average response time: < 200ms
- Successful worker onboardings: 100%
- Zero security incidents

### Month 1 Targets
- Daily active users: 500+
- Tasks created: 1000+
- Incidents reported: < 10
- Permits issued: 200+
- System uptime: > 99.9%

## Emergency Contacts

**Technical Lead:**
**DevOps Lead:**
**Security Lead:**
**Product Owner:**

## Rollback Plan

If critical issues occur:
1. Assess impact and severity
2. Communicate to stakeholders
3. Execute rollback via Vercel deployments
4. Restore database from backup if needed
5. Post-incident review within 24 hours

---

**Sign-Off Required:**
- [ ] Technical Lead: _________________ Date: _______
- [ ] Security Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] Client Stakeholder: _____________ Date: _______
