# Feature Contract: 16 – Checklist entry

## Goal
Let users complete a checklist for a TaskItem offline. When a TaskItem is created, snapshot the linked KartModel’s `checklistTemplate` onto the TaskItem so later model edits do not change in-progress work. All writes remain optimistic local Dexie updates that enqueue a sync-queue item. No authentication or real SharePoint yet.

## Scope (in)
- Add an optional `checklistTemplateSnapshot?: ChecklistField[]` field to the TaskItem type (and Dexie table — bump the DB version if required).
- When adding a TaskItem, if the selected Kart has a model with a `checklistTemplate`, copy that array onto `checklistTemplateSnapshot`.
- From the task detail screen, let the user open a checklist for a TaskItem that:
  - Renders fields from `checklistTemplateSnapshot` (not from the live KartModel)
  - Supports the existing field types: text, checkbox, number, select, textarea
  - Groups by `section` when present
  - Loads and saves values via `ChecklistResponse` records (fieldKey + value) through the existing dataStore
  - Shows required fields clearly; prevent leaving required fields empty on save (or show a clear warning — either is acceptable)
- Technician is a plain text field or omitted for now (auth/technician picker is deferred). Timestamp can be set to now on write.
- All reads and writes go through the existing Zustand dataStore. Optimistic local writes only.
- Use shadcn/ui components + Tailwind.
- Do not implement attachments, photos, firmware overrides, or real sync.

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No photo or file attachments
- No preferred-firmware or target-override logic
- No Excel import
- No hard deletes of responses

## Acceptance criteria
- `npm run build` succeeds with no TypeScript errors
- Creating a TaskItem for a kart whose model has a template stores a snapshot on the TaskItem
- Editing the live KartModel template afterwards does not change the snapshot on existing TaskItems
- User can open a TaskItem checklist, enter values for each field type, and save
- Saved values survive a page reload (Dexie)
- Sync-status indicator still reflects pending count after checklist writes
- PR description is free of required attribution rules (none exist)

## Notes
This is Step 1.6. Keep the change focused on snapshotting the template and offline checklist entry. Real SharePoint sync and technician identity come later.
