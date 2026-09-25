# BytePath Production Release Checklist

Use this runbook before pushing to GitHub and deploying. Do not deploy while a required item is unchecked.

## Current release status

Verified in this workspace:

- Frontend production build passes with `npm run build`.
- Backend Maven packaging passes with `mvn -DskipTests package`.
- PostgreSQL and Flyway migrations `V1` through `V4` validate against the configured database.
- GitHub Actions checks both the backend Maven build and frontend Vite build.

Important limitation: academic profile data, attendance, deadlines, expenses, focus history, simulated grades, and advisor history are currently stored in browser `localStorage`. They are not synchronized across devices and can be lost if site storage is cleared. Authentication, protected resources, advisor requests, payments, and storage use the backend API.

## Before pushing to GitHub

### Secrets and generated files

- [ ] Never commit `backend/.env`, `frontend/.env`, `.env.production`, or credential files.
- [ ] Run `git ls-files` and confirm no real `.env`, `.pem`, `.key`, or backup file is tracked.
- [ ] Confirm `backend/target/`, `frontend/dist/`, and `node_modules/` are ignored.
- [ ] Rotate database, SMTP, Supabase, Razorpay, OAuth, and JWT credentials exposed in screenshots, logs, or chats.
- [ ] Generate a new production JWT secret and unique production admin password.
- [ ] Do not commit customer data or database backups.

### Local verification

From the repository root, run:

`cd frontend && npm ci && npm run build`

`cd ../backend && mvn test && mvn -DskipTests package`

`cd .. && git diff --check && git status --short && git diff --stat`

Review the file list manually. Do not blindly run `git add -A` because this workspace may already contain staged changes.

## Recommended GitHub push sequence

Inspect the branch and remote first:

`git branch --show-current && git remote -v && git status --short`

For a new repository:

`git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git`

Create a release branch and stage only the intended project files:

`git switch -c production-ready`

`git add README.md START.bat .github/workflows backend frontend docs`

`git status --short && git diff --cached --check`

`git commit -m "Prepare BytePath for production deployment"`

`git push -u origin production-ready`

Open a pull request into `main`. Merge only after both CI jobs pass and environment files are absent. If intentionally pushing directly to `main`, use `git push -u origin main`. Never force-push `main` for this release.

## Production environment variables

Set these as encrypted hosting-provider variables. Do not upload `.env`.

### Backend

Required values include:

- `PORT=8081`
- `FRONTEND_URL=https://app.example.com`
- `CORS_ALLOWED_ORIGINS=https://byte.college,https://www.byte.college`
- `DB_URL=jdbc:postgresql://HOST:5432/DATABASE?sslmode=require`
- `DB_USERNAME`, `DB_PASSWORD`, `DB_DRIVER=org.postgresql.Driver`
- `DDL_AUTO=validate`, `FLYWAY_ENABLED=true`
- A new random `JWT_SECRET` and `JWT_EXPIRATION_MS=900000`
- A unique `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`
- `REQUIRE_EMAIL_VERIFICATION=true` after SMTP is configured
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, and verified `MAIL_FROM`
- `SUPABASE_URL`, server-only `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_BUCKET_NAME`
- Live-mode `RAZORPAY_KEY_ID`, server-only `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`
- Optional OAuth/RAG/Tesseract variables when those features are enabled

The current code uses Supabase Storage. Do not configure Cloudflare R2 variables unless the storage implementation is changed to R2.

### Frontend

Set these at build time:

- `VITE_AUTH_API_URL=https://api.example.com/api`
- `VITE_RAZORPAY_KEY_ID=rzp_live_...`
- Optional `VITE_GOOGLE_CLIENT_ID`

Only `VITE_*` values are exposed to browser JavaScript. Never put database passwords, JWT secrets, SMTP passwords, Supabase service-role keys, Razorpay secrets, or private OAuth secrets in frontend variables.

## Deployment order

1. Create the production PostgreSQL database and confirm SSL connectivity.
2. Deploy the backend with encrypted environment variables.
3. Confirm startup logs show successful Flyway validation and the API is listening.
4. Set `CORS_ALLOWED_ORIGINS` to the exact frontend origin(s), comma-separated and with no trailing slash. For the current site use `https://byte.college,https://www.byte.college`, then redeploy the backend.
5. Configure the private Supabase bucket and service-role key.
6. Configure SMTP and verify the `MAIL_FROM` domain.
7. Configure Razorpay Live Mode and webhook URL: `https://api.example.com/api/payments/razorpay/webhook`.
8. Deploy the frontend with the production API URL and public Razorpay key.
9. Configure DNS and HTTPS for `app.example.com` and `api.example.com`.
10. Run the smoke tests below.

