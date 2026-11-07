# SkillSwap Security Audit: Fixes and Handover

Nov 7, 2026 · @Atharva

All 11 leads in the security audit are fixed and tested, along with most of its hardening notes. The work is **not on GitHub yet**: it sits uncommitted on `main` in one local checkout, based on commit `a7a6727`, with 38 files changed or added.

- **Blocking:** these changes must be committed and pushed before a teammate can continue.
- **Remaining:** password change and reset, token revocation, a React Router upgrade, automated tests, and the smaller items listed under Fixes still to do.
- **Unknown:** whether the app is deployed anywhere. If it is, the production checks in that list are urgent, because tokens could be forged on any server using the old public secret.

The source is `SkillSwapSecurityAudit.pdf`, run against `a7a6727`. The audit only reviewed code; its lead numbers are used below.

## Fixes done

Every audit lead below is fixed in the code and was attacked again on a running server to confirm the fix.

| Lead | Flaw | Fix | Main files |
| --- | --- | --- | --- |
| 1 | Public JWT fallback secret allowed forged admin tokens | Fallback removed. The server refuses to start if the secret is missing, under 32 characters or the old public value. Example files no longer contain a secret. | `server/config/env.js`, `server/utils/generateToken.js`, `server/server.js` |
| 2 | Demo admin `admin@skillswap.com` created in every environment | Seeding and the embedded database need `ENABLE_DEMO_DATA=true` and never run with `NODE_ENV=production`. Admin login removed from the login page; other demo logins appear in dev only. | `server/config/db.js`, `server/seed.js`, `client/src/pages/LoginPage.jsx` |
| 3 | Anonymous sockets could forge messages and notifications as any user | Sockets must present a valid token. The sender comes from the token and the receiver from the exchange. | `server/sockets/chatSocket.js`, `client/src/pages/MessagesPage.jsx` |
| 4 | Anonymous sockets could join any room and read live traffic | Exchange rooms check you are a participant. Each user joins only their own room automatically, and the `join-user-room` event is removed. | `server/sockets/chatSocket.js`, `client/src/context/SocketContext.jsx` |
| 5 | `POST /api/messages` had no participant check | Non-participants get 403. | `server/controllers/messageController.js` |
| 6 | `PUT /api/sessions/:id/status` had no party check and returned emails | Non-parties get 403, status changes follow a fixed table, and emails are gone from the response. | `server/controllers/sessionController.js` |
| 7 | `POST /api/sessions` accepted any exchange and partner | Only participants can schedule, only on Accepted or In Progress exchanges. The partner is taken from the exchange. | `server/controllers/sessionController.js`, `client/src/components/ScheduleSessionModal.jsx` |
| 8 | Reviews accepted on unfinished exchanges, so ratings could be bombed | Reviews need a Completed exchange, plus a whole-number rating from 1 to 5. | `server/controllers/reviewController.js` |
| 9 | Exchange status had no rules; senders could self-accept and inflate counters | A table sets the allowed moves and who may make them, applied atomically so counters rise exactly once. | `server/controllers/exchangeController.js` |
| 10 | Public endpoints exposed every user's email | Public data uses an allowlist of fields. Only you and admins see your email. | `server/utils/userFields.js`, `server/controllers/userController.js`, `server/controllers/reviewController.js`, `server/services/matchingService.js` |
| 11 | Unescaped user regex ran in MongoDB on search and skill lookup | Input is escaped and capped at 100 characters, with a 2-second query timeout. | `server/utils/sanitize.js`, `server/controllers/userController.js`, `server/controllers/skillController.js`, `server/controllers/adminController.js` |

### Hardening notes fixed

| Audit note | Fix | Main files |
| --- | --- | --- |
| No helmet or CSP | Helmet on the API. A production-only CSP in the client build, including `img-src`. | `server/server.js`, `client/vite.config.js` |
| No rate limiting | 1000 requests per 15 minutes on `/api`, 10 failed logins per 15 minutes, 20 registrations per hour, per IP. | `server/middleware/rateLimiter.js` |
| Free-form avatar URL | Must be `https:` or a same-site path. | `server/models/User.js` |
| JWT algorithm not pinned | Pinned to HS256. | `server/utils/generateToken.js` |
| 30-day tokens | Default is now 7 days. Revocation is still open. | `server/utils/generateToken.js`, `.env.example` files |
| Raw errors and stack traces | Unknown errors return a generic 500. Validation errors return 400, duplicates 409. Stack traces appear only with `NODE_ENV=development`. | `server/middleware/errorMiddleware.js` |
| No length limits or list limits | Max lengths on models. Caps of 200 users, 500 skills and 100 reviews per public list. | `server/models/`, list controllers |
| Non-string input caused 500s | These now return 400. | Auth, skill, message and review controllers |
| Admins could remove admins and read all chats | Both now return 403. | `server/controllers/adminController.js`, `server/controllers/messageController.js` |
| `skillswap-root` dependency | Removed from `server/package.json`, and from the client too. | Both `package.json` files |
| esbuild advisory | Vite upgraded to 6.4.5, esbuild now 0.25.12. | `client/package.json` |
| Orphaned exchanges crashed `GET /api/exchanges` | Exchanges with a deleted party are skipped. | `server/controllers/exchangeController.js` |

