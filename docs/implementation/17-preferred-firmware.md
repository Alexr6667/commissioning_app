# Feature Contract: 17 – Preferred firmware

## Goal
Store a simple preferred controller firmware (and optional CPF reference) on each Customer, and surface it when creating or viewing a Task so the technician can see the target version. All writes remain optimistic local Dexie updates that enqueue a sync-queue item. No authentication, real SharePoint, or firmware file uploads yet.

## Scope (in)
- Extend the Customer type (and form) with:
  - `preferredControllerFirmware?: string` (plain text, e.g. a version string; blank means “latest”)
  - `preferredControllerCpfFile?: string` (plain text reference; optional)
- Show these fields on the customer create/edit form and in the customer list (or detail) when set.
- On the Task create/edit form and on the task detail screen, when a customer is selected:
  - Display the customer’s preferred firmware (or “latest” if blank)
  - Display the CPF reference if set
  - Allow an optional `targetFirmwareOverrides` plain-text (or simple JSON string) field on the Task so the user can override the preference for this task only
- All reads and writes go through the existing Zustand dataStore. Optimistic local writes only.
- Use shadcn/ui components + Tailwind.
- Do not implement firmware file upload, changelog forcing, version history lists, or real sync.

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No firmware file or CPF file uploads
- No FirmwareVersions list or forced changelog
- No automatic “latest” resolution against a version catalog
- No Excel import

## Acceptance criteria
- `npm run build` succeeds with no TypeScript errors
- User can set preferred firmware and CPF reference on a customer
- Values survive a page reload
- When creating or viewing a task for that customer, the preferred firmware (or “latest”) is visible
- User can set a task-level override; it is stored and shown on the task
- Sync-status indicator still reflects pending count after these writes
- PR description is free of required attribution rules (none exist)

## Notes
This is Step 1.7. Keep it to basic preference storage and display. Full firmware version management (uploads, changelog, “latest” catalog) belongs in Phase 2.
