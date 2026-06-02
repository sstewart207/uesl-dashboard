# UESL Dashboard

A private, **members-only social hub** for the **United Esports League** — think "Facebook for the club." Built for ~10–15 members to share posts, run events and tournaments, and stay connected across the club's three pillars: **Gaming**, **Coding/Tech**, and **Graphic Design**.

> Status: active development (week 1). Not yet deployed — building, polishing, and testing.

## Features

- 🔐 **Members-only access** — email/password auth with an admin/coach **approval gate** (no randos)
- 💬 **Discussion hubs** — Gaming, Coding, Design rooms with rich-text posts, comments, likes
- 📅 **Events + calendar** — coaches post events; members RSVP; coaches see the roster
- 🏆 **Tournaments** — sign-ups and brackets
- 📣 **Bulletins** — coach announcements, pinned to the home dashboard
- 👤 **Profiles** — avatars, games, skills, and social links (Discord, Twitch, YouTube, etc.)
- 🔔 **Notifications** — in-app activity (likes, comments, RSVPs)
- 🌗 **Bold esports theme** — yellow/white/black, light & dark modes

## Tech stack

React 18 + Vite · MUI v6 · Firebase (Auth + Firestore + Storage) · React Router · FullCalendar · react-quill-new · DOMPurify · date-fns

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Add your Firebase config
#    Copy .env.example to .env and fill in your project's values
cp .env.example .env

# 3. Run the dev server
npm run dev -- --port 5174
# → http://localhost:5174
```

## Security model

- New sign-ups land in a **pending** state with no access until an **admin or coach approves** them.
- Firestore security rules enforce: only approved members read/write club content; coaches/admin manage events, bulletins, tournaments, and approvals.
- Rich-text is **sanitized (DOMPurify)** before render to prevent XSS.
- Rules + indexes are version-controlled (`firestore.rules`, `firestore.indexes.json`) and deployed via the Firebase CLI.

## Project structure

```
src/
  pages/          # Home, hubs, Events, Tournaments, Bulletins, Profile, etc.
  components/     # Shared UI (PostCard, Brand, dialogs, states)
  features/auth/  # AuthContext, Login, Register
  firebase/       # init + Firestore/Storage helpers
  theme/          # MUI theme factory + light/dark color mode
```

---

Private project — © United Esports League.
