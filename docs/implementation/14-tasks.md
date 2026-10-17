# Feature Contract: 14 – Tasks

## Goal
Let users manage Tasks (create, list, edit) linked to a Customer. All writes remain optimistic local Dexie updates that enqueue a sync-queue item. No authentication or real SharePoint yet. TaskItems and checklist completion are out of scope for this step.

## Scope (in)
- Feature folder `src/features/tasks/` containing:
  - List view of all tasks showing:
    - title
    - type (EndOfLine / Onsite / CustomerVisit)
    - customer title (looked up from Customers)
    - status
    - assignee (if set)
  - Create / edit form with fields:
    - title (required)
    - type (select: EndOfLine | Onsite | CustomerVisit)
    - customerId (select from Customers)
    - assignee (plain text for now — technician picker is deferred)
    - status (simple select: e.g. New / In progress / Complete / Cancelled)
    - dates (plain text or date input; keep simple)
    - overallNotes
  - Soft-cancel via status rather than hard delete
- All reads and writes go through the existing Zustand dataStore (`addTask` / `updateTask` / etc.). Optimistic local writes only.
- Make the task list and create/edit reachable from the home page (extend the existing simple screen navigation).
- Use shadcn/ui components + Tailwind.
- Do not implement TaskItems, checklist responses, template snapshotting, or pre-fill from customer preferences.

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No hard deletes
- No TaskItems or checklist UI
- No firmware overrides or preferred-version logic
- No Excel import

## Acceptance criteria
- `npm run build` succeeds with no TypeScript errors
- User can create a new task with a non-empty title
- User can edit an existing task’s title, type, customer, assignee, status, dates, and notes
- List view shows title, type, customer name, status, and assignee
- Changes survive a page reload (Dexie)
- Sync-status indicator still reflects pending count after task changes
- PR description is free of required attribution rules (none exist)

## Notes
This is Step 1.4. Keep the change focused on Task management. Later steps will add TaskItems (linking karts) and offline checklist entry that snapshots the model template.
