# Firebase School — App Check & reCAPTCHA, explained

> Plain-English lesson for Shane. Re-read this anytime. Goal: understand the bot-protection
> plan well enough to defend it.

## The problem we're solving

Your app is **client-only**: the React code in the browser talks *directly* to Firebase
(Firestore, Auth, Storage). There's no server of yours in the middle.

That's convenient, but it means: **anyone can see your Firebase config** (the API key etc. are
in the downloaded JavaScript — they're *meant* to be public) and, more importantly, anyone can
write a script that uses the Firebase SDK to hammer your backend directly, *without ever opening
your website*. They skip your login page, your buttons, your UI entirely. A bot doesn't fill out
forms — it calls the API.

So the question "how do I keep bots/AI off my app?" is really: **"how does Firebase know a request
came from my real app, running in a real browser, driven by a real human — and not from a script?"**

## Why a plain CAPTCHA doesn't fix it (the key insight)

A normal CAPTCHA widget (the "click the traffic lights" or invisible checkbox) does one thing:
it gives the browser a **token** that means "a human probably did this." But a token is just a
string. It only *means* something if a **server checks it** with the CAPTCHA provider and says
"yep, valid." 

You have **no server**. So if you slapped a CAPTCHA on your login form, nothing would actually
*verify* the token — and a bot would ignore the form and hit Firebase directly anyway. That's
why a bare CAPTCHA here is **security theater**: it looks like a lock but isn't attached to a door.

## What Firebase App Check actually is

App Check is Google's answer to exactly this "client-only app" situation. Think of it as a
**bouncer that Firebase itself runs**, server-side, on your behalf. Here's the flow:

1. When your real app loads in a browser, App Check quietly runs **reCAPTCHA v3** in the
   background (invisible — no puzzle, no checkbox). reCAPTCHA scores how human/legit the session
   looks.
2. App Check turns that into a short-lived **attestation token** — basically a signed note that
   says *"this request is coming from Shane's real app, and it passed the human check."*
3. The Firebase SDK **automatically attaches that token to every request** to Firestore/Auth/Storage.
4. On Google's servers, Firebase **checks the token before honoring the request.** No valid token
   → request **rejected**, before it ever touches your data.

The critical difference from a bare CAPTCHA: **the verification happens on Google's servers, not
yours.** You don't need a backend, because Firebase *is* the backend doing the checking. The
bouncer is built into the building.

## Why this is "invisible" and "not annoying"

- reCAPTCHA **v3** is score-based, not challenge-based — it watches behavior silently instead of
  making the user solve a puzzle. The user sees *nothing*.
- The token **auto-refreshes** in the background (`isTokenAutoRefreshEnabled: true`), so it's
  always fresh. No re-prompting.
- It's **global** — set up once in `firebase.js`, it covers every single Firebase call. That's why
  it can't be "after every comment": there's no per-action widget, just one invisible backbone.

This is the whole reason we picked it over a visible challenge: it satisfies "gate the backend
against bots" AND "never annoy a real member" at the same time.

## The pieces and where they live

| Piece | What it is | Where |
|---|---|---|
| **reCAPTCHA v3 site key** | Public key identifying your site to reCAPTCHA | `.env` as `VITE_RECAPTCHA_SITE_KEY`, used in `firebase.js` |
| **reCAPTCHA secret** | Private half that verifies tokens | Managed by Firebase — you never see it |
| **App Check init** | ~4 lines wiring reCAPTCHA into Firebase | `src/firebase/firebase.js` |
| **Debug token** | A pass so `localhost` dev works (App Check blocks localhost by default) | Generated at runtime, registered once in Firebase Console |
| **Enforcement toggle** | The switch that makes Firebase actually *reject* unverified requests | Firebase Console → App Check (per service: Firestore, Auth, Storage) |

## The one dangerous part: enforcement order

App Check has two modes: **monitoring** (watch, but still allow everything) and **enforced**
(reject unverified requests). The trap: if you flip **enforced** *before* your real app is
sending valid tokens, **you lock yourself out** — your own app's requests get rejected too.

Correct order, always:
1. Add the code + site key. Deploy.
2. Register the localhost debug token so dev keeps working.
3. Watch the **Metrics** tab until you see *verified* requests flowing.
4. **Only then** flip enforcement on, one service at a time.

"Measure that the good traffic is attested before you start blocking the bad." Fail-safe, like
the fail-closed lesson from DEMO_MODE — but here you deliberately stay fail-*open* until you've
confirmed the lock won't trap you inside.

## How it stacks with what you already have (defense in depth)

You now have **three** layers keeping the club private — each catches what the others miss:
1. **App Check** — stops bots/scripts from reaching the backend at all (invisible).
2. **Firestore security rules** — even an authenticated human can only do what their role allows
   (the PR #8 work: no spoofing, scoped coaches).
3. **Admin approval** — even a real human who signs up gets *no access* until you click approve.

No single layer is trusted alone. That's the whole game in security: **layers, not walls.**

## TL;DR
- Client-only app → bots can skip your UI and hit Firebase directly.
- A bare CAPTCHA can't stop that (no server to verify the token).
- **App Check** = Google verifies an invisible reCAPTCHA v3 token *server-side* on every request. No backend needed, no user annoyance.
- Set it up once in `firebase.js`; enforce in the console **only after** verified tokens appear, or you lock yourself out.
- It's layer #1 of three (App Check → rules → admin approval).
