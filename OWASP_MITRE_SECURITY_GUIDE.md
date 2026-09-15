# OWASP Top 10 & MITRE ATT&CK Security Guide

## 🛡️ OWASP Top 10 Compliance

### A01:2021 - Broken Access Control
**WelNex Implementation:**
- ✅ Row Level Security (RLS) on all database tables
- ✅ Role-based access control (user, admin, investment_provider, accredited_investor)
- ✅ Middleware protects admin and provider routes
- ✅ Users can only access their own data (users table, waitlist, bookmarks)
- ✅ Investment providers can only manage their own listings
- ✅ Anonymous users can only view published listings
- ✅ Never expose service role key to client

**Mitigation Checklist:**
- [ ] RLS enabled on all tables
- [ ] Role checks on every protected route
- [ ] No direct database access from client components
- [ ] Service role key only used in server-side actions
- [ ] Policy reviewed quarterly

---

### A02:2021 - Cryptographic Failures
**WelNex Implementation:**
- ✅ HTTPS automatic on Vercel
- ✅ Environment variables never committed to git
- ✅ Service role key encrypted in Vercel dashboard
- ✅ Clerk uses JWT with signed tokens
- ✅ Supabase connection over HTTPS only

**Mitigation Checklist:**
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Never commit .env.local to version control
- [ ] Service role keys stored securely in vault/environment
- [ ] All cookies have `Secure` flag
- [ ] JWT tokens validated on every request

---

### A03:2021 - Injection
**WelNex Implementation:**
- ✅ Parameterized queries via Supabase (no raw SQL concatenation)
- ✅ User input validated against schemas
- ✅ RLS policies prevent SQL injection via access patterns
- ✅ No raw SQL execution in client code
- ✅ Content sanitized for rich text (Tiptap with sanitization)

**Mitigation Checklist:**
- [ ] All database queries use parameterized queries
- [ ] User input validated against allowed types/enums
- [ ] No string concatenation in SQL queries
- [ ] Rich text editor content sanitized on server
- [ ] Error messages don't expose database structure

---

### A04:2021 - Insecure Design
**WelNex Implementation:**
- ✅ Secure by design - RLS policies enforced at database level
- ✅ Threat modeling completed for marketplace features
- ✅ No debug endpoints in production
- ✅ Security requirements documented before implementation
- ✅ Input validation on all server actions

**Mitigation Checklist:**
- [ ] Security requirements documented (this guide)
- [ ] Threat modeling completed
- [ ] No shortcuts bypassing security checks
- [ ] All features go through proper authentication flow
- [ ] Error handling doesn't leak sensitive info

---

### A05:2021 - Security Misconfiguration
**WelNex Implementation:**
- ✅ Environment variable validation on startup
- ✅ No default/debug passwords
- ✅ RLS policies applied before deployment
- ✅ Vercel environment variables (not .env.local in repo)
- ✅ Regular dependency updates

**Mitigation Checklist:**
- [ ] Environment variables validated at runtime
- [ ] No debug modes in production build
- [ ] RLS policies applied before going live
- [ ] Vercel used for environment variable management
- [ ] Dependencies regularly updated (`npm audit`)

---

### A06:2021 - Vulnerable and Outdated Components
**WelNex Implementation:**
- ✅ Dependencies monitored via package.json
- ✅ Regular `npm audit` runs
- ✅ Dependencies updated as needed
- ✅ No deprecated APIs used without replacement

**Mitigation Checklist:**
- [ ] `npm audit` run before deployment
- [ ] Dependencies updated regularly
- [ ] No known vulnerable versions in use
- [ ] Peer dependencies also checked

---

### A07:2021 - Identification and Authentication Failures
**WelNex Implementation:**
- ✅ Clerk handles all authentication
- ✅ JWT tokens validated on every request
- ✅ Role-based access control (admin vs user vs provider)
- ✅ Session management with Clerk
- ✅ No hardcoded authentication checks

**Mitigation Checklist:**
- [ ] Clerk production keys configured
- [ ] JWT tokens validated on every request
- [ ] Role-based access control implemented
- [ ] Session persistence managed by Clerk
- [ ] No custom auth logic that could fail

---

### A08:2021 - Software and Data Integrity
**WelNex Implementation:**
- ✅ Storage bucket policies validated
- ✅ File uploads sanitized and validated
- ✅ RLS policies ensure data integrity
- ✅ Supabase recommended best practices followed
- ✅ No unsigned file uploads

**Mitigation Checklist:**
- [ ] File uploads validated (type, size, content)
- [ ] Bucket policies restrict unauthorized access
- [ ] All integrations use verified connections
- [ ] Database schema migrations tracked
- [ ] Content sanitized before storage

---

