# BrickByBrick

A comprehensive Learning Management System (LMS) platform designed for financial education and real estate investment training.

## 🎯 Overview

BrickByBrick is a modern, secure LMS built with Next.js 15, featuring:
- **Student Portal** - Course enrollment, lesson tracking, PDF viewer
- **Admin Dashboard** - Course management, user management, progress tracking
- **Authentication** - Powered by Clerk with role-based access control
- **Secure Database** - Supabase with Row Level Security
- **File Storage** - Supabase Storage for course content and PDFs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sairishigangarapu/BrickByBrick.git
cd BrickByBrick
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file with:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional
CLERK_WEBHOOK_SECRET=whsec_...
UPLOADTHING_TOKEN=eyJ...
```

4. Set up the database:

Go to your Supabase Dashboard → SQL Editor and run:
- `supabase/schema.sql` - Creates all tables
- `supabase/security-policies.sql` - Applies Row Level Security

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

- **[SECURITY.md](./SECURITY.md)** - Complete security guide
- **[SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)** - Pre-deployment checklist
- **[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)** - Deployment instructions
- **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)** - Common issues and solutions
- **[FEATURES_GUIDE.md](./FEATURES_GUIDE.md)** - Feature documentation

## 🔒 Security Features

- ✅ Row Level Security on all database tables
- ✅ Role-based access control (Admin/Student)
- ✅ Server-side authentication checks
- ✅ Secure file storage with proper access policies
- ✅ No console logs or debug endpoints in production
- ✅ Environment variable validation

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **PDF Viewer**: react-pdf
- **Rich Text Editor**: Tiptap
- **Deployment**: Vercel

## 📦 Project Structure

```
BrickByBrick/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Admin dashboard routes
│   │   ├── (public)/          # Public pages
│   │   ├── student-portal/    # Student portal routes
│   │   ├── api/               # API routes
│   │   └── actions/           # Server actions
│   ├── components/
│   │   ├── admin/             # Admin components
│   │   ├── learn/             # Learning components
│   │   ├── auth/              # Auth components
│   │   └── ui/                # UI components
│   └── lib/                   # Utilities and configs
├── supabase/
│   ├── schema.sql             # Database schema
│   └── security-policies.sql  # RLS policies
└── public/                    # Static assets
```

## 🎓 Features

### For Students
- Browse and enroll in courses
- Track lesson progress with checkboxes
- View PDF lessons with zoom and navigation
- Access course announcements
- Contact support

### For Admins
- Create and manage courses
- Build curriculum with modules and lessons
- Upload PDFs and videos
- Track student progress
- Manage user roles
- Respond to contact messages

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Important: Apply RLS Policies

Before going live, you MUST apply the security policies:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/security-policies.sql`
3. Run the SQL script
4. Verify no errors

See [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) for detailed instructions.

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

**Important**: Never commit `.env.local` or expose service role keys to the client.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:
- Check [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)
- Review [SECURITY.md](./SECURITY.md)
- Open an issue on GitHub

## 🔗 Links

- [Live Demo](https://brickbybrick.vercel.app) (Coming soon)
- [Documentation](./FEATURES_GUIDE.md)
- [Security Guide](./SECURITY.md)

---

Built with ❤️ for financial education
