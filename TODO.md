# UESL Dashboard — TODO (consolidated source of truth)

> Single durable list. Survives Claude session resets. Update this instead of re-pasting
> into chat. Last reconciled: 2026-06-04.
>
> **GitHub sync rule:** every open GitHub issue/PR must appear here; when a PR merges or an
> issue closes, check it off / remove it. This file = `gh issue list` + `gh pr list` + planned work.
>
> **Current GitHub state (2026-06-04):** open PRs: none. open issues: #7 (profanity filter → backlog item below).

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

## 🔜 Next session — launch (get to a real, invitable app)
Order matters; each unblocks the next.

1. **Firebase Hosting** — config is STAGED on branch `feature/firebase-hosting` (`hosting` block added,
   `dist` + SPA rewrite, build verified). Deploy was HELD pending bot protection. To launch:
   merge that branch → `npm run build` → `firebase deploy --only hosting` → `https://uesl-dashboard.web.app`.
   *(If switching to Vercel/Cloudflare instead: also add the new domain to reCAPTCHA domains AND
   Firebase Auth authorized domains, or login + App Check break. Firebase Hosting needs neither — pre-wired.)*
2. **App Check — enforce (decision B)** — AFTER hosting is live: open the deployed site, confirm requests
   show **verified** in Firebase → App Check → Metrics, THEN flip **Enforce** on Firestore/Auth/Storage.
   Enforcing before prod attests = lockout, so hosting must come first.
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
