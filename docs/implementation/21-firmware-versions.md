# Feature Contract: 21 – Firmware versions

## Goal
Let users register FirmwareVersions (title, model, required changelog, optional file name, current-recommended flag) and mark one version as the current recommended version for a KartModel. All writes remain optimistic local Dexie updates that enqueue a sync-queue item. No authentication, real SharePoint, or actual file upload yet.

## Scope (in)
- Add a `FirmwareVersion` type and Dexie table (bump the DB version):
  - `title` (required, e.g. version string)
  - `modelId` (optional link to a KartModel)
  - `changelog` (required, non-empty)
  - `fileName` (optional plain-text reference — no binary upload in this step)
  - `isCurrentRecommended` (boolean)
  - `uploadedBy` (optional plain text)
  - `uploadDate` (set to now on create)
- Feature folder `src/features/firmware/` with:
  - List of firmware versions (title, model title, current-recommended badge, changelog snippet)
  - Create / edit form that requires a non-empty changelog before save
  - Action to mark a version as current recommended for its model (clears the flag on other versions for the same model, and updates `KartModel.currentRecommendedFirmware` to the version title)
- Reachable from the home page.
- All reads and writes go through the existing Zustand dataStore. Optimistic local writes only.
- Use shadcn/ui + Tailwind.
- Do not implement binary file upload, Graph, or real sync.

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No binary firmware or CPF file upload
- No automatic “latest” catalog resolution beyond the manual current-recommended flag
- No Excel import of firmware versions

## Acceptance criteria
- `npm run build` succeeds with no TypeScript errors
- User cannot save a firmware version without a non-empty changelog
- User can create and edit a firmware version linked to a model
- Marking a version current recommended updates the model’s `currentRecommendedFirmware` and clears the flag on sibling versions
- Values survive a page reload
- Sync-status indicator reflects pending count after firmware writes
- PR description is free of required attribution rules (none exist)

## Notes
This is Step 2.1. File upload and SharePoint document library storage come later. Customer preferred firmware (Step 1.7) stays a free-text field for now; linking it to a FirmwareVersion is a later step.
