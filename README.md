# AwakeService

A monitoring service to keep your APIs and backend services alive by pinging them at regular intervals.

## Features

- 🔄 Automatic monitoring every 5 minutes
- 📊 Response time tracking
- 📝 Detailed logging
- 🔧 Configurable HTTP methods, headers, and body
- 🛠️ Maintenance mode support

## Development

To run the service locally:

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

The monitoring service will automatically start when the Next.js server boots. You'll see a console message:

```
🔄 Starting automatic monitoring (5-minute interval)...
```

## How It Works

1. **Auto-Start**: The monitoring service automatically initializes when the Next.js server starts
2. **Scheduled Pings**: Every 5 minutes, the service pings all active monitors
3. **Database Updates**: Each ping updates the monitor status and creates a log entry
4. **API Endpoint**: The `/api/cron` endpoint handles the actual monitoring logic

## Environment Variables

Create a `.env` file with the following:

```env
DATABASE_URL="your-database-url"
NEXT_PUBLIC_URL="http://localhost:3000"  # Optional, defaults to localhost:3000
```

## Production Deployment

The monitoring service will automatically start in production when you deploy to platforms like:

- Vercel
- Railway
- Render
- Any Node.js hosting platform

Just ensure your `NEXT_PUBLIC_URL` environment variable is set to your production URL.

## API Endpoints

- `GET /api/monitors` - List all monitors
- `POST /api/monitors` - Create a new monitor
- `GET /api/monitors/[id]` - Get monitor details
- `PUT /api/monitors/[id]` - Update a monitor
- `DELETE /api/monitors/[id]` - Delete a monitor
- `GET /api/cron` - Trigger monitoring (called automatically every 5 minutes)
- `GET /api/start-monitoring` - Check monitoring status

## Tech Stack

- **Framework**: Next.js 16
- **Database**: PostgreSQL with Prisma ORM
- **UI**: React 19 with Tailwind CSS
- **Charts**: Recharts

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
