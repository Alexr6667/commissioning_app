# Feature Contract: 03 – Offline Foundation

## Goal
Establish the offline-first data layer (Dexie.js + Zustand) and a clear sync-status indicator so later features can read/write locally with optimistic updates. No real authentication or SharePoint yet.

## Scope (in)
- Install Dexie.js
- Define a Dexie database in `src/lib/db.ts` (or similar) with tables for the Phase 1 entities:
  - `customers`
  - `kartModels`
  - `karts`
  - `tasks`
  - `taskItems`
  - `checklistResponses`
  - `syncQueue` (simple queue of pending operations)
- Basic TypeScript types for the above (can live next to the DB or in `src/lib/types.ts`)
- Zustand store(s) that:
  - Expose simple CRUD helpers that write to Dexie immediately (optimistic)
  - Track sync status (`idle` | `syncing` | `error` | `offline`) and pending count
- A small persistent sync-status indicator in the UI (e.g. badge or banner) showing pending items and current status
- Seed the database with 1–2 sample records on first load so the UI can be tested
- All data access goes through the Dexie/Zustand layer (no direct component-level IndexedDB calls)
- Do **not** add AI or tool attribution to the PR description or commits

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No actual sync implementation (the queue and status can be mocked)
- No business UI beyond what is needed to demonstrate the status indicator and maybe list the sample data

## Acceptance criteria
- App starts and Dexie database is created
- Sample data is visible (or can be queried)
- Creating/updating a record via the store writes to IndexedDB immediately
- Sync-status indicator is visible and reflects pending count / status
- No TypeScript errors on build
- PR description contains no “Built with Cursor” or similar attribution

## Notes
This is Step 0.3. Keep the change focused on the data layer and status UI. Later steps will build real features on top of this foundation.
