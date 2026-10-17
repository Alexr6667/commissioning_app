# Agent Brief – Phase 0

Read README.md, docs/OUTLINE.md, docs/SCHEMA.md and docs/PHASES.md first.

Goal: Local React + Vite PWA that logs in via MSAL against a personal/developer Entra tenant and can read/write a SharePoint list.

Constraints:
- Offline-first architecture from the start (even if sync is basic)
- Technician picker after login
- Use Microsoft Graph only
- Do not hard-code company tenant details

Deliverables:
- Working login
- Technician picker screen
- Proof of Graph list read/write
- Clear README section on required env vars (CLIENT_ID, TENANT_ID, SITE_ID)
