# Birthday Reminder

A minimalist birthday management app built with Next.js, Prisma, and Neon PostgreSQL. Never miss a friend's birthday again!

## ✨ Features

- 🔐 **Dual Authentication**: GitHub OAuth + Email/Password registration
- 🔗 **Smart Account Linking**: Automatically merge accounts with the same email
- 📅 **Birthday Management**: Add friends with their birthdays and personal notes
- 🔔 **Automated Reminders**: Get email notifications before birthdays
- 🌍 **Timezone Support**: Handle birthdays across different timezones
- 🎨 **Minimalist Design**: Clean, black/white/gray interface with subtle birthday-themed elements
- 📧 **SMTP Email Integration**: Reliable email delivery for reminders

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes with NextAuth.js
- **Database:** PostgreSQL via Neon (serverless)
- **ORM:** Prisma with connection pooling
- **Email:** Nodemailer with SMTP
- **Deployment:** Vercel (with scheduled functions)

## 🚀 Quick Start

### Local Development

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd birthday-reminder
   npm install
   ```

2. **Database Setup**
   - Create a [Neon](https://neon.tech) account
   - Create a new project and copy the connection string

3. **Environment Variables**
   Create `.env.local` with:
   ```env
   # Database (from Neon)
   DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-here"

   # GitHub OAuth App (create at https://github.com/settings/applications/new)
   GITHUB_ID="your-github-oauth-app-client-id"
   GITHUB_SECRET="your-github-oauth-app-client-secret"

   # SMTP Configuration (Gmail example)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-gmail-app-password"

   # Security
   REMINDER_WEBHOOK_SECRET="another-super-secret-key"
   ```

4. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment to Vercel

### 1. Connect Repository
- Push your code to GitHub
- Connect your repo to [Vercel](https://vercel.com)
- Vercel will automatically detect Next.js

### 2. Environment Variables
In Vercel dashboard, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | PostgreSQL database URL |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your deployed app URL |
| `NEXTAUTH_SECRET` | Random secret string | For JWT encryption |
| `GITHUB_ID` | GitHub OAuth App ID | From GitHub app settings |
| `GITHUB_SECRET` | GitHub OAuth App Secret | From GitHub app settings |
| `SMTP_HOST` | SMTP server hostname | e.g., `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | Usually `587` or `465` |
| `SMTP_USER` | SMTP username | Your email address |
| `SMTP_PASS` | SMTP password | App password for Gmail |
| `REMINDER_WEBHOOK_SECRET` | Random secret | For securing reminder API |

### 3. Database Migration
After deployment, run the migration in Vercel:
```bash
npx prisma migrate deploy
```

### 4. Scheduled Reminders
Vercel automatically handles the cron jobs defined in `vercel.json`. The reminders will run daily at 9 AM UTC.

For GitHub Actions alternative, the workflow in `.github/workflows/scheduled_send.yml` will also work - just add the secrets to your GitHub repository.

## 📊 Database Schema

```sql
-- Users (managed by NextAuth + custom fields)
User {
  id, email, name, passwordHash?, timezone, reminderDefaultDays
}

-- Friends with birthdays
Friend {
  id, userId, name, email?, birthday, timezone?, reminderDaysOverride?, notes
}

-- Reminder delivery logs
ReminderLog {
  id, userId, friendId, sentAt, remindForDate, status, errorMessage?
}
```

## 🔧 Configuration

### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to: `https://your-app.vercel.app/api/auth/callback/github`
4. Copy Client ID and Client Secret to environment variables

### Gmail SMTP Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Use your Gmail address as `SMTP_USER` and the app password as `SMTP_PASS`

## 🎯 Usage

1. **Sign Up**: Create account with email/password or GitHub
2. **Add Friends**: Enter their name, birthday, and optional details
3. **Set Preferences**: Configure default reminder timing and timezone
4. **Receive Reminders**: Get automatic email notifications before birthdays
5. **Manage**: Edit or remove friends as needed

## 📝 API Endpoints

- `POST /api/auth/register` - User registration
- `GET|POST /api/friends` - Friend CRUD operations
- `GET|PUT|DELETE /api/friends/[id]` - Individual friend management
- `POST /api/send-reminders` - Trigger birthday reminders (protected)

## 🔒 Security

- Passwords hashed with bcrypt
- JWT-based session management
- Protected API routes with authentication checks
- Webhook secret for reminder endpoint security
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own birthday reminder needs!