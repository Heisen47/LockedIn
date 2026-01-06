# AI Coding Guidelines

## Architecture & Routing
- Astro 5 server output drives pages while interactivity is pushed into React islands via `client:load` directives (e.g., [src/pages/index.astro](src/pages/index.astro), [src/pages/profile/[handle].astro](src/pages/profile/%5Bhandle%5D.astro)).
- Layout + navbar live in Astro (`layouts/Layout.astro`, [src/components/Navbar.astro](src/components/Navbar.astro)); most complex UI (CreatePost, ProjectStack, settings widgets) are React components mounted from Astro templates.
- Profile and settings views currently render demo data inside the Astro page and rely on localStorage/sessionStorage for persistence; no server loaders are wired up yet, so keep logic client-side unless you introduce real APIs.

## Build, Run, Deploy
- Use the npm scripts in [package.json](package.json): `npm run dev` (Astro dev server), `npm run build` (SSR build), `npm run preview` (serve built output), and Vitest commands (`test`, `test:run`, `test:ui`, `test:coverage`).
- Astro config ([astro.config.mjs](astro.config.mjs)) forces `output: 'server'` and pulls in Tailwind v4 via `@tailwindcss/vite`; keep Vite plugins compatible with Tailwind 4’s postcss-free pipeline.
- TypeScript extends Astro’s strict config; React JSX is enabled globally via [tsconfig.json](tsconfig.json).

## Data & Auth Flows
- HTTP goes through the axios wrapper in [src/lib/api.ts](src/lib/api.ts): it reads `import.meta.env.PUBLIC_API_BASE_URL`, injects bearer tokens from `sessionStorage`, skips auth on `/auth/*`, logs responses, and clears tokens on 401.
- Auth helpers in [src/lib/auth.ts](src/lib/auth.ts) wrap the API client to validate tokens, fetch the current user, and schedule a 23h refresh; they are browser-only, so guard server code with `typeof window` like the existing functions do.
- Components pull auth state from the API client at runtime. Example: [src/components/ProfileMenu.tsx](src/components/ProfileMenu.tsx) calls `api.validate()` on mount and logs the user out by clearing tokens and redirecting.
- Posting uses a raw axios call in [src/components/CreatePost.tsx](src/components/CreatePost.tsx). It expects `sessionStorage.authToken` and posts to `${PUBLIC_API_BASE_URL}/api/v1/posts`; mirror its payload shape (`link`, `status`, `tags`, `content`, `liveUrl`, `imageUrl`).

## Component & State Patterns
- Inputs that need to work inside Astro templates emit DOM events. [src/components/TechStackInput.tsx](src/components/TechStackInput.tsx) dispatches `techstack-change` on `#techstack-container` so non-React parents (e.g., [src/pages/settings.astro](src/pages/settings.astro)) can listen; preserve that event when refactoring.
- Demo persistence favors localStorage namespaces (`profile:{handle}:*`) as seen in [src/pages/profile/[handle].astro](src/pages/profile/%5Bhandle%5D.astro) and [src/components/EditableBio.tsx](src/components/EditableBio.tsx); update both the storage writer and the DOM “apply” helper when adding new fields.
- Motion/animation is handled with framer-motion (`FadeIn`, `StaggerContainer`, modal transitions in CreatePost). Prefer extending the shared animation helpers instead of ad-hoc variants.

## Styling & UI
- Tailwind utility classes dominate styling, with custom gradients and translucency tokens. Follow the dark theme palette already present in [src/pages/settings.astro](src/pages/settings.astro) and [src/components/CreatePost.tsx](src/components/CreatePost.tsx).
- Icons use `lucide-react` (e.g., settings nav); import only the icons you need to keep bundle size down.

## Testing
- Component tests live in [tests/](tests) and use Vitest + React Testing Library + happy-dom (see devDependencies in [package.json](package.json)).
- Tests typically import the React component directly (e.g., `EditableBio.test.tsx`) and stub browser APIs like localStorage; replicate that approach when adding new tests.

## Gotchas & Tips
- The README is still the Astro starter stub, so rely on this file for real project guidance.
- Because auth utilities assume `window`, anything that may run during Astro SSR should guard those calls or use `client:load`.
- Session-derived data powers many UI states; when adding new auth-dependent components, read from the shared API client instead of re-implementing storage logic.
- Keep environment variable names prefixed with `PUBLIC_` so Astro exposes them to the browser bundle.
- If you introduce new forms that need tags, reuse `TechStackInput` to benefit from the shared list in [src/lib/techStackOptions.ts](src/lib/techStackOptions.ts).
