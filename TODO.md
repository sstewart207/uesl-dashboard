# UESL Dashboard — TODO (consolidated source of truth)

> Single durable list. Survives Claude session resets. Update this instead of re-pasting
> into chat. Last reconciled: 2026-06-12 (session end).
>
> **Session-end state (2026-06-12):** PRs #26 + #27 merged. PR #24 closed (stale). Repo made PUBLIC.
> 5 new issues filed (#29–#33). Master clean + synced. GIFs in posts + live presence now in master.
> Bundle splitting live. Launch blockers #14, #15, #17 remain (all user actions).
>
> **GitHub sync rule:** every open GitHub issue/PR must appear here; when a PR merges or an
> issue closes, check it off / remove it. This file = `gh issue list` + `gh pr list` + planned work.
>
> **Current GitHub state (2026-06-12):** open PRs: none. Open issues: launch-blockers `#14,#15,#17`;
> post-launch `#7,#18–#23,#28–#33`.

## ✅ Done 2026-06-03 (tonight)
- **Authorship spoof closed** — posts/comments pin `authorUid == request.auth.uid` (PR #8, deployed live).
- **Coach power scoped** — approve + revoke only, no admin-minting, no user deletes (PR #8, deployed live).
- **DEMO_MODE fail-closed** — dev-only, can't auto-admin in a prod build (PR #9, merged).
- **@mentions regex** — confirmed already fixed (PR #3).
- **Docs** — CLAUDE.md refreshed; App Check lesson written (`docs/firebase-appcheck-explained.md`).

## ✅ Done 2026-06-04 (today)
- **App Check code merged** (PR #11) — reCAPTCHA v3 init in `src/firebase/firebase.js`, guarded by
  `VITE_RECAPTCHA_SITE_KEY`. No auth/component changes (global SDK-level).
- **reCAPTCHA v3 key created** — site key in `.env`, secret registered in Firebase App Check.
- **Localhost debug token registered** (`8d6a0a62-...`) — dev verified: 403s gone, tokens accepted.
- **App Check is in MONITORING mode** (watching, not blocking). Enforcement intentionally deferred —
  see decision B below.

## 🎯 Definition of Done — v1 launch
> Ship the moment ALL of these are checked. Blockers only. Everything else (below) is
> consciously deferred. An agent finding more "improvements" does NOT move this line.

- [x] **B1. Storage security rules** — DONE + deployed (PR #13). `storage.rules`: user writes only their
      own `avatars/{uid}/` folder (images <5MB), signed-in read, deny-all else. Wired into `firebase.json`.
- [ ] **B2. Firebase Hosting** (#14) — config STAGED in `master` (`firebase.json` hosting block). To launch:
      `npm run build` → `firebase deploy --only hosting` → `https://uesl-dashboard.web.app`.
- [ ] **B3. App Check — enforce (decision B)** (#15) — AFTER hosting live: confirm **verified** in App Check →
      Metrics, THEN flip **Enforce** on Firestore/Auth/Storage. (Enforce before prod attests = lockout.)
- [x] **B4. GIF button** (#16) — GIF picker shipped (PR #25); button disabled with tooltip when key missing,
      `VITE_GIPHY_API_KEY` confirmed in `.env`. Done.
- [ ] **B5. End-to-end test pass** (#17) (Edge, then live URL): signup → pending → approve → post/comment;
      coach approve+revoke works, can't mint admin; bad inputs error clean.

## 🟢 Non-blockers — accepted for ~15-user scale (post-launch / optional)
> Real findings, consciously NOT blocking v1. Revisit only if the app grows or one actually bites.
- [ ] **N1. Automated tests** (#18) — none exist. Highest ROI: vitest on pure utils (`findMentions` in
      `mentions.jsx`, `cleanHtml` in `sanitize.js`) + rules tests via Firebase emulator. Do before
      adding big features, not before launch.
- [x] **N2. Bundle splitting** (#19) — DONE (PR #26, merged 2026-06-12). Lazy-load on Events, Hubs, Tournaments, AdminApproval.
- [ ] **N3. Custom claims for roles** (#20) — rules do a `get()` of the user doc on every request
      (`isApproved`/`isCoach`). Fine at 15 users; the scale fix is auth custom claims via a Cloud Function.
- [ ] **N4. Like-count integrity** (#21) [LOW] — `hasOnly` lets a member set `likeCount` to any value
      (`firestore.rules:51`). Not a threat among friends.
- [ ] **N5. Profanity / adult filter** (#7) — mask-or-block + DOMPurify. Social problem; trusted group.
- [ ] **N6. Reset-email deliverability** (#22) [LOW] — needs custom domain + SPF/DKIM/DMARC. "Check spam" for now.
- [ ] **N7. Phone control** (#23) — Remote Control (`/rc` QR) or Claude Code on web.

## ✅ Done 2026-06-12 (today)
- **Bundle splitting merged** (PR #26) — lazy-load on Events/FullCalendar, Hubs/ReactQuill, Tournaments, AdminApproval.
- **GIF inline embed + live presence merged** (PR #27) — GIFs in posts (Quill inline), live presence on Home dashboard via RTDB.
- **PR #24 closed** — stale, superseded by PR #25.
- **Repo made public** — github.com/sstewart207/uesl-dashboard is now public.
- **5 new issues filed** (#29–#33) — see bugs section below.

## 🐛 Bugs (post-launch, filed 2026-06-12)
- [ ] **#29 Settings dead link** — Navbar "Settings" navigates to `/settings` but no route exists. Fix: build the page or remove the menu item.
- [ ] **#30 Coaches can't delete bulletins** — `deleteBulletin()` exists in `firestore.js` but not wired up in `Bulletins.jsx`. Quick fix.
- [ ] **#31 Coaches can't delete events** — `deleteEvent()` exists in `firestore.js` but not wired up in `Events.jsx`. Quick fix.
- [ ] **#32 Fake online presence dots** — `Profile.jsx` hardcodes green dot; `Members.jsx` uses `index % 3`. Remove dots or wire up real presence.
- [ ] **#33 Inline video embed** (feature) — paste YouTube/Twitch URL → renders as iframe player in post. Files: PostEditor, PostCard, PostDetail, firestore.js. ~30 min.

## 📚 Learning track (school)
- [x] Firebase School Class 1 — Firestore security rules (taught from PR #8).
- [x] Firebase School Class 2 — App Check / reCAPTCHA (lived it; lesson in `docs/firebase-appcheck-explained.md`).
- [ ] GitHub School Class 1 — branch → PR → merge → pull cycle, formalized.