Four related fixes went beyond the audit:

- Suspending or deleting a user now drops their live sockets.
- A failed production database no longer falls back to an in-memory one.
- Sessions got the same status table as exchanges.
- The database URI no longer appears in logs.

## Behaviour changes to know about

These changes are deliberate, so code written against the old behaviour will now fail.

Exchanges move one step at a time, and only the receiver can accept:

| From | To | Who can do it |
| --- | --- | --- |
| Pending | Accepted | Receiver |
| Pending | Rejected | Receiver |
| Pending | Cancelled | Sender |
| Accepted | In Progress | Either party |
| Accepted | Cancelled | Either party |
| In Progress | Completed | Either party |
| In Progress | Cancelled | Either party |

Rejected, Completed and Cancelled are final. Skipping a step returns 409, and the wrong role returns 403. Admins can make any allowed move but cannot skip steps.

Sessions follow a similar table. From Proposed, only the partner can accept or reject, and only the proposer can cancel. From Accepted, either party can complete or cancel.

### API changes

- `POST /api/sessions`: `partnerId` is no longer needed and is ignored.
- Socket `send-message`: send only `exchangeId` and `content`. Any `senderId` or `receiverId` is ignored.
- Socket `join-user-room`: removed, because each user now joins their own room on connect.
- `GET /api/users`: the `role` filter is gone, and results contain only public fields.
- `send-message` drops invalid messages without telling the client. The UI input is capped at 2000 characters to match.

### Product decisions to confirm

These were judgement calls, so the team may want to overrule some of them.

- Admins can no longer read private chats, which limits moderation.
- Admins cannot suspend or delete other admins, and no other way to remove an admin exists yet.
- Admins no longer appear in the directory or matches, and others no longer see the Admin badge on their profiles.
- Exchange partners can no longer see each other's email.
- The directory shows only the newest 200 users until real pagination exists.

## Fixes still to do

Fourteen items remain, in priority order. Items 1 to 3 are not code changes and come first. Items 4 to 6 are the main engineering work; the rest are smaller gaps.

| # | Task | What to do | Where | Status |
| --- | --- | --- | --- | --- |
| 1 | Push the audit fixes | Commit the work to a branch and open a pull request. Nobody else can continue until this lands. | Local checkout | Not started |
| 2 | Secure any deployment | If the app is deployed, set a new `JWT_SECRET`, `NODE_ENV=production` and a real `MONGO_URI`. Set `TRUST_PROXY` behind a proxy. Remove any seeded demo accounts. | Hosting settings, `users` collection | Not started |
| 3 | Clean old records | The fixes stop new abuse but do not repair old data. Look for reviews on unfinished exchanges and inflated `completedExchanges`. | Production database | Not started |
| 4 | Password change, reset and token revocation | Add a `tokenVersion` to users and check it on REST and sockets. Add change-password and forgot/reset flows. The team must first choose how reset emails are sent. | `server/models/User.js`, `server/utils/generateToken.js`, `server/middleware/authMiddleware.js`, `server/sockets/chatSocket.js`, `client/src/pages/ProfilePage.jsx` | Not started |
| 5 | Automated tests | The repo has no test suite. Turn the end-to-end check script into `npm test`, so these fixes cannot silently regress. | `server/` | Not started |
| 6 | Upgrade React Router to v7 | Clears the 2 moderate advisories left in the client. This is a major version, so test all routing. | `client/package.json`, `client/src/App.jsx` | Not started |
| 7 | Skill moderation | Any user can create unlimited global skills, and `isApproved` is never enforced. This needs an admin approval workflow. | `server/controllers/skillController.js`, `server/models/Skill.js`, admin pages | Not started |
| 8 | Real pagination | Public lists have hard caps but no paging. Add paged endpoints and update the directory page. | List controllers, `client/src/pages/SkillDirectoryPage.jsx` | Not started |
| 9 | Password minimum | Still 6 characters. Decide whether to raise it, and change the server and form together. | `server/models/User.js`, `client/src/pages/RegisterPage.jsx` | Not started |
| 10 | Chat by exchange status | The API still accepts messages on Pending, Rejected and Cancelled exchanges, though the UI hides them. Decide on the rule and enforce it on REST and sockets. | `server/controllers/messageController.js`, `server/sockets/chatSocket.js` | Not started |
| 11 | Limit socket messages | `send-message` has no rate limit, unlike the REST API. | `server/sockets/chatSocket.js` | Not started |
| 12 | Two-sided completion | One party alone can mark an exchange Completed and then review the other. Decide whether both must confirm. | `server/controllers/exchangeController.js` | Not started |
| 13 | Small UI polish | Show an error when a socket message is refused. Hide suspend and delete buttons on admin rows, which now only return 403. | `client/src/pages/MessagesPage.jsx`, `client/src/pages/AdminDashboardPage.jsx` | Not started |
| 14 | Deployment and tooling | Serve over HTTPS, because the app itself speaks plain HTTP. Rate limits live in memory, so several server instances need a shared store. The server's 2 moderate dev-only advisories through `nodemon` remain; `npm audit fix` did not clear them. | Hosting, `server/middleware/rateLimiter.js`, `server/package.json` | Not started |

