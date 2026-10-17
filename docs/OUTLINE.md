# Project Outline

## What we are building
A custom PWA that replaces Excel commissioning sheets for electric karts and BIZ Smart Systems. Tracks serial numbers, firmware/CPF, checklists, onsite setup, customer preferences, and history. Offline for a full day+. Installable on mobile/desktop. Auth via Microsoft 365.

## Tech stack
- Frontend: React + TypeScript + Vite (PWA)
- UI: Tailwind / shadcn/ui
- Offline: Service Worker + IndexedDB (Dexie.js)
- Auth: MSAL.js (Entra ID)
- Data: SharePoint Lists via Microsoft Graph
- Files: SharePoint Document Libraries
- Hosting: Azure Static Web Apps + custom domain
- Notifications: Microsoft Graph (calendar + email)

## Costs
Near-zero ongoing (free Azure tier + existing M365). No per-user app licences.

## Architecture & security
- Auth only via your Entra ID tenant
- SharePoint site locked to admins; app uses Graph permissions
- Offline data in IndexedDB

See SCHEMA.md and PHASES.md for details.
