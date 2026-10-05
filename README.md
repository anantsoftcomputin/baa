# BAA Alumni Portal

The website and member portal of **Bhavan's Alumni Association, Vadodara**: a public site (events, initiatives, committee, gallery, blogs, contact) and a signed-in dashboard (feed, batchmate directory, profiles, event registration, contributions, lifetime membership), with an admin CMS.

Built with React 18, Material UI 5 and Firebase (Auth, Firestore, Storage, Cloud Functions, Hosting).

---

## Quick start

```bash
npm install
npm start            # http://localhost:3000, talks to the production Firebase project
```

### Local development with emulators (recommended)

Runs the whole app against local Firebase emulators with demo data, without touching production.

```bash
npm install --prefix functions   # once
npm run emulators                # terminal 1: Auth, Firestore, Storage
npm run emulators:seed           # terminal 2: demo users, events, posts…
npm run start:emulators          # terminal 3: http://localhost:3000
```

Demo logins (password `Password123!`): `admin@baa.test` (Superuser), `office@baa.test` (Admin), `asha@baa.test` (member), `rohan@baa.test` (non-member). The emulator UI is at http://127.0.0.1:4411.

### Scripts

| Command | What it does |
|---|---|
| `npm start` / `npm run build` | Dev server / production build |
| `npm test` | Unit and component tests (Jest) |
| `npm run test:rules` | Firestore security-rules tests (starts the emulator) |
| `npm run test:functions` | Payment logic tests |
| `npm run deploy:rules` | Deploy Firestore + Storage rules |
| `npm run deploy:hosting` | Build and deploy the site |
| `npm run deploy` | Build and deploy everything (hosting, rules, indexes, functions) |

---

## Project structure

```
src/
  App.js                 routes (pages are lazy-loaded)
  theme.js               design tokens + MUI theme (colours from the BAA logo)
  contexts/AuthContext   signed-in user, profile, role flags
  firebase/              config, auth, firestore (data layer), storage, payments, analytics
  utils/format.js        date/time/currency/slug helpers
  components/
    common/              shared UI: PageHeader, SectionHeader, EventCard, InitiativeCard, …
    LandingPage/         public site
    Auth/                sign in / register / reset password
    Dashboard/           member portal (feed, events, initiatives, profiles, membership)
    Admin/               admin panel (/dashboard/admin?tab=…)
functions/               Cloud Functions: Razorpay orders + payment verification
rules-tests/             security-rules test suite
scripts/seed-emulator.js demo data for local development
firestore.rules, storage.rules, firestore.indexes.json
```

---

## Roles and access

| Role | How it's set | Can do |
|---|---|---|
| User | Default on sign-up | Dashboard, posts, follow, register for events |
| Member | `is_member: true`, set by a successful membership payment or by an admin | Same, plus member badge |
| Admin | `userRole: "Admin"` | Admin panel: content, events, initiatives, messages; grant membership |
| Superuser | `userRole: "Superuser"` | Everything, plus changing roles |

**Making the first Superuser:** register and verify an account. Then, in the Firebase console → Firestore → `users/<uid>`, set `userRole` to `"Superuser"`. Sign out and back in. After that, manage roles from **Admin panel → Users**.

Users can't change their own `userRole` or `is_member`. The security rules enforce this, and `npm run test:rules` covers it.

---

## Payments (Razorpay)

All amounts are decided and verified on the server:

1. The browser calls the `createPaymentOrder` Cloud Function. It works out the price (membership fee from `websiteContent/membership`, the event fee from the event, or the contribution amount the user entered) and opens a Razorpay order.
2. Razorpay Checkout runs in the browser.
3. `verifyPayment` checks Razorpay's signature. Then it marks the member as paid, confirms the event registration, or records the contribution and updates the initiative's `raised_amount`.

Until the functions are deployed, the site shows "Online payments aren't switched on yet", and free event registration keeps working.

**To enable it** (Cloud Functions need the Firebase Blaze plan):

```bash
npm install --prefix functions
echo "RAZORPAY_KEY_ID=rzp_live_xxxxx" > functions/.env
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase deploy --only functions
```

The membership fee and benefits can be edited in **Admin panel → Website content → Membership**.

---

## Deploying

### Website on Netlify

`netlify.toml` already has the build command, the publish folder, the SPA redirect that keeps deep links working, and caching headers.

1. Netlify → **Add new site → Import an existing project** → pick the GitHub repo. The build settings are read from `netlify.toml`.
2. Environment variables are optional: the app falls back to the production Firebase config. To set them explicitly, copy the `REACT_APP_*` values from `.env.example` into Site settings → Environment variables.
3. **Required:** Firebase console → Authentication → Settings → **Authorized domains** → add your Netlify domain (e.g. `your-site.netlify.app` and any custom domain). Without this, Google sign-in and email links fail on the new domain.

### Firebase (rules, indexes, functions)

```bash
firebase login
npm run deploy:rules                         # security rules first
firebase deploy --only firestore:indexes
firebase deploy --only functions             # when ready to take payments
npm run deploy:hosting                       # only if you host on Firebase instead of Netlify
```

Both Netlify and Firebase Hosting serve `build/` with an SPA rewrite. Deep links such as `/events/<id>` work because assets are served from the site root (`"homepage": "/"`).

---

## Data model (Firestore)

| Collection | Notes |
|---|---|
| `users/{uid}` | Profile. `batchyear` (number), `userRole`, `is_member`, `following[]`, `followers[]`, `show_email`, `show_phone`, … |
| `posts/{id}` | `user_id`, `username`, `userPhoto`, `content`, `image_url`, `likesCount`, `commentsCount`, `sharesCount` |
| `likes/{postId_uid}`, `comments/{id}`, `shares/{id}` | Social interactions |
| `events/{id}` | `name`, dates/times, `location`, `amount` (fee per alumnus), `guest_amount`, `image` |
| `eventRegistrations/{eventId_uid}` | `status`: `confirmed` / `pending_payment`; `payment_status`: `free` / `pending` / `paid` |
| `initiatives/{id}` | `total_funds_required`, `raised_amount`, `contributors_count` |
| `contributions`, `payments`, `paymentOrders` | Written only by Cloud Functions |
| `websiteContent/{aboutUs, heroImages, contact, footer, membership}` | Public site content, edited in the admin panel |
| `committee`, `achievements`, `testimonials`, `blogs`, `gallery` | Public content |
| `contactSubmissions`, `feedback` | Public forms; only admins can read them |

Older documents that use `school_graduation_year`, `image` or `author` are still read correctly.
