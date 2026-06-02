# UESL Dashboard

Club social web app for **United Esports League** (~10-15 members). "Facebook for the club."

## Stack
React 18 + Vite · MUI v6 · Firebase (Auth + Firestore + Storage) · react-quill-new (WYSIWYG) · FullCalendar · React Router v6 · date-fns

## Run / test
- Dev server: `npm run dev -- --port 5174` → http://localhost:5174
- **Test in Edge at localhost:5174. Do NOT use the Claude Preview pane** (unreliable, wastes tokens).
- Avoid running `npx vite build` just to check compile — the dev server's HMR surfaces errors. Build only for deploy.

## Conventions
- Pages in `src/pages/`, shared UI in `src/components/`, auth in `src/features/auth/`.
- Firebase init + `ADMIN_EMAIL` in `src/firebase/firebase.js`. All Firestore reads/writes go through helpers in `src/firebase/firestore.js` (subscribe* = live listeners).
- Theme: `src/theme/theme.js` (factory `getTheme(mode)`) + `ColorModeContext.jsx`. Brand = **yellow #FFD60A + white + near-black**, bold esports, light/dark toggle. Hub colors: gaming red, coding cyan, design pink (`HUB_COLORS` export).
- Avatars on yellow bg need dark text (`color:'#0B0B0F'`).

## Auth & roles (members-only approval system)
- Email/password. Session-only persistence (logout on browser close).
- **Admin = sstewart207@gmail.com** (hardcoded in `firebase.js` AND Firestore rules). Auto-approved, never locked out, self-heals its user doc on login.
- New signups → `{ approved:false, role:'pending' }` → see PendingApproval screen, no access.
- Admin OR any **coach** can approve (sets approved + role student/coach) via `/admin` (AdminApproval page). `canApprove` from AuthContext gates the sidebar link + route + Firestore rules (3 layers).
- Firestore rules enforce: only `approved` users read/write club content; coaches write events/bulletins/tournaments.

## Firestore collections
`users` (displayName, email, role[pending|student|coach|admin], approved, avatarUrl, games[], skills[], bio, createdAt) · `posts` (+`comments` subcol) · `events` (rsvps map) · `bulletins` · `tournaments` · `notifications/{uid}/items`

## Known gotchas / open items
- **Composite indexes**: opening a single Hub page and a Profile's posts each need a Firestore composite index. First visit throws a console error with a clickable link → Create Index → ~1 min. One-time.
- **Events RSVP rule**: events rule must allow `update: if isApproved()` (students RSVP by updating the event doc), with `create,delete: if isCoach()`. If RSVP is permission-denied, this is why.
- Firebase password-reset emails land in spam (generic sender) — known, low priority.
- Posting lives in the Hubs (Discord-room model); Home is a read-only dashboard.

## Git
Local repo (not yet on GitHub — user has an account, will publish later via GitHub Desktop). Commit when asked.
