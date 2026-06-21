# Project Structure

Version: 1.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the official folder structure, module organization and dependency rules for the entire CMS.

A predictable and scalable project structure is essential for long-term maintainability, onboarding new developers and enabling enterprise-scale development.

Every new feature must follow this structure.

No feature should introduce its own architectural conventions.

---

# Architectural Principles

Feature-first organization.

Domain-driven module separation.

Clear dependency direction.

Single responsibility.

No circular dependencies.

High cohesion.

Low coupling.

Server-first architecture.

Reusable UI components.

Strict separation of concerns.

---

# Root Directory

```
/
├── .github/
├── .husky/
├── .vscode/
├── docs/
├── drizzle/
├── public/
├── scripts/
├── src/
├── tests/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── eslint.config.js
├── prettier.config.js
└── README.md
```

---

# Source Directory

```
src/
├── app/
├── actions/
├── components/
├── features/
├── services/
├── repositories/
├── db/
├── schemas/
├── hooks/
├── lib/
├── providers/
├── stores/
├── types/
├── utils/
├── constants/
├── config/
├── middleware/
└── styles/
```

---

# App Directory

```
app/

(admin)

(site)

api/ (future)

layout.tsx

page.tsx

loading.tsx

error.tsx

not-found.tsx
```

App Router is mandatory.

---

# Route Groups

```
app/

(admin)

dashboard/

products/

categories/

seo/

analytics/

settings/

media/

(site)

page.tsx
```

Admin and public website must remain completely isolated.

---

# Features Directory

Each business module lives inside its own feature.

```
features/

products/

categories/

seo/

analytics/

media/

authentication/

settings/

notifications/

backup/

audit/
```

---

# Internal Feature Structure

Every feature follows the same structure.

```
products/

components/

actions/

services/

repositories/

schemas/

hooks/

types/

constants/

utils/

validators/

tests/
```

No exceptions.

---

# Components

Global reusable UI components only.

```
components/

ui/

layout/

tables/

forms/

charts/

dialogs/

navigation/

feedback/

icons/
```

Feature-specific components never belong here.

---

# UI Components

```
ui/

button/

input/

textarea/

select/

checkbox/

switch/

badge/

tooltip/

modal/

drawer/

popover/

table/

tabs/

card/

dropdown/

pagination/

skeleton/

spinner/

```

Every component

Reusable

Typed

Accessible

Documented

---

# Services

Contains business logic only.

```
services/

ProductService.ts

SeoService.ts

MediaService.ts

AnalyticsService.ts

SettingsService.ts

BackupService.ts

AuditService.ts
```

---

# Repositories

Database access layer.

```
repositories/

ProductRepository.ts

CategoryRepository.ts

SeoRepository.ts

MediaRepository.ts

SettingsRepository.ts

AuditRepository.ts
```

Repositories never import React.

Repositories never contain UI logic.

---

# Database

```
db/

schema/

migrations/

seed/

client.ts

index.ts
```

---

# Schemas

```
schemas/

product/

category/

seo/

settings/

authentication/

media/
```

Every schema uses Zod.

---

# Hooks

Reusable React hooks only.

```
hooks/

useDebounce.ts

usePagination.ts

useRealtime.ts

useSeoScore.ts

useMediaUpload.ts

useLocalStorage.ts
```

---

# Providers

```
providers/

ThemeProvider.tsx

QueryProvider.tsx

RealtimeProvider.tsx

ToastProvider.tsx
```

---

# Stores

Reserved for global client state.

```
stores/

uiStore.ts

settingsStore.ts

```

Business data belongs to TanStack Query.

---

# Utilities

```
utils/

slug.ts

seo.ts

date.ts

image.ts

validation.ts

string.ts

number.ts

file.ts
```

Utilities must remain pure.

---

# Types

```
types/

product.ts

category.ts

seo.ts

analytics.ts

media.ts

settings.ts
```

---

# Constants

```
constants/

routes.ts

seo.ts

colors.ts

breakpoints.ts

roles.ts

limits.ts
```

---

# Config

```
config/

app.ts

seo.ts

storage.ts

security.ts

analytics.ts
```

---

# Middleware

```
middleware/

authentication.ts

authorization.ts

logging.ts

rateLimit.ts

security.ts
```

---

# Public Directory

```
public/

images/

icons/

logos/

fonts/

manifest.json

robots.txt

favicon.ico
```

---

# Scripts

```
scripts/

seed.ts

cleanup.ts

generate-sitemap.ts

optimize-images.ts

backup.ts
```

Scripts must be idempotent whenever possible.

---

# Tests

```
tests/

unit/

integration/

e2e/

fixtures/

mocks/

factories/

helpers/
```

Testing mirrors production architecture.

---

# Documentation

```
docs/

architecture/

database/

api/

deployment/

security/

testing/

decisions/

srs/
```

Architecture Decision Records (ADR) recommended.

---

# Import Rules

Allowed

Component

↓

Action

↓

Service

↓

Repository

↓

Database

Forbidden

Repository

↓

Service

↓

Component

Reverse dependencies prohibited.

---

# Naming Rules

Directories

kebab-case

Files

PascalCase (components)

camelCase (utilities)

snake_case (database)

---

# Module Boundaries

Each feature owns

Components

Schemas

Hooks

Types

Services

Repositories

Tests

Utilities

Features must not directly modify another feature.

Shared logic belongs in `/lib` or `/utils`.

---

# Shared Library

```
lib/

logger/

cache/

seo/

analytics/

storage/

security/

validation/
```

Only generic infrastructure code belongs here.

---

# Configuration Files

```
.env.local

.env.example

.env.production

.env.staging
```

Environment-specific logic must never be hardcoded.

---

# Code Ownership

Every feature should have

Responsible developer

Documentation

Tests

Migration history

Change log

Prepared for larger development teams.

---

# Scalability Rules

A new module must be added without modifying existing architecture.

Feature folders must remain independent.

No module should exceed reasonable complexity.

Large features should be internally modularized.

---

# Architecture Constraints

Maximum folder nesting

4 Levels

Preferred

3 Levels

Maximum file length

500 Lines

Preferred

300 Lines

Maximum component length

250 Lines

Preferred

150 Lines

Maximum function length

50 Lines

Preferred

30 Lines

---

# Acceptance Criteria

✓ Every feature follows the same folder structure.

✓ Clear separation between UI, business logic and data access.

✓ Repository pattern consistently applied.

✓ No circular dependencies.

✓ Features remain modular and independent.

✓ Architecture scales without structural refactoring.

✓ New developers can understand the project quickly.

✓ Structure fully compatible with enterprise SaaS development.

```