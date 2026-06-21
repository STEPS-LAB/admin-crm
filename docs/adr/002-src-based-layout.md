# Architecture Decision Record: src/-Based Project Layout

## Status

Accepted

## Date

2026-06-19

## Context

`docs/05-folder-structure.md` describes a root-level layout without `src/`, while `docs/37-project-structure.md` defines a `src/`-based feature-first structure with dedicated layers for actions, services, repositories, and database code.

## Decision

We adopt the **`src/`-based layout** defined in `docs/37-project-structure.md`, with a root-level `/drizzle` folder for migration artifacts.

## Rationale

- `docs/37` is the critical, feature-first structure document aligned with enterprise maintainability goals.
- Separating application code under `src/` keeps configuration, documentation, and tooling at the repository root.
- The layered architecture (Presentation → Server Actions → Services → Repositories → Database) maps cleanly to `src/app`, `src/actions`, `src/services`, `src/repositories`, and `src/db`.

## Consequences

- All application code lives under `src/`.
- Path alias `@/*` resolves to `./src/*`.
- Root-level layout in `docs/05` is superseded for implementation.
