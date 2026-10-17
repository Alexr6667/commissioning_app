# Feature Contract: 12 – Customers

## Goal
Let users manage Customers (create, list, edit, soft-lock) with the fields defined in SCHEMA.md. All writes remain optimistic local Dexie updates that enqueue a sync-queue item. No authentication or real SharePoint yet.

## Scope (in)
- Feature folder `src/features/customers/` containing:
  - List view of all customers (title, track name, contact, locked flag)
  - Create / edit form for a customer with fields:
    - title (required)
    - trackName
    - contact
    - siteAddress
    - notes
    - isLocked (boolean; soft-lock rather than hard delete)
    - externalId (optional, for future import)
  - Preferred firmware / CPF fields are **out of scope** for this step (Phase 2)
- All reads and writes go through the existing Zustand dataStore (`addCustomer` / `updateCustomer` / etc.). Optimistic local writes only.
- Make the customer list and create/edit reachable from the home page (extend the existing simple screen navigation).
- Seed data may be extended or left as-is; the seeded demo customer should remain usable.
- Use shadcn/ui components + Tailwind.
- Do **not** add AI or tool attribution to the PR description or commits.

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No preferred firmware or CPF preference logic
- No hard deletes
- No kart or task creation
- No Excel import

## Acceptance criteria
- `npm run build` succeeds with no TypeScript errors
- User can create a new customer with a non-empty title
- User can edit an existing customer’s title, track name, contact, site address, notes, and locked flag
- List view shows customers and their locked status
- Changes survive a page reload (Dexie)
- Sync-status indicator still reflects pending count after customer changes
- PR description contains no “Built with Cursor” or similar attribution

## Notes
This is Step 1.2. Keep the change focused on Customer management. Later steps will add Karts that reference customers and models.
