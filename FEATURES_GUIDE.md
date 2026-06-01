# Features Guide

## 🎓 Student Features

### PDF Viewer
When a lesson contains a PDF:
- **Navigation**: Use Previous/Next buttons to move between pages
- **Zoom**: Adjust from 50% to 200% for comfortable reading
- **Page Counter**: Always know which page you're on
- **Text Selection**: Copy text directly from PDFs
- **Responsive**: Works on all screen sizes

### Lesson Tracker
- **Checkboxes**: Click the checkbox next to any lesson to mark it complete
- **Visual Feedback**: 
  - ✓ Green checkmark = Completed
  - ▶ Play icon = Available to start
  - 🔒 Lock icon = Locked (complete previous lessons first)
- **XP Rewards**: Earn 10 XP for each completed lesson
- **Auto-Save**: Progress automatically syncs to database
- **Persistent**: Your progress is saved across sessions

### Lesson Navigation
- **Sidebar**: See all modules and lessons
- **Progress Indicators**: Visual completion status
- **Sequential Unlocking**: Complete lessons in order
- **Quick Access**: Click any unlocked lesson to jump to it

## 👨‍💼 Admin Features

### Student Progress Dashboard
Located on each course page below the curriculum builder:

#### Overview Cards
Each student card shows:
- **Student Name & Email**
- **Completion Percentage**: Large, prominent display
- **Lesson Count**: X / Y lessons completed

#### Detailed Progress
- **Module Breakdown**: See progress within each module
- **Lesson Status**: Visual indicators for each lesson
  - Green badge with checkmark = Completed
  - Gray badge with circle = Not started
- **Hover Details**: Lesson titles on hover

#### Real-Time Updates
- Progress updates automatically as students complete lessons
- No page refresh needed
- Instant visibility into student engagement

### Course Management
- **Curriculum Builder**: Create and organize modules/lessons
- **Content Upload**: Add PDFs, videos, and text content
- **Progress Tracking**: Monitor student completion
- **Publishing Controls**: Draft/Published status

## 🔄 How Progress Tracking Works

### Student Side:
1. Student clicks checkbox next to a lesson
2. UI updates immediately (optimistic update)
3. Request sent to server to save progress
4. If server fails, UI reverts to previous state
5. XP awarded for first-time completions

### Admin Side:
1. Admin views course page
2. Progress tracker loads all student data
3. Shows completion rates and specific lessons
4. Updates automatically when students make progress

## 📊 Database Structure

Progress is stored in the `lesson_progress` table:
- `user_id`: Links to the student
- `lesson_id`: Links to the specific lesson
- `course_id`: Links to the course
- `is_completed`: Boolean completion status
- `last_watched_at`: Timestamp of last interaction

## 🎨 UI Components

### Student View Components:
- **Sidebar**: Module/lesson navigation with checkboxes
- **PDF Viewer**: Full-featured PDF reader
- **Progress Bar**: XP and level display
- **Lesson Content**: Dynamic content based on type

### Admin View Components:
- **Progress Tracker**: Student completion dashboard
- **Curriculum Builder**: Drag-and-drop lesson organizer
- **Course Actions**: Publish/unpublish controls

## 🔐 Security

- **Authentication**: Clerk-based user authentication
- **Authorization**: Role-based access (student/admin)
- **Data Validation**: Server-side validation of all actions
- **User Sync**: Automatic Clerk → Supabase user sync

## 💡 Tips

### For Students:
- Complete lessons in order to unlock new content
- Use the PDF zoom controls for better readability
- Check your XP progress in the sidebar
- Uncheck lessons if you want to review them again

### For Admins:
- Monitor the progress dashboard regularly
- Identify students who may need help (low completion rates)
- Use module breakdown to see where students struggle
- Ensure all lessons have content uploaded before publishing

## 🐛 Troubleshooting

### PDF Not Loading:
- Check that the PDF URL is valid
- Ensure the file is accessible
- Try refreshing the page

### Progress Not Saving:
- Check internet connection
- Verify you're logged in
- Check browser console for errors

### Admin Can't See Progress:
- Verify admin role in Clerk
- Ensure students are enrolled in the course
- Check that lessons have been accessed

## 🚀 Performance

- **Optimistic Updates**: Instant UI feedback
- **Lazy Loading**: PDFs load on demand
- **Efficient Queries**: Only fetch necessary data
- **Caching**: Browser caches PDF.js worker
