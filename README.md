# Pages Technology Publisher Console

Production publisher administration console for Pages Technology.

## Initial production release

The first live function is **Book Page Upload & Management**:

- Supabase email/password authentication
- admin authorization check
- private direct-to-Supabase page uploads
- JPG/PNG/WebP validation
- upload progress
- thumbnail review
- optional filename auto-arrange
- drag-and-drop reordering
- page type assignment
- replace/delete page
- book preview
- publish status control

The remaining publisher functions are represented as Coming Soon modules so they can be activated without restructuring the console.

## Architecture

- Frontend: Vite + vanilla JavaScript
- Auth/Data/Storage: Supabase
- Hosting target: Netlify
- Repository: private
- Search indexing: disabled through HTML metadata and Netlify headers

## Security notes

The browser uses only the Supabase publishable key. Sensitive authorization is enforced by Supabase Auth, RLS, private Storage policies, and admin-checked RPC functions. No Supabase secret/service-role key is shipped to the browser.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Netlify publishes the generated `dist` directory using the committed `netlify.toml` configuration.
