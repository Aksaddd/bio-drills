# Google sign-in: plan for later

**Status:** the code is live with the Firebase project **MeowStudy** (`meowstudy-5750f`) configured in `assets/account.js`. Sign-in works once that project has Google sign-in enabled, `bio-drills.vercel.app` authorized, and the Firestore database and rules created (setup steps 3–5 below). The first version was built in commit `a7fca43`, set aside in `8d243b5`, and restored with this config.

## Why

Everything the site saves (drill progress, Read & Learn, notes, Bio-pardy, mock exams, the review list, every cat, gold, items, badges, settings) lives in the browser's `localStorage` on one device. Signing in with Google would let Raisa keep all of it in her account and pick up on any phone, tablet or laptop.

## What it would look like

- **Settings → Account** (top of the sheet): a standard *Sign in with Google* button.
- **Signed in:** her photo, name and email, a status line ("Saved to your account · just now"), *Sync now*, and *Sign out*.
- **First sign-in on a device that already has progress:** she picks *Use my account's progress* (replaces this device) or *Keep this device's progress* (replaces the account). A device with no progress just takes the account's.
- **Signing out** keeps the progress on the device.
- **Before setup:** the button is greyed out with "Google sign-in isn't set up on this site yet."

## How it works

The site is static on Vercel with no server, so it uses **Firebase**, Google's free app backend, entirely from the browser:

| Piece | Service | What it does |
|---|---|---|
| Sign-in | Firebase Authentication, Google provider | Google popup (falls back to a redirect if popups are blocked). Firebase keeps her signed in until she signs out. |
| Storage | Cloud Firestore | One document per person: `progress/{uid}` = `{ data: "<JSON of every bio-* localStorage key>", savedAt: <ms>, device: "<id>" }` |
| Code | `assets/account.js` | Loaded by `assets/settings.js` on every page, so no HTML changes. Firebase SDK 10.x from `www.gstatic.com/firebasejs/`, loaded only when configured. |

**Sync rules**

1. **Save:** any write to a `bio-*` key (it patches `localStorage.setItem`/`removeItem`) marks the device as changed. It saves about 4 seconds later, and again when the page is hidden or closed.
2. **Load:** on every visit, and when the tab comes back into view, it reads the account.
   - If another device saved more recently and this device hasn't changed since, it takes the account's data and reloads the page once.
   - If this device changed more recently, it saves over the account.
3. **First link** of a device to an account: the choice described above.
4. The account's own keys (`bio-account-*`) are never synced. The size cap is 900 KB, far above what the site stores.

**Known limits**

- The latest save wins. Answering on two devices at the same moment keeps whichever saved last. No per-question merge.
- The data lives in the site owner's Firebase project. The security rules below mean each person can only read or write their own document.
- It's free on Firebase's Spark plan at this scale (a few people, a handful of reads and writes per study session).

## Setup steps (site owner, about 10 minutes)

1. Go to <https://console.firebase.google.com> → **Add project** (Google Analytics can be off).
2. **Add app → Web** (no hosting needed). Copy the `firebaseConfig` object it shows. These values are public by design; the rules in step 4 protect the data.
3. **Build → Authentication → Get started → Sign-in method → Google → Enable** (choose a support email). Then **Settings → Authorized domains → Add domain** `bio-drills.vercel.app`, plus any custom domain.
4. **Build → Firestore Database → Create database** (production mode, any nearby region). Under **Rules**, publish:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /progress/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
5. Optional: **Authentication → Settings → User actions**, and keep sign-ups open only if others should be able to use it.

## Turning it back on

1. Bring the code back:
   ```bash
   git checkout a7fca43 -- assets/account.js assets/settings.js
   ```
   (`settings.js` at that commit adds the Account section and loads `account.js`. If `settings.js` has changed since, re-apply just those parts instead.)
2. Paste the config from step 2 into `SITE_CONFIG` at the top of `assets/account.js`.
3. Push. Vercel redeploys, and *Sign in with Google* appears in Settings.
4. Test on two devices: sign in on the one with progress, then on a second one. It should show the same cats and progress. Make a change on one, reload the other, and it should match.

**Testing without real Google:** set `window.BIO_FIREBASE_CONFIG` before the page loads (it overrides `SITE_CONFIG`) and serve stand-in modules for the three `www.gstatic.com/firebasejs/10.12.2/*.js` files. The Playwright test used in development did this with `context.route(...)`, with an in-memory "cloud". It covered: not set up, sign-in saving to an empty account, a fresh device restoring, auto-save after a change, another device picking it up, the keep-which choice, and sign-out keeping local data.

## Later ideas

- A small avatar next to *Settings* when signed in.
- Live updates across open devices (Firestore `onSnapshot`) instead of checking on load.
- Smarter merging, e.g. per-question history from both devices, to remove the latest-save-wins limit.
