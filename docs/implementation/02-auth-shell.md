# Feature Contract: 02 – Auth Shell

## Goal
Add Microsoft authentication (MSAL) with hybrid login behaviour and a technician picker, using placeholder config so it works before real credentials are available.

## Scope (in)
- Install and configure `@azure/msal-browser` and `@azure/msal-react`
- Read `VITE_CLIENT_ID` and `VITE_TENANT_ID` from environment variables (graceful fallback / clear message if missing)
- Login screen with a “Sign in with Microsoft” button
- After successful login:
  - If the account is the shared workshop account (detect by a configurable email or UPN, e.g. via `VITE_WORKSHOP_ACCOUNT`), show a technician picker
  - Otherwise treat the signed-in user as the technician (no picker)
- Simple protected route: unauthenticated users see the login screen; authenticated users see a placeholder “You are signed in as …” page
- Basic logout
- Store the selected technician name in memory (Zustand is fine) for later use
- Do **not** add AI or tool attribution to the PR description or commits

## Scope (out)
- No real Graph / SharePoint calls
- No Dexie / offline database yet
- No technician list from SharePoint (hard-code 2–3 sample names for the picker is acceptable)
- No calendar or email

## Acceptance criteria
- App starts and shows login screen when not authenticated
- MSAL is wired and attempts login (will fail gracefully without real Client ID / Tenant ID)
- When a workshop account is simulated or detected, technician picker appears
- Individual account path skips the picker
- Logout returns to login screen
- No TypeScript errors
- PR description contains no “Built with Cursor” or similar attribution

## Notes
This is Step 0.2. Keep changes small and behind the existing folder structure (`src/features/auth`).
