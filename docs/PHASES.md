# Build Phases

## Phase 0 – Setup & Foundation
- Entra app registration (local redirect)
- Graph permissions (Sites.ReadWrite.All, Files.ReadWrite.All)
- React + Vite PWA scaffold
- MSAL login + technician picker
- SharePoint list creation (script or manual)

**Acceptance**: Can log in, pick technician, app can read/write a test list.

## Phase 1 – Core Kart Commissioning
- Customers, KartModels (JSON templates), Karts, Tasks, TaskItems, ChecklistResponses
- Template editor (add/remove fields)
- Task creation with pre-fill from customer prefs or latest
- Offline checklist entry + sync
- Basic Excel import mapping

**Acceptance**: Create a model template, create a task, complete checklist offline, sync successfully.

## Phase 2 – Firmware, Preferences & History
- FirmwareVersions with forced changelog
- Per-customer preferred versions + global overrides
- Photo attachments
- Historical import polish

## Phase 3 – Smart Systems & Onsite
- SmartSystems, settings file upload
- Network / black-box / sector-beacon items
- Sign-off PDF
- Calendar + email notifications

## Phase 4 – Polish & Integration
- Reporting, CRM links, offline conflicts, admin locks, export
