# FridgeMind

FridgeMind is a production-ready food-waste reduction and healthy-eating web app. It uses AI to track fridge items, generate recipes, analyze waste, and provide smart shopping lists.

## Tech Stack
- Next.js 15 (App Router)
- React 19 (Server Components, Suspense)
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Anthropic Claude 3.5 Sonnet (via AI SDK)
- Zustand (Client State)
- React Query (Server State)

## Environment Variables
To run this project locally, create a `.env.local` file in the root directory and add the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key
```

> **Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` on the client.

## Getting Started

1. Set up your Supabase project and run the initial migration:
   - Run the SQL in `supabase/migrations/00000_init.sql` in your Supabase SQL editor.
   - This sets up all tables, RLS policies, and storage buckets.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Modules Included:
- **Module 1**: Auth (Supabase Auth)
- **Module 2**: Fridge Tracker
- **Module 3**: AI Recipe Engine
- **Module 4**: Waste Tracker
- **Module 5**: Smart Shopping List
- **Module 6**: AI Nutritionist Chat
- **Module 7**: Rewards & Eco Score
