# Kart & Smart System Commissioning App

Custom Progressive Web App (PWA) for tracking electric kart commissioning, component serial numbers, firmware versions, onsite setup, and BIZ Smart Systems.

## Non-negotiables
- Offline-first (full day+ offline with sync)
- Microsoft Graph only for SharePoint access (technicians never browse raw lists)
- Flexible checklist storage (field key + value) so templates can evolve
- Technician picker after shared workshop account login
- Forced changelog on firmware/settings upload

## Documentation
See `/docs` for full outline, schema, build phases, and sample templates.

## Local-first development
Build against a personal Microsoft 365 / developer tenant first, then port to company tenant later.

## Getting started

```bash
npm install
npm run dev
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values from your Entra ID / SharePoint setup:

| Variable | Where to find it |
| --- | --- |
| `VITE_CLIENT_ID` | Application (client) ID of the Entra ID app registration |
| `VITE_TENANT_ID` | Directory (tenant) ID of your Microsoft 365 tenant |
| `VITE_SITE_ID` | SharePoint site ID for the commissioning site |

These are not used yet (auth and Graph come in later steps). Keep `.env` local; only `.env.example` is committed.
