# BrickByBrick

A comprehensive Learning Management System (LMS) platform designed for financial education and real estate investment training. BrickByBrick provides institutional-grade tools for course delivery, student management, and educational content distribution.

## Overview

BrickByBrick is an enterprise-ready LMS built with Next.js 15, enabling financial institutions and educational organizations to deliver comprehensive training programs. The platform features:

- **Student Portal** - Course enrollment, lesson tracking, and integrated PDF viewer
- **Administrative Dashboard** - Complete course management, user administration, and progress analytics
- **Enterprise Authentication** - Clerk-powered authentication with role-based access control
- **Secure Infrastructure** - Supabase PostgreSQL with Row Level Security enforcement
- **Content Management** - Secure file storage and delivery via Supabase Storage

## Getting Started

### System Requirements

- Node.js 18 or later
- npm or yarn package manager
- Supabase account and project
- Clerk authentication project

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

3. Configure environment variables:

Create a `.env.local` file with the following configuration:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional Services
CLERK_WEBHOOK_SECRET=whsec_...
UPLOADTHING_TOKEN=eyJ...
```

4. Initialize the database:

Execute the following SQL files in your Supabase SQL Editor:
- `supabase/schema.sql` - Database schema and table creation
- `supabase/security-policies.sql` - Row Level Security policy configuration

5. Start the development server:
```bash
npm run dev
```

Access the application at [http://localhost:3000](http://localhost:3000).

## Documentation

- **[SECURITY.md](./SECURITY.md)** - Security architecture and best practices
- **[SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)** - Pre-deployment security verification
- **[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)** - Production deployment guide
- **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)** - Common issues and resolutions
- **[FEATURES_GUIDE.md](./FEATURES_GUIDE.md)** - Feature documentation and usage

## Security

BrickByBrick implements enterprise-grade security controls:

- Row Level Security on all database tables
- Role-based access control (Administrator/Student)
- Server-side authentication and authorization verification
- Secure file storage with access control policies
- Production-ready environment configuration
- Environment variable validation and sanitization

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 (App Router) |
| Authentication | Clerk |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Styling | Tailwind CSS |
| PDF Rendering | react-pdf |
| Rich Text Editor | Tiptap |
| Deployment | Vercel |
| Primary Language | TypeScript |

## Architecture

```
BrickByBrick/
├── src/
│   ├── app/
│   │   ├── (admin)/              # Administrative interfaces
│   │   ├── (public)/              # Public pages
│   │   ├── student-portal/        # Student interfaces
│   │   ├── api/                   # API endpoints
│   │   └── actions/               # Server-side actions
│   ├── components/
│   │   ├── admin/                 # Admin UI components
│   │   ├── learn/                 # Learning components
│   │   ├── auth/                  # Authentication components
│   │   └── ui/                    # Reusable UI components
│   └── lib/                       # Utilities and configurations
├── supabase/
│   ├── schema.sql                 # Database schema
│   └── security-policies.sql      # RLS policy definitions
└── public/                        # Static assets
```

## Capabilities

### Student Features
- Course discovery and enrollment
- Lesson progress tracking
- PDF lesson viewing with zoom and navigation controls
- Course announcements and updates
- Direct support communication

### Administrative Features
- Course creation and lifecycle management
- Curriculum structure management (modules and lessons)
- Course content upload and organization
- Student progress monitoring and analytics
- User role and permission management
- Support ticket management and response

## Production Deployment

### Deployment to Vercel

1. Push code to GitHub repository
2. Import project into Vercel dashboard
3. Configure environment variables
4. Deploy to production

### Security Configuration

Prior to production deployment, Row Level Security policies must be applied:

1. Access Supabase Dashboard > SQL Editor
2. Execute the contents of `supabase/security-policies.sql`
3. Verify successful execution without errors

Refer to [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) for complete deployment instructions.

## Build and Test

```bash
# Development server
npm run dev

# Production build
npm run build

# Production server
npm run start
```

## Configuration

Complete environment variable documentation is available in `.env.example`.

**Security Notice**: Do not commit `.env.local` to version control or expose service role keys to client-side code.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Perform comprehensive testing
5. Submit a pull request for review

## License

This project is private and proprietary.

## Support and Resources

For technical assistance:
- Review [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md) for known issues and solutions
- Consult [SECURITY.md](./SECURITY.md) for security-related questions
- Open an issue on GitHub for bug reports or feature requests

## Resources

- Live Application: [https://brickbybrick.vercel.app](https://brickbybrick.vercel.app)
- Feature Documentation: [FEATURES_GUIDE.md](./FEATURES_GUIDE.md)
- Security Documentation: [SECURITY.md](./SECURITY.md)
