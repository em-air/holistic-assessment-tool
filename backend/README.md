# Holistic Assessment Tool - Backend

Node.js/Express backend for the Holistic Assessment Tool with Supabase integration.

## Features

- 🔐 **Authentication & Authorization** - JWT verification with Supabase Auth
- 👥 **Role-Based Access Control** - Student, Teacher, Admin roles
- 📊 **Grade-Based Quiz Access** - Students only see quizzes for their grade level
- 📝 **Quiz Results Management** - Save, retrieve, and manage assessment results
- 📈 **Progress Tracking** - Track progress across Mind, Oral, and Academic categories
- 📄 **PDF Report Generation** - Server-side PDF creation with detailed analysis
- 📧 **Email Reports** - Send reports to parents/teachers via Resend
- 🗄️ **Supabase Storage** - Secure PDF storage with signed URLs

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase and Resend credentials:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key
RESEND_API_KEY=your-resend-api-key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Database

Run the schema SQL in your Supabase SQL Editor:

```bash
# Copy contents of scripts/schema.sql and run in Supabase Dashboard > SQL Editor
```

### 4. Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage
2. Create new bucket: `reports`
3. Set to Private (not public)

### 5. Seed Quiz Metadata

```bash
npm run seed
```

### 6. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3001`

## API Endpoints

### Authentication Required
All endpoints require `Authorization: Bearer <supabase-jwt-token>` header.

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/:userId` - Get user profile (admin/teacher)

### Quizzes
- `GET /api/quizzes` - List accessible quizzes (grade-filtered)
- `GET /api/quizzes/:quizId` - Get quiz metadata
- `GET /api/quizzes/:quizId/access` - Check quiz access

### Results
- `POST /api/results` - Save quiz result
- `GET /api/results` - Get all results
- `GET /api/results/category/:cat` - Get results by category
- `GET /api/results/:quizId` - Get specific result
- `DELETE /api/results/:quizId` - Delete result (retake)

### Progress
- `GET /api/progress` - Get overall progress
- `GET /api/progress/detailed` - Get detailed breakdown
- `POST /api/progress/sessions` - Start session
- `GET /api/progress/sessions/active` - Get active session
- `PUT /api/progress/sessions/:id` - Update session

### Reports
- `POST /api/reports/generate` - Generate PDF report
- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get report metadata
- `GET /api/reports/:id/download` - Get download URL
- `POST /api/reports/:id/email` - Email report
- `DELETE /api/reports/:id` - Delete report (admin)

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id/results` - Get user results
- `GET /api/admin/users/:id/reports` - Get user reports
- `PUT /api/admin/users/:id/role` - Change user role
- `GET /api/admin/analytics` - Get statistics
- `POST /api/admin/quizzes` - Create/update quiz
- `DELETE /api/admin/quizzes/:id` - Disable quiz
- `POST /api/admin/users/:id/assign-teacher` - Assign teacher

### Teacher
- `GET /api/teacher/students` - List assigned students
- `GET /api/teacher/students/:id/progress` - View student progress
- `GET /api/teacher/students/:id/reports` - View student reports
- `GET /api/teacher/summary` - Get summary of all students

## User Roles

| Role | Access |
|------|--------|
| `student` | Own data only, grade-filtered quizzes |
| `teacher` | Own data + assigned students |
| `admin` | Full access to all data and features |

## Creating an Admin User

After signing up, update your role in Supabase:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'your-user-id';
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed quiz metadata

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express app entry
│   ├── config/
│   │   └── supabase.ts       # Supabase client
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   ├── gradeAccess.ts    # Grade-based access
│   │   └── index.ts
│   ├── routes/
│   │   ├── profile.ts
│   │   ├── quizzes.ts
│   │   ├── results.ts
│   │   ├── progress.ts
│   │   ├── reports.ts
│   │   ├── admin.ts
│   │   └── teacher.ts
│   ├── services/
│   │   ├── pdfGenerator.ts   # PDF creation
│   │   ├── emailService.ts   # Resend integration
│   │   ├── storageService.ts # Supabase Storage
│   │   └── index.ts
│   └── types/
│       └── database.ts
├── scripts/
│   ├── schema.sql            # Database schema
│   └── seed-quizzes.ts       # Seed script
├── package.json
├── tsconfig.json
└── .env.example
```
