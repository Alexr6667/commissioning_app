# Feature Contract: 13 – Karts

## Goal
Let users manage Karts (create, list, edit) linked to a Kart Model and a Customer. All writes remain optimistic local Dexie updates that enqueue a sync-queue item. No authentication or real SharePoint yet.

## Scope (in)
- Feature folder `src/features/karts/` containing:
  - List view of all karts showing:
    - chassisNumber
    - model title (looked up from KartModels)
    - customer title (looked up from Customers)
    - status
  - Create / edit form with fields:
    - chassisNumber (required, unique among karts)
    - modelId (select from active KartModels)
    - customerId (select from Customers)
    - status (simple text or short select: e.g. New / In progress / Complete / Archived)
    - notes
    - latestKnownFirmware
  - Soft-archive via status rather than hard delete
- All reads and writes go through the existing Zustand dataStore (`addKart` / `updateKart` / etc.). Optimistic local writes only.
- Make the kart list and create/edit reachable from the home page (extend the existing simple screen navigation).
- Use shadcn/ui components + Tailwind.
- Do not implement task creation, checklist completion, or firmware file handling.

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No hard deletes
- No task or checklist UI
- No component serial tracking
- No Excel import

## Acceptance criteria
- `npm run build` succeeds with no TypeScript errors
- User can create a new kart with a non-empty unique chassis number
- User can edit an existing kart’s chassis number, model, customer, status, notes, and latest known firmware
- List view shows chassis number, model name, customer name, and status
- Duplicate chassis numbers are rejected
- Changes survive a page reload (Dexie)
- Sync-status indicator still reflects pending count after kart changes
- PR description is free of required attribution rules (none exist)

## Notes
This is Step 1.3. Keep the change focused on Kart management. Later steps will add Tasks that reference karts.
