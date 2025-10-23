# Database Setup Guide

This guide will help you connect your Prisma schema to Supabase and set up the database.

## Prerequisites

1. A Supabase account and project
2. Node.js installed
3. Prisma CLI installed (already in dependencies)

## Step 1: Get Supabase Connection Details

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Database**
3. Under **Connection string**, you'll find:
   - **Connection pooling** (use this for `DATABASE_URL`)
   - **Direct connection** (use this for `DIRECT_URL`)

## Step 2: Update Environment Variables

Edit your `.env` file and replace the placeholder values:

```env
# Supabase Database Connection
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"

# Supabase API Keys
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Where to find these values:**
- `[project-ref]`: Your Supabase project reference ID (visible in project URL)
- `[password]`: Your database password (set when creating the project)
- Anon Key: Settings > API > Project API keys > `anon` `public`
- Service Role Key: Settings > API > Project API keys > `service_role` (keep this secret!)

## Step 3: Generate Prisma Client

Run the following command to generate the Prisma client:

```bash
npx prisma generate
```

## Step 4: Push Schema to Supabase

Push your Prisma schema to your Supabase database:

```bash
npx prisma db push
```

Alternatively, to create a migration:

```bash
npx prisma migrate dev --name init
```

## Step 5: Verify Connection

You can verify the connection by opening Prisma Studio:

```bash
npx prisma studio
```

This will open a browser interface where you can view and edit your database.

## Database Schema

### User Model
- `id`: Unique identifier (cuid)
- `walletAddress`: Unique wallet address
- `username`: Optional username
- `avatarUrl`: Optional avatar URL
- `totalPoints`: User's total points (default: 0)
- `totalXp`: User's total experience points (default: 0)
- `currentLevel`: User's current level (default: 1)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

### Activity Model
- `id`: Unique identifier (cuid)
- `userId`: Reference to User
- `activityType`: Type of activity (enum)
- `pointsEarned`: Points earned from activity
- `xpEarned`: XP earned from activity
- `metadata`: JSON object with additional data
- `txnHash`: Optional transaction hash
- `createdAt`: Timestamp of creation

### ActivityType Enum
- `GACHA_PULL`
- `CLAW_WIN`
- `MARKETPLACE_TRADE`
- `DAILY_LOGIN`
- `FIRST_GACHA_DAILY`
- `RARE_NFT_PULL`
- `HIDDEN_NFT_PULL`
- `RARE_CLAW_WIN`
- `MARKETPLACE_LIST`
- `MARKETPLACE_SALE`
- `MARKETPLACE_PURCHASE`

## API Endpoints

All endpoints are available at `/api/...`

### User Endpoints

#### GET /api/users
Get all users with pagination and sorting
- Query params:
  - `limit`: Number of results (default: 50)
  - `offset`: Offset for pagination (default: 0)
  - `sortBy`: Field to sort by (default: createdAt)
  - `order`: asc or desc (default: desc)

#### GET /api/users/[id]
Get a single user by ID with their recent activities

#### POST /api/users
Create a new user
```json
{
  "walletAddress": "0x...",
  "username": "optional",
  "avatarUrl": "optional"
}
```

#### PATCH /api/users/[id]
Update a user
```json
{
  "username": "new username",
  "avatarUrl": "new avatar url",
  "totalPoints": 100,
  "totalXp": 50,
  "currentLevel": 2
}
```

#### DELETE /api/users/[id]
Delete a user

### Activity Endpoints

#### GET /api/activities
Get all activities with filtering
- Query params:
  - `limit`: Number of results (default: 50)
  - `offset`: Offset for pagination (default: 0)
  - `userId`: Filter by user ID
  - `walletAddress`: Filter by wallet address
  - `activityType`: Filter by activity type

#### GET /api/activities/[id]
Get a single activity by ID

#### POST /api/activities
Create a new activity
```json
{
  "userId": "user-id",
  "activityType": "GACHA_PULL",
  "pointsEarned": 10,
  "xpEarned": 5,
  "metadata": {},
  "txnHash": "0x..."
}
```

#### PATCH /api/activities/[id]
Update an activity
```json
{
  "pointsEarned": 20,
  "xpEarned": 10,
  "metadata": {},
  "txnHash": "0x..."
}
```

#### DELETE /api/activities/[id]
Delete an activity

### Points System Endpoints (Existing)

#### GET /api/points/user/[address]
Get user points and recent activities by wallet address

#### POST /api/points/award
Award points to a user
```json
{
  "walletAddress": "0x...",
  "activityType": "GACHA_PULL",
  "metadata": {}
}
```

#### GET /api/points/leaderboard
Get leaderboard
- Query params:
  - `type`: points or xp (default: points)
  - `limit`: Number of results (default: 10)

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL and DIRECT_URL are correct
- Check that your IP is allowed in Supabase (Settings > Database > Connection pooling)
- Ensure your database password is correct

### Migration Issues
- If you get "Table already exists" errors, use `npx prisma db push` instead of migrate
- For production, always use migrations: `npx prisma migrate deploy`

### Client Generation Issues
- Run `npx prisma generate` after any schema changes
- Restart your dev server after generating the client

## Best Practices

1. Never commit your `.env` file
2. Use connection pooling (DATABASE_URL) for serverless functions
3. Use direct connection (DIRECT_URL) for migrations
4. Always validate input in your API routes
5. Use transactions for operations that modify multiple records
6. Index frequently queried fields in production

## Next Steps

1. Set up Row Level Security (RLS) in Supabase for better security
2. Create indexes for frequently queried fields
3. Set up database backups
4. Monitor query performance using Supabase dashboard
