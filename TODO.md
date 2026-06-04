# UESL Dashboard — TODO (consolidated source of truth)

> Single durable list. Survives Claude session resets. Update this instead of re-pasting
> into chat. Last reconciled: 2026-06-03 (night).

## 🔴 Security
- [x] **1. Authorship spoof** — `firestore.rules` posts + comments `create` now pin
  `authorUid == request.auth.uid`. ✅ Done + deployed (PR #8).
- [ ] **2. DEMO_MODE prod safety** — `src/firebase/firebase.js`. `DEMO_MODE = !VITE_FIREBASE_API_KEY`
  is safe *only if* the prod build has the env key. Harden: force `false` in production builds
  (`import.meta.env.PROD`) so a missing key fails loudly instead of silently opening auto-admin.
- [x] **3. Coach permission scope** — `firestore.rules`. Coaches limited to approve + revoke
  (set role student/coach/pending), no admin-minting, no user deletes; delete = admin only.
  ✅ Done + deployed (PR #8). Decision: "approve + revoke, no admin."

## 🟡 Testing (manual, Edge @ localhost:5174 — NOT preview pane)
- [ ] **4. UI test pass** — pending gate, login/refresh persistence, bad-input errors,
  role gating, author/coach-only edit/delete, empty + loading states.
- [ ] **5. Negative rule tests** — student can't forge a post or write another user's doc;
  CAN rsvp / sign up but can't edit full event/tournament docs.

## 🟢 Backlog
- [ ] **6. Finish GIF hookup** — add `VITE_GIPHY_API_KEY` to `.env` (code merged, just needs key). Quick.
- [ ] **7. Profanity / adult filter** (issue #7) — posts/comments/free text; mask-or-block + DOMPurify.
- [ ] **8. Reset-email spam** [LOW] — blocked: needs a domain + email provider. "Check spam" for now.
- [ ] **9. Phone control** [BACKLOG] — Remote Control (`/rc` QR) or Claude Code on web.
- [ ] **10. Like-count integrity** [LOW] — accept for club scale, or move counts server-side later.

## ✅ Done (deduped from Phone Claude's list)
- **@mentions regex** — PR #3 (prefix-guarded regex, hyphens, keyboard-accessible button).
- **Authorship spoof (#1)** — PR #8.
- **Coach permission scope (#3)** — PR #8.
