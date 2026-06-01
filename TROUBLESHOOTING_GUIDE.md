# Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Issue: PDFs Not Showing / "Lesson Not Found"

**What was happening:**
- PDFs were uploaded to Supabase Storage successfully
- Files existed in the bucket
- But the lesson page showed "Lesson not found" or PDFs wouldn't load

**Root Cause:**
Row Level Security (RLS) was blocking client-side database queries. When the client tried to fetch lesson data, Supabase returned a 406 error because RLS policies weren't configured.

**The Solution:**
1. **Server-Side Rendering**: Moved data fetching to the server component
2. **Admin Client**: Used `supabaseAdmin` (service role) to bypass RLS during fetch
3. **Pass Data Down**: Server fetches data, passes it to client component as props

**File Structure:**
```
page.tsx (Server Component)
  ↓ Fetches data with supabaseAdmin
  ↓ Bypasses RLS
  ↓
LessonPlayerClient.tsx (Client Component)
  ↓ Receives data as props
  ↓ Renders PDF viewer
```

**Why This Works:**
- Server-side code uses service role key (full access)
- Client-side code receives pre-fetched data (no RLS issues)
- PDFs in storage are public (required for browser viewing)

### Issue: Console Logs Exposing Data

**What was happening:**
- Console logs throughout the codebase
- Sensitive data visible in browser console
- Debug information exposed to users

**The Solution:**
- Removed ALL console.log statements
- Removed ALL console.error statements
- Removed ALL console.warn statements
- Silent error handling in production

**Why This Matters:**
- Users can see browser console
- Logs can expose database structure
- Error messages can reveal sensitive info
- Professional apps don't log to console

### Issue: Debug Routes Accessible

**What was happening:**
- `/api/check-storage` endpoint existed
- `/api/fix-lessons` endpoint existed
- `/admin/fix-lessons` page existed
- Anyone could access diagnostic info

**The Solution:**
- Deleted all debug routes
- Removed diagnostic endpoints
- Cleaned up admin debug pages

**Why This Matters:**
- Debug endpoints can expose system info
- Attackers can probe for vulnerabilities
- Production apps shouldn't have debug routes

## 🔐 Security Best Practices

### 1. Row Level Security (RLS)

**Always enable RLS on all tables:**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**Create policies for each access pattern:**
- Students can read published courses
- Students can modify own progress
- Admins can access everything

### 2. Server vs Client Data Fetching

**Use Server Components when:**
- Fetching sensitive data
- Need to bypass RLS
- Want to hide database structure
- Performing admin operations

**Use Client Components when:**
- Need interactivity (buttons, forms)
- Using React hooks (useState, useEffect)
- Handling user input
- Rendering dynamic UI

### 3. Environment Variables

**Never expose service role key to client:**
```typescript
// ❌ BAD - Exposes service role key
const supabase = createClient(url, serviceRoleKey)

// ✅ GOOD - Use anon key on client
const supabase = createClient(url, anonKey)

// ✅ GOOD - Use service role on server only
const supabaseAdmin = createClient(url, serviceRoleKey)
```

### 4. Error Handling

**Don't expose error details to users:**
```typescript
// ❌ BAD
catch (error) {
  console.error('Database error:', error)
  return { error: error.message }
}

// ✅ GOOD
catch (error) {
  // Log to monitoring service (not console)
  return { error: 'Something went wrong' }
}
```

## 🐛 Debugging in Development

### How to Debug Without Console Logs

**Option 1: Use Debugger**
```typescript
debugger; // Pauses execution in browser DevTools
```

**Option 2: Use Breakpoints**
- Open Chrome DevTools
- Go to Sources tab
- Click line number to set breakpoint

**Option 3: Use Development-Only Logs**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}
```

### How to Test RLS Policies

**Option 1: Supabase Dashboard**
- Go to Authentication → Policies
- Click "Test Policy"
- Try different user scenarios

**Option 2: Test with Different Users**
- Create test student account
- Create test admin account
- Try accessing different data
- Verify isolation

**Option 3: Check Logs**
- Supabase Dashboard → Logs
- Look for 406 errors (RLS blocking)
- Look for unauthorized access attempts

## 📊 Monitoring Production

### What to Monitor

**1. Authentication Issues**
- Failed login attempts
- Unusual signup patterns
- Token expiration errors

**2. Database Errors**
- RLS policy violations (406 errors)
- Query timeouts
- Connection issues

**3. Storage Issues**
- Failed uploads
- Missing files
- Access denied errors

### Where to Monitor

**Clerk Dashboard:**
- User activity
- Authentication logs
- Webhook deliveries

**Supabase Dashboard:**
- Database logs
- API usage
- Storage metrics

**Vercel Dashboard:**
- Function errors
- Response times
- Deployment logs

## 🆘 Emergency Procedures

### If Users Can't Access Content

1. **Check RLS Policies**
   - Are they applied?
   - Are they too restrictive?
   - Test with different users

2. **Check Storage Permissions**
   - Are buckets public?
   - Are files accessible?
   - Test URLs directly

3. **Check Authentication**
   - Is Clerk working?
   - Are tokens valid?
   - Check middleware

### If Data is Exposed

1. **Immediately:**
   - Rotate all API keys
   - Check access logs
   - Identify what was exposed

2. **Within 1 Hour:**
   - Update RLS policies
   - Deploy fixes
   - Monitor for abuse

3. **Within 24 Hours:**
   - Audit all accounts
   - Review security measures
   - Document incident

### If Site is Down

1. **Check Vercel Status**
   - Is deployment successful?
   - Are functions running?
   - Check error logs

2. **Check Supabase Status**
   - Is database online?
   - Are connections working?
   - Check usage limits

3. **Check Clerk Status**
   - Is authentication working?
   - Are webhooks delivering?
   - Check API status

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk Authentication Guide](https://clerk.com/docs)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Vercel Deployment Guide](https://vercel.com/docs)

## ✅ Quick Reference

### Common Commands

```bash
# Run security verification
./verify-security.sh

# Check for console logs
grep -r "console\." src --include="*.ts" --include="*.tsx"

# Build for production
npm run build

# Start production server locally
npm run start
```

### Common Fixes

**PDF not loading:**
- Check if file exists in storage
- Verify URL is correct
- Check storage bucket is public
- Verify RLS policies allow access

**Lesson not found:**
- Check if lesson exists in database
- Verify course is published
- Check RLS policies
- Use server-side fetching

**Access denied:**
- Check authentication
- Verify user role
- Check RLS policies
- Review middleware config

---

**Remember:** Most issues are caused by RLS policies or client/server data fetching. Always check these first!
