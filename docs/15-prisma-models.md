# Prisma Models Specification

Version: 1.0

Status: Approved

---

# Purpose

This document defines the Prisma ORM implementation standards for the Headless SEO CMS Platform.

It complements the Database Schema documents and specifies how database entities must be represented in Prisma.

This document is not intended to duplicate the database schema. Instead, it establishes conventions, patterns, and implementation rules for all Prisma models.

---

# General Principles

- All models must use UUID primary keys.
- All table names must be mapped using @@map().
- All column names must be mapped using @map().
- Every mutable model must contain createdAt and updatedAt.
- Soft deletable models must contain deletedAt.
- Relations must always be explicit.
- Avoid implicit many-to-many relations.
- Prefer explicit join tables for extensibility.
- Never expose database models directly to the frontend.

---

# Naming Conventions

Prisma Model

PascalCase

Example

Product

Category

SeoProfile

MediaAsset

HistoryEntry

---

Database Table

snake_case

Example

products

categories

seo_profiles

history_entries

---

Prisma Fields

camelCase

Example

createdAt

updatedAt

metaTitle

storagePath

---

Database Fields

snake_case

Example

created_at

updated_at

meta_title

storage_path

---

# Base Entity Pattern

Every mutable model must include:

id

createdAt

updatedAt

Optional:

deletedAt

---

Example

model Product {

id String @id @default(uuid())

createdAt DateTime @default(now()) @map("created_at")

updatedAt DateTime @updatedAt @map("updated_at")

deletedAt DateTime? @map("deleted_at")

@@map("products")

}

---

# UUID Strategy

Always use

String

UUID

Never Int IDs.

Never CUID.

Never auto increment.

---

# Relations

Relations must always define:

fields

references

onDelete

onUpdate

Example

category Category @relation(
fields: [categoryId],
references: [id],
onDelete: Restrict,
onUpdate: Cascade
)

---

# Cascade Rules

Preferred

Restrict

or

SetNull

Avoid Cascade deletes except for join tables.

---

# Indexes

Always define indexes in Prisma.

Examples

@@index([slug])

@@index([categoryId])

@@index([status])

@@index([createdAt])

Composite indexes

@@index([status, createdAt])

---

# Unique Constraints

Examples

@@unique([slug, language])

@@unique([ownerType, ownerId])

---

# Enumerations

All business enums must be represented as Prisma enums.

Examples

Language

ProductStatus

StockStatus

RedirectType

SchemaType

SeoOwnerType

MediaType

---

# JSON Fields

Use Json type only where appropriate.

Allowed

Structured Data

Settings

History Diff

Custom Head Tags

Forbidden

Names

Descriptions

Core business data

Relationships

---

# Decimal Strategy

Prices

Decimal

Never Float.

Example

price Decimal @db.Decimal(12,2)

---

# Date Strategy

All timestamps use UTC.

Timezone conversion handled by frontend.

---

# Soft Delete Strategy

Soft deletable models:

Product

Category

MediaAsset

SeoProfile

Brand

Page

Settings

Deleted entities remain queryable for audit purposes.

---

# Transactions

Multiple related operations must use Prisma transactions.

Example

Create Product

↓

Create Translation

↓

Create SEO Profile

↓

Create History

↓

Commit

Rollback on failure.

---

# Repository Pattern

Prisma Client must never be used directly inside UI components.

Architecture

Server Action

↓

Service

↓

Repository

↓

Prisma

↓

Database

---

# Query Rules

Prefer

select

instead of

include

when full relations are unnecessary.

Avoid N+1 queries.

Use pagination for collections.

Use transactions for bulk updates.

---

# Pagination

Always cursor-based when possible.

Fallback

Offset pagination

for administration tables.

---

# Validation

Prisma validation does not replace application validation.

Use Zod for request validation.

Database constraints remain mandatory.

---

# Migrations

Use Prisma Migrate only.

Never edit generated migrations manually.

Every migration must be reviewed before execution.

---

# Seeding

Seed files must create:

Default settings

Administrator account

SEO defaults

Languages

Demo categories

Demo products

---

# Error Handling

All Prisma errors must be mapped to domain-specific errors.

Never expose raw database errors to the frontend.

---

# Performance Guidelines

Prefer batching.

Use transactions.

Avoid unnecessary joins.

Use indexes defined in schema.

Never fetch unused columns.

---

# Logging

Every write operation must generate:

History entry

Application log

Optional analytics event

---

# Future Compatibility

The model layer must support:

Multi-tenant

Plugins

API Keys

Public API

GraphQL

Background Workers

Without breaking existing models.