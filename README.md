# Forno — Pizza Delivery Full-Stack App

A MERN pizza ordering platform: user registration with email verification, a
4-step pizza builder, Razorpay test-mode checkout, live order status, and a
separate admin side with inventory management and automated low-stock email
alerts.

- **`/server`** — Node.js + Express + MongoDB (Mongoose), JWT auth, nodemailer, node-cron, Razorpay
- **`/client`** — React (Vite), React Router, Axios

## Feature checklist coverage

**User side**
- Registration with email verification (`/server/controllers/authController.js`)
- JWT login
- Forgot/reset password via emailed link
- Dashboard listing pizza bases + live order list
- 4-step builder: base → sauce → cheese → vegetables (multi-select)
- Order summary before payment
- Razorpay checkout (test mode)
- Order status shown on the dashboard, refreshed by polling every 5s

**Admin side**
- Separate `/admin/login` — no public route creates an admin account (created via the seed script)
- Inventory dashboard: bases, sauces, cheeses, vegetables with stock counts
- Stock auto-decrements by 1 per ingredient when a payment is verified
- Manual stock updates from the admin table
- Hourly (configurable) cron job emails the admin when any item's stock falls below its threshold
- Orders panel: view every order, change its status — reflected on the user's dashboard within one poll cycle

## Local setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, EMAIL_*, RAZORPAY_*, etc. — see comments in .env.example
npm run seed   # creates the first admin account + seeds inventory (5 bases, 5 sauces, cheeses, vegetables)
npm run dev    # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env
# VITE_API_URL should point at your backend, e.g. http://localhost:5000/api
npm run dev    # starts on http://localhost:5173
```

Log in as the seeded admin at `/admin/login` using `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` from your `.env`.

### Getting test credentials
- **MongoDB**: free cluster at [mongodb.com/atlas](https://mongodb.com/atlas) — copy the connection string into `MONGO_URI`
- **Email**: easiest is a free disposable inbox at [ethereal.email](https://ethereal.email) — paste its SMTP host/user/pass into `.env`. (Or a Gmail account with a generated "App Password".)
- **Razorpay**: sign up at [razorpay.com](https://razorpay.com), grab the **test mode** Key ID/Secret from Settings → API Keys. In test mode, the checkout widget has a "Success"/"Failure" simulation built in — no real card needed.

## Deployment

**Important:** the backend uses `node-cron` for the low-stock email job and
needs a persistent, long-running Node process — that doesn't fit Vercel's
serverless functions well (they're stateless and short-lived). So:

- **Frontend → Vercel** (works great, it's a static Vite build)
- **Backend → Render** (or Railway/Fly.io) — any host that runs a normal long-lived Node server

### Deploy the backend (Render)
1. Push this repo to GitHub.
2. On [render.com](https://render.com), New → Web Service → connect the repo, set the root directory to `server`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all the variables from `.env.example` under Environment.
5. After the first deploy, open a Render Shell and run `npm run seed` once to create the admin account and inventory.
6. Copy the live backend URL (e.g. `https://forno-api.onrender.com`).

### Deploy the frontend (Vercel)
1. On [vercel.com](https://vercel.com), Add New → Project → import the same GitHub repo, set the root directory to `client`.
2. Framework preset: Vite (auto-detected).
3. Add an environment variable `VITE_API_URL` = `https://forno-api.onrender.com/api` (your Render URL + `/api`).
4. Deploy. `vercel.json` already handles SPA routing so refreshing `/dashboard` etc. won't 404.
5. Go back to Render and set `CLIENT_URL` to your new Vercel URL, so verification/reset email links point at the live site.

## Honest limitations (this is a learning build, not production)
- Real-time status uses polling, not WebSockets — simple and reliable, but not instant; fine for a demo, worth swapping for Socket.IO in a real product
- Razorpay is wired for test mode only
- No rate limiting, no refresh tokens, no CSRF protection
- Stock decrement on payment isn't done inside a DB transaction, so under heavy concurrent load two orders could both pass the "in stock" check before either decrements — acceptable for a demo, not for real inventory at scale
