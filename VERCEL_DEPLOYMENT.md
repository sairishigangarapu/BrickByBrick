# Vercel Deployment Guide

## 🚀 Deploy BrickByBrick to Vercel

### Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose: `sairishigangarapu/BrickByBrick`
5. Click **"Import"**

### Step 2: Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `./` (leave as default)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

**Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add these:

#### Required Variables:

```bash
# Clerk Authentication (Use PRODUCTION keys!)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Supabase Database (Use PRODUCTION database!)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### Optional Variables:

```bash
# Clerk Webhooks (Recommended)
CLERK_WEBHOOK_SECRET=whsec_...

# UploadThing (If using file uploads)
UPLOADTHING_TOKEN=eyJ...
```

**Important Notes:**
- Use **production keys** (pk_live_, sk_live_) NOT development keys
- Use your **production Supabase database**
- Never expose service role key in client code

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Your site will be live at: `https://your-project.vercel.app`

### Step 5: Apply RLS Policies (CRITICAL!)

**Before users can access your site:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **production project**
3. Click **SQL Editor** in sidebar
4. Click **"New Query"**
5. Copy entire contents of `supabase/security-policies.sql`
6. Paste into editor
7. Click **"Run"** (or Ctrl+Enter)
8. Verify: "Success. No rows returned"

**What this does:**
- Enables Row Level Security on all tables
- Prevents unauthorized data access
- Restricts students to published courses only
- Protects user data and progress

### Step 6: Configure Clerk Production

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **"Domains"**
4. Add your Vercel domain: `your-project.vercel.app`
5. Go to **"Webhooks"**
6. Add webhook endpoint: `https://your-project.vercel.app/api/webhooks/clerk`
7. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
8. Copy webhook secret and add to Vercel env vars

### Step 7: Test Your Deployment

#### Test 1: Public Access
- Visit your site (not signed in)
- Should see homepage
- Should see published courses
- Should NOT see admin or student portal

#### Test 2: Student Access
- Sign up as a new user
- Should access student portal
- Should NOT access admin panel
- Should only see published courses

#### Test 3: Admin Access
- Sign in as admin (set role in Supabase)
- Should access admin panel
- Should see all courses
- Should manage users and content

### Step 8: Custom Domain (Optional)

1. In Vercel Dashboard, go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain: `brickbybrick.com`
4. Follow DNS configuration instructions
5. Update Clerk allowed domains

### Common Deployment Issues

#### Build Fails
- Check environment variables are set
- Verify all required packages in package.json
- Check build logs for specific errors

#### Authentication Not Working
- Verify Clerk production keys
- Check domain is added in Clerk dashboard
- Ensure webhook is configured

#### Database Errors
- Verify RLS policies are applied
- Check Supabase connection strings
- Ensure service role key is correct

#### PDFs Not Loading
- Check Supabase Storage buckets are public
- Verify file URLs are correct
- Check CORS settings in Supabase

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will:
1. Detect the push
2. Build your project
3. Deploy automatically
4. Update your live site

## 📊 Monitoring

### Vercel Dashboard
- **Deployments**: View build logs and history
- **Analytics**: Track page views and performance
- **Functions**: Monitor serverless function execution
- **Logs**: Real-time application logs

### Supabase Dashboard
- **Database**: Monitor queries and connections
- **Storage**: Track file uploads and usage
- **Logs**: View database and API logs
- **Auth**: Monitor user signups and logins

### Clerk Dashboard
- **Users**: View all registered users
- **Sessions**: Monitor active sessions
- **Webhooks**: Check webhook deliveries
- **Logs**: Authentication event logs

## 🔐 Security Checklist

Before going live:

- [ ] RLS policies applied in Supabase
- [ ] Production environment variables set
- [ ] Clerk production keys configured
- [ ] Webhook endpoint configured
- [ ] Custom domain added (if applicable)
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] Test all user roles (public, student, admin)
- [ ] Verify data isolation between users
- [ ] Check error handling and logging
- [ ] Review security documentation

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Project Docs**: See SECURITY.md and TROUBLESHOOTING_GUIDE.md

## ✅ Deployment Complete!

Your LMS is now live and secure. Monitor the dashboards and test thoroughly before announcing to users.

---

**Next Steps:**
1. Create your first admin account
2. Upload course content
3. Test student enrollment
4. Monitor for any issues
5. Enjoy your live LMS! 🎉