## Railway monorepo configuration

Create two Railway services from the same GitHub repository. Railway’s monorepo deployment requires a separate root directory for each isolated app. Use `/backend` for the API service and `/frontend` for the web service. [Railway monorepo documentation](https://docs.railway.com/deployments/monorepo)

### Backend service

- Root Directory: `/backend`
- Build Command: `mvn -B package -DskipTests`
- Start Command: `java -jar target/bytepath-backend-1.0.0.jar`
- Watch Path: `/backend/**`
- Add all backend production variables from the section above.
- Railway supplies `PORT`; the Spring application already reads it.

### Frontend service

- Root Directory: `/frontend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`
- Watch Path: `/frontend/**`
- Set `VITE_AUTH_API_URL` before deploying because Vite embeds `VITE_*` values into the build.

After Railway generates public domains, set `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` to the frontend domain, then redeploy the backend. Set the frontend’s `VITE_AUTH_API_URL` to the backend domain plus `/api`, then redeploy the frontend. Railway’s frontend environment variables must be set before the build. [Railway frontend environment variables](https://docs.railway.com/guides/frontend-environment-variables)

### Vercel frontend alternative

Vercel is recommended for the frontend in this deployment plan. Create a Vercel Project from the same GitHub repository and set:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`
- Production variable: `VITE_AUTH_API_URL=https://api.example.com/api`
- Production variable: `VITE_RAZORPAY_KEY_ID=rzp_live_...`

Deploy the Railway backend first, copy its HTTPS URL, set `VITE_AUTH_API_URL` in Vercel, and redeploy. Then set the Vercel production domain as the backend `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` value. Vercel supports multiple projects connected to different directories in one repository; its monorepo setup is documented [here](https://vercel.com/docs/monorepos).

## Production smoke tests

### Authentication

- [ ] Frontend loads over HTTPS without mixed-content errors.
- [ ] New registration succeeds and first-time setup asks for semester and branch.
- [ ] Invalid credentials are rejected; valid login succeeds.
- [ ] Logout clears the session; refresh restores a valid session.
- [ ] Expired tokens refresh or return the user to login.
- [ ] If email verification is enabled, email arrives and unverified login is rejected.
- [ ] Google/GitHub login is fully configured and tested, or disabled.

### Student features

- [ ] Dashboard loads for a new account.
- [ ] Two accounts do not share CGPA or target values.
- [ ] SGPA, attendance, target estimator, and grade simulator work.
- [ ] Syllabus, deadlines, expenses, focus, and advisor flows work.
- [ ] The localStorage persistence limitation is acceptable for launch.

### Admin, resources, and payments

- [ ] Students cannot upload or delete admin resources.
- [ ] Admin can initialize, upload, and complete a resource upload.
- [ ] Supabase bucket is private and protected resource access requires JWT.
- [ ] Unauthorized users cannot open protected PDFs.
- [ ] Razorpay order creation works in test mode before Live Mode.
- [ ] Payment and webhook signature verification work.
- [ ] Duplicate payment events are safe.
- [ ] End-sem access is not granted before successful verification.

## Operational safeguards

- [ ] Enable database backups and test a restore path.
- [ ] Configure uptime monitoring and provider billing alerts.
- [ ] Keep logs free of passwords, tokens, payment secrets, and service-role keys.
- [ ] Protect or disable public Swagger if the API documentation should not be public.
- [ ] Use short-lived signed URLs for private resources.
- [ ] Record the deployed Git commit SHA and release date.
- [ ] Keep the previous frontend artifact and backend image/JAR for rollback.

## Rollback

For a frontend failure, redeploy the previous frontend artifact. For a backend failure, roll back to the previous image/JAR and review Flyway history before touching the database. Never manually edit production tables as a rollback strategy; restore only from a verified backup under an explicit recovery plan.

## Final go/no-go rule

Ship only when CI is green, no secret is tracked, production variables are configured, migrations validate, HTTPS/CORS are correct, and authentication, protected-resource, email, and payment smoke tests pass.
