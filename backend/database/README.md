# Supabase Database

The production schema lives in `schema.sql`.

Tables:

- `students`
- `device_tokens`
- `attendance_logs`
- `fee_records`
- `notes`
- `notifications`

Startup migration:

```env
AUTO_RUN_MIGRATIONS=true
SUPABASE_DB_URL=postgresql://...
```

Manual migration:

```bash
npm run db:setup
```

The API uses the Supabase service role key on the server only. Browser code never receives the service role key.