### A09:2021 - Security Logging and Monitoring
**WelNex Implementation:**
- ✅ Console logs removed from production
- ✅ Structured error handling (no sensitive data exposure)
- ✅ Clerk dashboard for auth monitoring
- ✅ Supabase logs for database activity
- ✅ Vercel analytics for traffic patterns

**Mitigation Checklist:**
- [ ] No console.log in production code
- [ ] Errors logged to monitoring, not displayed to users
- [ ] Clerk dashboard monitored for failed logins
- [ ] Supabase logs reviewed regularly
- [ ] Vercel analytics enabled

---

### A10:2021 - Server-Side Request Forgery (SSRF)
**WelNex Implementation:**
- ✅ All external URLs validated and whitelisted
- ✅ Investment broker URLs validated
- ✅ No direct database URL exposure to client
- ✅ Storage URLs signed and time-limited where needed

**Mitigation Checklist:**
- [ ] External URLs validated/whitelisted
- [ ] No user-controlled redirects to arbitrary URLs
- [ ] Storage URLs signed with expiration
- [ ] No SSRF vulnerabilities in proxy endpoints

---

## 🐧 MITRE ATT&CK Framework Mitigations

### Initial Access Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Default Accounts | Custom Clerk roles, no default admin accounts |
| Default Credentials | No hardcoded credentials, all env vars |
| Phishing | Clerk OAuth, user education via Learning Hub |
| **Mitigation** | ✅ Strong authentication, MFA via Clerk, suspicious login monitoring |

### Execution Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Command Injection | All inputs validated, no `exec()` usage |
| Cross-site Scripting | Rich text sanitized, CSP headers, output encoding |
| **Mitigation** | ✅ Input validation, XSS prevention, content sanitization |

### Persistence Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Account Manipulation | RLS policies, role-based access, audit logs |
| Server-side Shopping | Not applicable - marketplace model |
| **Mitigation** | ✅ RLS on all tables, role checks, activity logging |

### Privilege Escalation Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Unprotected Privileges | RBAC with 4 roles: user, admin, investment_provider, accredited_investor |
| **Mitigation** | ✅ Four-tier RBAC, least privilege principle, policy reviews |

### Defense Evasion Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Obfuscation | TypeScript for type safety, no eval() |
| **Mitigation** | ✅ TypeScript, no dynamic code execution, error sanitization |

### Credential Access Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Password Guessing | Clerk rate limiting, account lockout |
| Credential Stuffing | Clerk security features, CAPTCHA on sign-up |
| **Mitigation** | ✅ Clerk handles auth, no service role key to client, webhook monitoring |

### Discovery Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| File Discovery | No debug endpoints, all routes protected |
| **Mitigation** | ✅ No debug routes, minimal error info, RLS hides data structure |

### Lateral Movement Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Internal System Discovery | RLS prevents cross-user data access |
| **Mitigation** | ✅ RLS on all tables, users can only see own data, provider sees own listings |

### Collection Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Data Staging | Input validation, output formatting |
| **Mitigation** | ✅ Input validation, sanitized outputs, rate limiting concepts |

### Exfiltration Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Exfiltration Over | Rate limiting, monitoring, anomaly detection |
| **Mitigation** | ✅ Monitoring dashboards, anomaly detection concepts, logging |

### Impact Mitigation
| Technique | WelNex Control |
|-----------|---------------------|
| Service Stopping | Graceful error handling, fallback states |
| **Mitigation** | ✅ Error boundaries, fallback UIs, monitoring alerts |

---

## 📁 File Upload Security

### Upload Validation Checklist
| Check | Implementation |
|-------|---------------|
| File Type Validation | MIME type verification + extension whitelist |
| File Size Limits | Max 10MB for logos, 50MB for brochures |
| Content-Type Verification | Server-side verification, not client-trusted |
| Path Traversal Prevention | Sanitized filenames, no user-controlled paths |
| Virus scanning | Integration ready (ClamAV or similar) |
| **Buckets**: | - `investment-logos`: public read, admin write<br>- `investment-banners`: public read, admin write<br>- `learning-pdfs`: public read, admin write<br>- `brochures`: public read, admin write |

### MIME Type Whitelist
- Images: `image/jpeg`, `image/png`, `image/svg+xml`, `image/webp`
- PDFs: `application/pdf`
- Documents: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Maximum File Sizes
- Logos: 2MB
- Banners: 5MB
- Brochures/Pdfs: 10MB

---

## 🔐 RBAC Role Summary

| Role | Permissions |
|------|-------------|
| **user** | - View published listings<br>- View learning content<br>- Submit waitlist<br>- Bookmark investments<br>- Use calculators<br>- Access dashboard|
| **admin** | - Full access to all tables<br>- Manage categories, providers, listings<br>- Manage SEO metadata<br>- View all waitlist entries<br>- Manage learning content<br>- View all bookmarks|
| **investment_provider** | - Manage own listings only<br>- Upload own media<br>- View own analytics<br>- Cannot access admin panel or other providers' data|
| **accredited_investor** | - Access accredited investment opportunities<br>- Higher minimum investment filters<br>- Access to private credit/invit opportunities<br>- Same as user otherwise |

