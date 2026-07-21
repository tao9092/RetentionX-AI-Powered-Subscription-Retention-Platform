# Optional Supabase adapter

RetentionX remains fully functional in local browser mode without environment variables. To enable the optional read adapter, create a Supabase project, run `migrations/001_initial.sql`, copy `.env.example` to `.env.local`, and set the project URL and anonymous key. Never place a service-role key in the frontend.

The migration defines Admin and Customer Success roles with basic row-level security. Review and harden policies for your organisation before production use.
