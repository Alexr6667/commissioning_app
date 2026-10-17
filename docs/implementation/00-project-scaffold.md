# Feature Contract: 00 – Project Scaffold

## Goal
Create the initial React + Vite + TypeScript project with the agreed stack and folder structure so later steps can build on a clean foundation.

## Scope (in)
- React + Vite + TypeScript
- Tailwind CSS
- shadcn/ui initialised (button, card, input as minimum)
- PWA basics (manifest + service worker placeholder)
- Hybrid folder structure:
  - `src/features/` (empty placeholders for auth, customers, tasks, checklists)
  - `src/components/ui/`
  - `src/lib/`
  - `src/stores/`
- `.env.example` with placeholders:
  - `VITE_CLIENT_ID`
  - `VITE_TENANT_ID`
  - `VITE_SITE_ID`
- Basic README section explaining how to fill the env vars
- App runs with `npm run dev` and shows a simple placeholder home page

## Scope (out)
- No MSAL / authentication yet
- No Dexie / offline database yet
- No real SharePoint calls
- No business features

## Acceptance criteria
- `npm install` and `npm run dev` succeed
- Tailwind and at least one shadcn component render
- Folder structure matches the hybrid layout above
- `.env.example` exists with the three variables
- No TypeScript errors on build

## Notes
This is Step 0.1. Keep the change as small as possible.
