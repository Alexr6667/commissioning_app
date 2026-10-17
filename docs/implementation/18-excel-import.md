# Feature Contract: 18 – Basic Excel import

## Goal
Let users import a simple Excel (`.xlsx`) file that maps rows to Customers and/or Karts and writes them optimistically into the local Dexie store. No authentication or real SharePoint yet. This is a basic mapping import, not a full historical migration.

## Scope (in)
- A simple import screen reachable from the home page.
- Accept a single `.xlsx` file (use a lightweight client-side library such as SheetJS / `xlsx`).
- Support two sheet types (or one sheet with a type column — either is acceptable):
  - **Customers**: columns `Title` (required), `TrackName`, `Contact`, `SiteAddress`, `Notes`, `PreferredControllerFirmware`, `PreferredControllerCpfFile`, `ExternalId`
  - **Karts**: columns `ChassisNumber` (required), `ModelTitle` (looked up against existing KartModels by title, case-insensitive), `CustomerTitle` (looked up against existing or just-imported Customers by title, case-insensitive), `Status`, `Notes`, `LatestKnownFirmware`
- Preview the parsed rows before import (show count and any validation errors).
- On confirm, create records through the existing Zustand dataStore (`addCustomer` / `addKart`). Skip or report rows that fail validation (missing required field, duplicate chassis number, unknown model/customer).
- Use shadcn/ui + Tailwind.
- Do not implement tasks, checklist responses, firmware file upload, or real sync.

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No `.xls` (legacy) or CSV in this step (`.xlsx` only)
- No Task or ChecklistResponse import
- No update-in-place of existing records (create only; report duplicates)
- No Excel export

## Acceptance criteria
- `npm run build` succeeds with no TypeScript errors
- User can select an `.xlsx` file and see a preview of customers and/or karts
- Valid rows are created in the local store and survive a reload
- Invalid or duplicate rows are reported and not silently dropped without feedback
- Sync-status indicator reflects pending count after a successful import
- PR description is free of required attribution rules (none exist)

## Notes
This is Step 1.8. Keep the mapping simple and local. Full historical import polish belongs in Phase 2.