---

## 🚨 Incident Response Guide

### If Security Breach Suspected:

1. **Immediately:**
   - [ ] Rotate all keys: Clerk, Supabase service role, any API keys
   - [ ] Check Supabase logs for unauthorized queries
   - [ ] Review recent admin activity in Clerk dashboard
   - [ ] Disable compromised accounts

2. **Within 1 Hour:**
   - [ ] Update all RLS policies if needed
   - [ ] Deploy security fixes
   - [ ] Monitor for abuse patterns
   - [ ] Force re-deploy application

3. **Within 24 Hours:**
   - [ ] Audit all user accounts
   - [ ] Review all RLS policies
   - [ ] Notify affected users if data exposed
   - [ ] Document the incident and response

4. **Quarterly:**
   - [ ] Full security audit
   - [ ] RLS policy review and optimization
   - [ ] Dependency vulnerability scan
   - [ ] Update this security guide

### Data Exposure Response:
1. Identify what data was exposed (check Supabase logs)
2. Rotate relevant keys immediately
3. Update RLS policies to be more restrictive
4. Deploy fix and monitor for abuse
5. Notify affected users if PII was exposed
6. Document for compliance requirements

---

## 📊 Security Monitoring Dashboard

### What to Monitor Daily:
1. **Clerk Dashboard:**
   - Failed login attempts
   - Unusual signup patterns
   - Token expiration errors
   - Webhook delivery failures

2. **Supabase Dashboard:**
   - Database query patterns
   - RLS policy violations (406 errors)
   - API usage spikes
   - Storage access anomalies

3. **Vercel Dashboard:**
   - Error rates and types
   - Function execution times
   - Deployment success/failure
   - Traffic anomalies

### What to Monitor Weekly:
- [ ] Review all three dashboards above
- [ ] Check for unusual API call patterns
- [ ] Monitor storage usage trends
- [ ] Review new user signups

### What to Monitor Monthly:
- [ ] Full security audit
- [ ] Update dependencies
- [ ] Review and optimize RLS policies
- [ ] Audit admin user accounts
- [ ] Check for security updates in dependencies

### Quarterly:
- [ ] Rotate API keys (if compromised)
- [ ] Full security penetration test consideration
- [ ] Update this security guide
- [ ] Compliance audit (if applicable)

---

## ⚠️ Critical Security Rules

### ❌ NEVER Do:
1. ❌ Commit `.env.local` to git
2. ❌ Expose `SUPABASE_SERVICE_ROLE_KEY` to client code
3. ❌ Use `console.log()` with sensitive data in production
4. ❌ Disable RLS on production tables
5. ❌ Skip RLS policy application before deployment
6. ❌ Use development Clerk keys in production
7. ❌ Expose debug endpoints in production
8. ❌ Allow unlimited file uploads without validation
9. ❌ Use client-side only data fetching for sensitive data
10. ❌ Skip environment variable validation

### ✅ Always Do:
1. ✅ Enable RLS on all database tables
2. ✅ Use environment variables for all secrets
3. ✅ Validate all user input before database operations
4. ✅ Use server actions for data mutations
5. ✅ Sanitize rich text content before storage
6. ✅ Validate file uploads (type, size, content)
7. ✅ Monitor security dashboards regularly
8. ✅ Keep dependencies updated
9. ✅ Test RLS policies before deploying
10. ✅ Use production keys in production environment

---

## 🛠️ Security Testing Checklist

### Pre-Deployment:
- [ ] RLS policies applied and tested
- [ ] Environment variables set in Vercel (not in repo)
- [ ] No console.log statements with sensitive data
- [ ] Debug routes removed
- [ ] All auth routes protected
- [ ] File upload validation configured
- [ ] Error handling tested (no sensitive data leaks)
- [ ] SEO metadata generated for key pages
- [ ] Mobile responsiveness tested
- [ ] Backup verification

### Post-Deployment:
- [ ] Test as unauthenticated user
- [ ] Test as regular user
- [ ] Test as admin user
- [ ] Test as investment provider
- [ ] Test file uploads with invalid types
- [ ] Test XSS scenarios
- [ ] Test SQL injection prevention
- [ ] Monitor dashboards for 24 hours
- [ ] Review logs for anomalies

---

## 📝 Document History

| Date | Version | Changes |
|------|---------|---------|
| 2026 | 1.0 | Initial security guide creation for WelNex marketplace pivot |
| — | — | — |

**Last Updated:** August 17, 2026

**Applies to:** All WelNex marketplace deployments

**Maintainers:** Development Team

**Review Required:** Every quarter or after major feature releases