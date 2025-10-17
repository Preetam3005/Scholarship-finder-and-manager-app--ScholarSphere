# Supabase setup for this repo

This project uses Supabase for authentication, storage and data. Follow these steps to set up Supabase locally and in production.

## 1. Create / link a Supabase project
- Create a project at https://app.supabase.com or use an existing one.
- Note your Project URL and the public (anon) key.

## 2. Add env vars
- Copy `.env.local.example` to `.env.local` and fill in your values:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...yourAnonKey...
```

- Do NOT commit `.env.local` to source control. It's in `.gitignore`.

## 3. Apply DB migrations
You have two options:

### Option A — Quick (SQL Editor)
- Open Supabase → SQL Editor → New query
- Paste the SQL in `supabase/migrations/20251016153443_dc0dc46a-6b7f-406a-8a73-b9ec44a835d3.sql` and run it.
- Then paste and run `supabase/migrations/20251017102000_add_org_support.sql` to add organisation support.

### Option B — Supabase CLI (recommended for teams)
- Install the CLI and login:
  ```powershell
  npm i -g supabase
  supabase login
  supabase link --project-ref <your-project-ref>
  ```
- Push migrations (make sure your migrations are in the CLI-compatible folder):
  ```powershell
  supabase db push
  ```

> Always backup your DB before applying migrations on a production project.

## 4. Configure Auth settings
- In Supabase → Authentication → Settings:
  - Add `http://localhost:8080` as a site URL and allowed origin.
  - Add redirect URLs you use (e.g. `http://localhost:8080/register`).

## 5. Seed sample data
- Run the dev server `npm run dev` and open the Dashboard page. The app calls `seedScholarships()` to insert sample scholarships if the table is empty.
- Or run seeder manually by importing `src/scripts/seedScholarships.ts` in a Node script and executing it with environment variables loaded.

## 6. Generate TypeScript types (optional)
- If you want to generate `src/integrations/supabase/types.ts`:
  ```powershell
  supabase gen types typescript --project-ref <your-project-ref> --schema public > src/integrations/supabase/types.ts
  ```

## 7. Test the flows
- Start dev server: `npm run dev` (the project uses port 8080 by default)
- Register as a Student and complete profile.
- Register as an Organisation (check the checkbox on the registration page).
- Organisation will see the Admin tab and can add scholarships and manage applications.

## 8. Production
- Add the environment variables to your hosting platform (Vercel/Netlify) with the same keys (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY).
- Do not commit secrets to git.

## 9. Email notifications (SMTP + serverless endpoint)

This project includes a small serverless function at `server/send-email/index.js` that uses SMTP to send emails. Deploy this function as a serverless function (Vercel, Netlify, Cloudflare Workers with adapter, etc.).

Required environment variables (set them in your host):

```
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=false # true for port 465
EMAIL_SMTP_USER=smtp-user
EMAIL_SMTP_PASS=smtp-pass
EMAIL_FROM="Your App <noreply@example.com>"
```

When a Site Admin approves or rejects an organisation, the frontend calls `/api/send-email` which maps to the serverless function. Ensure the function URL is reachable from the frontend (deploy on the same domain or set up CORS appropriately).


If you want, I can also:
- Generate `types.ts` for you (you'll need to run `supabase login` locally),
- Add an admin approval flow for org accounts,
- Or create email notifications on application status changes.
