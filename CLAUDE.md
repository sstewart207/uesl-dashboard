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

## Firebase deploy (rules + indexes)
- Rules live in `firestore.rules`, indexes in `firestore.indexes.json`, wired via `firebase.json` + `.firebaserc` (project `uesl-dashboard`). User is logged in via `firebase-tools`.
- Deploy from repo (no console pasting): `npx firebase-tools deploy --only firestore --project uesl-dashboard`. Claude can run this directly. Firebase MCP also configured in `.mcp.json`.
- ✅ Events RSVP rule + the 2 composite indexes (posts by hub+createdAt, authorUid+createdAt) are DEPLOYED.
- ✅ **Security hardening DEPLOYED (2026-06-03):** posts/comments `create` pin `authorUid == request.auth.uid` (no authorship spoofing); coach power over `/users` scoped to approve+revoke only (set role student/coach/pending, no admin-minting, no user deletes — delete is admin-only). Repo `firestore.rules` == live (no drift).
- ✅ **LIVE at https://uesl-dashboard.web.app** — deployed 2026-06-12. `firebase deploy --only hosting` done.

## Features built (beyond core)
- **Profiles editable** via EditProfileDialog: avatar upload to Storage (`uploadAvatar`), bio/games/skills, social links (Discord/Twitch/YouTube/Instagram/X) shown as chips. `SOCIALS` exported from EditProfileDialog.
- **Coach moderation**: delete buttons on posts + comments in PostDetail (author or coach via `canApprove`); `deleteComment` helper.
- **@mentions in comments**: `src/utils/mentions.jsx` (`findMentions`, `renderWithMentions`) — links to profiles + 'mention' notification. Regex is `/(^|[^\w])@([\w-]+)/g` (ignores emails like a@b.com, allows hyphens); mentions render as a focusable `<button>` (keyboard-accessible). Earlier Copilot edge-cases fixed in PR #3.
- **Rich text sanitized** with DOMPurify (`src/utils/sanitize.js` `cleanHtml`) at every dangerouslySetInnerHTML.
- **Mobile nav**: Sidebar renders permanent on desktop + temporary Drawer on mobile (hamburger in Navbar). Dialogs are NOT full-screen on mobile (intentionally — removed per user).

## Open issues (v1.1 — Post-Launch Polish)
- **#32** Fake online presence dots — Profile.jsx hardcodes green dot; Members.jsx uses `index % 3`. Wire up real RTDB presence or remove dots.
- **#33** Inline video embed — paste YouTube/Twitch URL into a post, renders as iframe player in the card.
- **#37** Coach-handled user deletion — add delete to admin panel. Firestore doc easy; Firebase Auth deletion needs admin SDK (Spark plan limitation).
- **#28** Home dashboard redesign.

## Known gotchas / open items
- Firebase password-reset emails land in spam (generic sender) — known, low priority. Real fix needs a custom domain + SPF/DKIM/DMARC (deliverability is an identity problem, not code).
- Posting lives in the Hubs (Discord-room model); Home is a read-only dashboard.
- **DEMO_MODE is dev-only** (`import.meta.env.DEV && !VITE_FIREBASE_API_KEY`) — fails closed in prod builds (no accidental auto-admin). Seeds a fake `role:'admin'` demo user against mock data when Firebase isn't configured; real data is still protected by Firestore rules.
- **App Check ENFORCED (2026-06-12)** — Firestore, Auth, Storage all enforced in Firebase Console. reCAPTCHA v3 active. See `docs/firebase-appcheck-explained.md`.
- **GIFs work in posts AND comments** — `VITE_GIPHY_API_KEY` in `.env`. Inline Quill embed (PR #27).
- **Live presence on Home** — RTDB `database.rules.json` deployed, `src/firebase/presence.js` handles online/offline.

## Roadmap / source of truth
- **`TODO.md`** (repo root) is the single canonical task list. Update it instead of scattering todos across chats.

## Git / GitHub
- **Public repo:** github.com/sstewart207/uesl-dashboard (made public 2026-06-12). User authed via `gh` CLI + `firebase-tools`.
- **⚠️ DEPLOY RULE:** Always ask Shane to type DEPLOY before running any firebase deploy or production push.
- **PR workflow:** feature work goes on a branch → push → `gh pr create` → merge via `gh pr merge N --merge --delete-branch` → `git checkout master && git pull`. Claude does the branch/PR/merge via CLI (don't make the user click GitHub web unless they want to review).
- Backups: GitHub (code) + a periodic full-folder zip to Google Drive (incl. `.env`).
- Commit messages end with the Co-Authored-By line (user OK with this on a private repo).
