# UESL Dashboard — TODO (consolidated source of truth)

> Single durable list. Survives Claude session resets. Update this instead of re-pasting
> into chat. Last reconciled: 2026-06-03 (night).

## ✅ Done 2026-06-03 (tonight)
- **Authorship spoof closed** — posts/comments pin `authorUid == request.auth.uid` (PR #8, deployed live).
- **Coach power scoped** — approve + revoke only, no admin-minting, no user deletes (PR #8, deployed live).
- **DEMO_MODE fail-closed** — dev-only, can't auto-admin in a prod build (PR #9, merged).
- **@mentions regex** — confirmed already fixed (PR #3).
- **Docs** — CLAUDE.md refreshed; App Check lesson written (`docs/firebase-appcheck-explained.md`).

## 🔜 Tomorrow (next session) — get to a real, invitable app
Order matters; each unblocks the next.

1. **Firebase Hosting** — add `hosting` block to `firebase.json` (public `dist`, SPA rewrite),
   `npm run build`, `firebase deploy --only hosting` → live URL `https://uesl-dashboard.web.app`.
   *This is THE unlock for inviting a real user (right now the app is localhost-only).*
2. **App Check (bot protection)** — invisible reCAPTCHA v3. Plan in
   `~/.claude/plans/hi-claude-i-was-crystalline-puppy.md`, lesson in `docs/firebase-appcheck-explained.md`.
   - [ ] 2a. Add App Check init to `src/firebase/firebase.js` + `VITE_RECAPTCHA_SITE_KEY` to `.env`/`.env.example`.
   - [ ] 2b. Console: register web app w/ reCAPTCHA v3, copy site key, register localhost debug token.
   - [ ] 2c. Confirm verified tokens in App Check → Metrics, THEN enforce on Firestore/Auth/Storage
         (enforcing early = lockout).
3. **GIF key** — add `VITE_GIPHY_API_KEY` to `.env` (PR #6 picker is dead without it). Quick.
4. **End-to-end test pass** (Edge @ localhost:5174, then on the live URL): signup → pending →
   approve → post/comment; coach approve+revoke works, can't mint admin; bad inputs error clean.

## 📚 Learning track (school)
- [x] Firebase School Class 1 — Firestore security rules (taught from PR #8; see chat).
- [ ] **Read & absorb** `docs/firebase-appcheck-explained.md` (App Check / reCAPTCHA). Ask follow-ups.
- [ ] GitHub School Class 1 — branch → PR → merge → pull cycle, formalized.

## 🟢 Backlog
5. **Profanity / adult filter** (issue #7) — posts/comments/free text; mask-or-block + DOMPurify.
6. **Reset-email spam** [LOW] — blocked: needs custom domain + SPF/DKIM/DMARC. "Check spam" for now.
7. **Phone control** [BACKLOG] — Remote Control (`/rc` QR) or Claude Code on web.
8. **Like-count integrity** [LOW] — accept for club scale, or move counts server-side later.
