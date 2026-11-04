# BAA Alumni Portal

The website and member portal of **Bhavan's Alumni Association, Vadodara**: a public site (events, initiatives, committee, gallery, blogs, contact) and a signed-in dashboard (feed, batchmate directory, profiles, event registration, contributions, Alumni Membership), with an admin CMS.

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
functions/               Cloud Functions: CCAvenue checkout + payment verification
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

## Payments (CCAvenue live)

Protocol reference: [CCAvenue integration guide](https://links.avenues.info/downloads/CCAvenue_Integration_Ver_3_3.pdf) and [merchant API guide](https://links.avenues.info/downloads/CCAvenues_API_Vers-1_3.pdf).

Memberships, paid event registrations and initiative contributions use CCAvenue Billing Page (Non-Seamless): the browser posts the encrypted order to CCAvenue and the customer completes payment on its hosted page. This is the hosted billing flow described in the supplied integration instructions; `integration_type=iframe_normal` applies only to the alternative embedded iFrame flow. Required fields include a unique order ID (maximum 40 characters), INR amount with two decimal places, redirect/cancel URLs and `language=en`. Cloud Functions calculate prices, encrypt the request, receive the encrypted POST callback and independently check CCAvenue's Order Status API before granting benefits. Fulfilment runs in a Firestore transaction so repeated callbacks cannot duplicate contributions.

Credentials are **backend only**. Root `.env` contains public React configuration; `functions/.env` contains `CCAVENUE_ENV`, `CCAVENUE_MERCHANT_ID`, `CCAVENUE_ACCESS_CODE` and `PAYMENT_SITE_URL`. The working key must be stored in Firebase Secret Manager for production. Never use a `REACT_APP_` prefix for gateway credentials.

Set `CCAVENUE_ENV=production` for live checkout (`secure.ccavenue.com`) and status requests (`api.ccavenue.com`). Set `CCAVENUE_ENV=test` for checkout on `test.ccavenue.com` and status requests on `apitest.ccavenue.com`. Use matching MARS credentials, including the working key, for the selected environment. The local configuration remains `production` as requested.

Test checkouts record `test_paid` orders and `test_completed` payments, show an explicit test result, and never grant real membership, event registrations or contributions. Use an isolated Firebase project for staging. Each order records its environment; a pending order cannot be verified using credentials switched to another environment. Verify pending orders before switching credentials or switch back to their environment to reconcile them.

To enable live payments (Firebase Blaze plan required):

1. Review `functions/.env` against `functions/.env.example`. Use the credentials issued for the registered production domain.
2. Run `firebase functions:secrets:set CCAVENUE_WORKING_KEY` and paste the working key from the CCAvenue merchant portal at the hidden prompt. The ignored `functions/.secret.local` holds the existing key for emulator use only; deployment does not import it.
3. In CCAvenue MARS, confirm the registered website is `https://bhavansalumniassociation.org` and Order Status API access is enabled. If CCAvenue requires outbound IP allowlisting for this account, configure static egress for the functions and register that IP before taking payments.
4. Run `npm run test:functions`, `npm run build`, then `firebase deploy --only functions:createPaymentOrder,functions:ccavenueResponse,functions:verifyPayment,functions:ccavenueNotification` and deploy the rebuilt frontend to its existing host. Deploy the backend and frontend together because the old Razorpay checkout is incompatible.
5. The live redirect and cancel URL is `https://asia-south1-stationachyut.cloudfunctions.net/ccavenueResponse`. It must accept public POST requests. If MARS requires callback registration, register this exact URL. The callback sends customers to `/dashboard/payment-result` on `PAYMENT_SITE_URL`.

6. Complete a controlled live payment and confirm its order, payment record and entitlement in Firestore. Check cancelled payments too. Local tests do not prove merchant activation or live credentials.

**Latest retry (25 October 2026):** Firebase access was restored and all three payment functions (`createPaymentOrder`, `ccavenueResponse`, `verifyPayment`) were successfully created in `asia-south1` on project `stationachyut`. The working key is stored as version 1 of `CCAVENUE_WORKING_KEY` in Secret Manager with access granted to the functions runtime. Public endpoint checks reached the handlers: both callable functions reject unsigned requests with HTTP 401, and the callback rejects GET with HTTP 405. All 18 backend payment tests and 4 frontend payment tests passed, and the production build succeeded. The rebuilt CCAvenue frontend was subsequently deployed to the existing Netlify site `baa-baroda` at `https://bhavansalumniassociation.org` (deploy `6add07687aa4d96c8bb49e08`). A read-only live Order Status API request returned `Access_code: Invalid Parameter` (HTTP 200, gateway status `1`); verify the environment, API credentials and API activation in MARS or with CCAvenue support before launch. Hosted checkout has not been validated by an end-to-end payment, and no payment was initiated by these checks.

**Static payment egress (31 October 2026):** Project `stationachyut` now has the `baa-payments` custom VPC, the `baa-payments-egress` subnet (`10.80.0.0/28`) and `baa-payments` Serverless VPC Access connector in `asia-south1`. Router `baa-payments-router` and Cloud NAT gateway `baa-payments-nat` route that subnet through reserved regional address `baa-ccavenue-ip`: **`34.93.184.151`**. The shared payment function options specify this connector and `ALL_TRAFFIC`; retain these settings on future deployments. A temporary Cloud Run diagnostic job verified the outbound IP and made a read-only production Order Status request, which still returned gateway status `1`, `Access_code: Invalid Parameter`. The diagnostic job was deleted. CCAvenue must allowlist this IP and confirm Order Status API activation/credentials before pending orders can be verified. Netlify's inbound IP does not identify these outbound requests. The connector, NAT and external address incur ongoing Google Cloud charges; keep the reserved address while it is allowlisted.

**Status API verification (4 November 2026):** Read both supplied guides, `Updated_API_Document_CCAvenue.pdf` (Status API, pp. 17–26; authentication and error handling) and `Dynamic Event Notification1.pdf` (server notification handling, pp. 1–7). A temporary Cloud Run diagnostic job using the same connector, runtime service account, production access code and Secret Manager working key confirmed outbound IP **`34.93.184.151`** and a successful API envelope (`status=0`). A deliberately nonexistent order returned the decrypted application error `51313`, `No record found.` This confirms that the previous `51407` access rejection has cleared; it does not establish that a payment succeeded.

**Confirmed parser bug:** live successful Order Status responses append two trailing whitespace characters to `enc_response` (for example, 2,530 characters received versus 2,528 after trimming). Our shared decrypt helper correctly requires hex input with an AES block-aligned length, so it rejected these responses even after whitelisting worked. The API handler now trims surrounding transport whitespace before calling that strict decrypt helper. Regression tests include the live trailing-CRLF response format and still reject non-hex ciphertext. The browser callback retains strict validation.

The API guide lists currency as `order_curr` in its field table but uses `order_currncy` in its JSON example. Verification accepts both while still requiring the exact stored order, currency and amount. Gateway failures now log numeric API error codes without logging response bodies or credentials. Documented `Unsuccessful` and `Auto-Reversed` results are treated as failed for unfulfilled orders. Reversals/refunds of already fulfilled payments still require merchant review; this change does not automatically revoke benefits.

**Deployment and recovery (4 November 2026):** Updated `ccavenueResponse`, `verifyPayment` and the new public `ccavenueNotification` in `asia-south1` on `stationachyut`, retaining the VPC connector and `ALL_TRAFFIC`. All 24 backend tests passed. Reconciled all nine existing production orders through the deployed notification handler, which queried CCAvenue independently: **3 paid, 3 pending, 1 failed, 2 still created**. Verified the three completed payment records against their stored orders and confirmed membership was enabled. The two unchanged orders returned `51313` (no record found) and were not credited. No new checkout/payment was initiated. Temporary diagnostic Cloud Run jobs were deleted. MARS notification URL registration remains an account-side setup step.

For asynchronous recovery when the customer closes the browser, register **`https://asia-south1-stationachyut.cloudfunctions.net/ccavenueNotification`** in MARS Dynamic Event Notification settings for **Order status echo URL** and **Order Reconciliation Status**. Keep the browser redirect/cancel URL pointing to `ccavenueResponse`. The notification endpoint decrypts `encResp`, matches the stored order details, independently queries the Status API and acknowledges with HTTP 200 after verification. It returns HTTP 503 if verification is unavailable. Do not assume delivery retries: users can still use **Check again**. Register only the two order events here; risk and payment-option notifications have different payloads.

The return page only shows success after the backend confirms payment. If confirmation is delayed, use **Check again**, or open `/dashboard/payment-result` in the same browser to recover the last checkout. Do not pay again while a payment is pending. The account owner or an admin can also find the reference in `paymentOrders`.

Membership pricing is managed in **Admin panel → Website content → Membership**. Free event registration continues without the gateway. Refunds are handled through CCAvenue's merchant dashboard; automated refunds are not implemented.

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
