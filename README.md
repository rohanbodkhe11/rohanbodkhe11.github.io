# Rohan Bodkhe Portfolio

A responsive static portfolio for Rohan Bodkhe, deployed through GitHub Pages.

## Pages

- `index.html` is the public portfolio.
- `admin.html` is a browser-local CMS workspace.

## Supabase CMS

The secure CMS is at `/admin/` with login at `/admin/login/`. It uses Supabase Auth, PostgreSQL, Storage, and Row Level Security. Run `supabase/schema.sql` in the Supabase SQL editor, create an Auth user, then insert that user's UUID into `public.admin_users` from the SQL editor. Copy `js/supabase-config.js.example` to `js/supabase-config.js` and add the project's URL and publishable key; this local config is ignored by Git.

The older `admin.html` local editor remains only for backwards compatibility and should not be used for production administration. The Supabase route performs authentication, admin membership checks, database writes, and Storage authorization server-side through RLS.

## Local preview

Serve the directory with a static HTTP server. Supabase ES modules require HTTP(S), not `file://`. No package manager or build step is required.

## Existing assets

Original portfolio images and font/vendor assets remain in `images/`, `fonts/`, `css/`, `js/`, and `lib/`.
