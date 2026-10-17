# Feature Contract: 15 – Task Items

## Goal
Let users add and manage TaskItems that link a Task to one or more Karts. All writes remain optimistic local Dexie updates that enqueue a sync-queue item. No authentication or real SharePoint yet. Checklist responses and template snapshotting are out of scope for this step.

## Scope (in)
- Extend the existing task detail / edit flow (or add a simple task detail screen) so a user can:
  - See the list of TaskItems for a task (kart chassis number + status)
  - Add a TaskItem by selecting a Kart (prefer karts that belong to the task’s customer, but allow any kart)
  - Edit a TaskItem’s status and notes
  - Soft-remove or mark complete via status rather than hard delete
- Fields on TaskItem:
  - taskId (required)
  - kartId (required)
  - status (simple select: e.g. New / In progress / Complete / Removed)
  - notes
- All reads and writes go through the existing Zustand dataStore (`addTaskItem` / `updateTaskItem` / etc.). Optimistic local writes only.
- Keep the UI reachable from the task list (e.g. an “Items” or “Open” action on a task that switches to a detail screen).
- Use shadcn/ui components + Tailwind.
- Do not implement checklist responses, template snapshotting onto the task or task item, or pre-fill logic.

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No hard deletes
- No ChecklistResponses UI
- No template snapshot storage
- No firmware or preferred-version logic
- No Excel import

## Acceptance criteria
- `npm run build` succeeds with no TypeScript errors
- User can open a task and add one or more TaskItems linked to karts
- User can edit a TaskItem’s status and notes
- List of items on a task shows the kart chassis number and status
- Changes survive a page reload (Dexie)
- Sync-status indicator still reflects pending count after TaskItem changes
- PR description is free of required attribution rules (none exist)

## Notes
This is Step 1.5. Keep the change focused on linking karts to tasks. The next step will add offline checklist entry that snapshots the model’s ChecklistField[] onto the task item.
