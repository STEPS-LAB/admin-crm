# Architecture Decision Record: Drizzle ORM over Prisma

## Status

Accepted

## Date

2026-06-19

## Context

The SRS documents contain conflicting guidance on the ORM layer. `docs/03`, `docs/08`, and `docs/15` reference Prisma, while `docs/36`, `docs/37`, `docs/40`, and `CLAUDE.md` mandate Drizzle ORM.

## Decision

We adopt **Drizzle ORM** as the sole data access layer for this project.

## Rationale

- `docs/40-master-architecture.md` is the highest-priority architecture document and explicitly requires Drizzle.
- Drizzle provides SQL-first control, lighter runtime footprint, and excellent TypeScript inference for a layered repository architecture.
- `docs/15-prisma-models.md` remains authoritative for the **data model** (fields, relations, indexes, enums) — implemented in Drizzle schema modules under `src/db/schema/`.

## Consequences

- All repositories use Drizzle via `src/db/client.ts`.
- Migrations are generated with `drizzle-kit` into `/drizzle`.
- Prisma references in legacy SRS sections are superseded for implementation purposes.