## Instructions for the teammate

Get the fixes, set up a new `.env`, then work through the table above from the first item not yet done. Your old `.env` will not work, because the server now refuses the old secret.

### Set up

1. Confirm item 1 is done, then pull the branch or `main` that holds the fixes.
2. Reinstall dependencies from the repo root. Helmet, express-rate-limit and Vite 6 are new.

   ```bash
   npm install && npm run install:all
   ```
3. Create `server/.env` from the example.

   ```bash
   cp server/.env.example server/.env
   ```
4. Generate a secret and paste it after `JWT_SECRET=` in `server/.env`. Use your own value and never commit it.

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
5. Leave `ENABLE_DEMO_DATA=true` for local work. Without local MongoDB, the first run downloads an embedded MongoDB of about 780 MB, and its data resets on restart.
6. Stop any old dev servers, then start the app from the repo root. The client runs on port 5173 and the API on port 5000.

   ```bash
   npm run dev
   ```
7. Sign in with a demo account from the README. Alex and Priya have quick-fill buttons in dev; the admin login is in the README only.

`npm run seed` deletes all existing data before reseeding, so run it only against a local database.

### If something goes wrong

| Symptom | Cause | Fix |
| --- | --- | --- |
| Server exits with `[Config] JWT_SECRET must be...` | Secret missing, too short or the old public value | Do step 4 |
| Server exits with `no database available` | MongoDB is unreachable and demo data is off | Start MongoDB, or set `ENABLE_DEMO_DATA=true` locally |
| Login page has no demo accounts | Running a production build | Use `npm run dev` |
| Vite returns 500 or a blank page | An old Vite process is still running after the upgrade | Stop every Vite process and restart |
| Login returns 429 | 10 failed attempts in 15 minutes | Wait, or restart the server locally, because limits live in memory |
| An external image, font or script works in dev but not in production | The CSP applies only to production builds | Add its host to `CONTENT_SECURITY_POLICY` in `client/vite.config.js` |

### Rules to keep when adding code

- **Identity:** take the user from `req.user` or the socket token, never from the request body.
- **Ownership:** check the user belongs to the exchange or session before reading or changing it. Sockets use `loadOwnExchange`.
- **User data:** select `PUBLIC_PROFILE_FIELDS` or `USER_SUMMARY_FIELDS`. Do not use `.select('-password')` for data other people see.
- **Search:** pass user input through `toSearchPattern` or `exactNameRegex` before it reaches a regex.
- **Status changes:** add new moves to the transition tables and keep the atomic `findOneAndUpdate`.
- **Tokens:** use `generateToken` and `verifyToken`, and read the secret only through `getJwtSecret`.
- **Demo data:** gate anything demo-only with `isDemoDataEnabled`.

### Before each pull request

1. Work on a branch per task, and do not commit `.env` files.
2. Run `npx vite build` in `client/`.
3. Run `npm audit --omit=dev` in `server/`, which currently reports 0 vulnerabilities.
4. Replay the attack as well as the normal flow on a running server, and test a production build with `npx vite preview` if you touched the client.
5. Update this document's Status column.

## How the fixes were checked

The fixes passed 112 end-to-end checks on a real server and MongoDB, and the original code failed more than 70 of the same checks. No code was reviewed by a second person, and nothing was tested on a deployed server.

| Check | Result |
| --- | --- |
| Fixed code: audit attacks plus normal flows, through REST and sockets | 112 of 112 passed |
| Original code `a7a6727`: same script | More than 70 failed; output was capped at 70 lines. Example: 8 concurrent completes all succeeded and took a counter from 6 to 12. |
| Production build in a browser | Sign-in, live chat, requests and discover pages worked with the CSP on, with no console errors |
| Dev server in a browser, Vite 6.4.5 | Login page showed only Alex and Priya, with no CSP and no console errors |
| Fresh production build | Passed, with no demo credentials in the bundle |

### Not yet checked

- The admin dashboard, session scheduling, status buttons and review form were tested through the API, not by clicking in a browser.
- Mobile layouts were not tested.
- The test script was not rerun after a final login page formatting change. No server code changed after that run, and the client build still passed.

The test script, `e2e.js`, is not in the repo. Ask for a copy from whoever made these fixes; it is the starting point for item 5.
