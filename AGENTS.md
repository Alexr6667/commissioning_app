# Commissioning App — Agent Instructions

## Purpose

Follow these rules for all repository work. Implement the smallest approved change that satisfies the task. Do not widen scope into unrelated cleanup, future features, speculative abstractions, or unapproved redesigns.

## Source of truth (highest to lowest)

1. Approved feature contract in `docs/implementation/<feature-name>.md`
2. Permanent docs in `/docs` (OUTLINE.md, SCHEMA.md, PHASES.md, locked decisions)
3. Current task prompt
4. Agent judgement

A lower source must not override a higher one. If implementation reality conflicts with an approved contract, stop and report.

## Feature contract workflow

Meaningful work uses a named contract at `docs/implementation/<feature-name>.md`.

Process:
1. Contract is written and opened as a PR.
2. Human reviews and merges the contract.
3. Only then is an implementation prompt given to Cursor.
4. Cursor implements exactly the approved contract on a feature branch and opens a PR.

Treat the contract as read-only during implementation unless the task explicitly allows edits.

## Work classification

- **Small/local**: Trivial, low-risk changes.
- **Normal feature**: Uses an approved feature contract and feature branch.
- **Schema or architecture**: Requires explicit approval before implementation.

Stop and report if the work requires an unapproved material change to product behaviour, architecture, data model, or security.

## Code conventions

- Hybrid folder structure: feature folders + shared `components/ui` (shadcn) and `lib`.
- UI: shadcn/ui + Tailwind.
- State: Zustand.
- Offline: Dexie.js with opportunistic + manual sync.
- Config: Vite environment variables (`.env`).
- Graph access: direct from client behind a clean `sharepointService`.
- Templates: full snapshot stored on each task.
- Auth: hybrid (technician picker only for the shared workshop account).

## Git rules

- Do not add AI or tool attribution to commits or PRs.
- For implementation work: feature branch → implement approved contract → PR.
- Do not merge your own implementation PRs.

## Completion evidence

When finishing a task, report:
- Branch and main files changed
- What was implemented vs the contract
- Any deviations or remaining risks
- Commands run (if any)

## Final rule

If unsure whether a decision is local implementation judgement or a material product/architecture decision, stop and report.
