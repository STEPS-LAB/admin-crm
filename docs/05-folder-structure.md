# Folder Structure

Version: 1.0

Status: Approved

---

# Purpose

This document defines the mandatory folder structure of the project.

The structure is optimized for:

- scalability
- maintainability
- feature isolation
- team development
- long-term evolution

Cursor MUST follow this structure.

Creating arbitrary folders is forbidden.

---

# Root Structure

/
├── app/
├── features/
├── shared/
├── core/
├── lib/
├── prisma/
├── public/
├── styles/
├── docs/
├── scripts/
├── types/
├── config/
├── constants/
├── middleware.ts
├── next.config.ts
├── package.json
└── tsconfig.json

---

# Root Folder Responsibilities

app/
Routing only.

features/
Business domains.

shared/
Reusable UI and utilities.

core/
Application-wide services.

lib/
Framework integrations.

config/
Configuration.

constants/
Static constants.

types/
Global types.

docs/
Architecture documentation.

scripts/
Development utilities.

---

# app/

The App Router must stay thin.

app/

├── (public)/
│
├── (admin)/
│
├── api/
│
├── globals.css
│
├── layout.tsx
│
└── not-found.tsx

Business logic is NOT allowed inside app/.

Pages only compose feature modules.

---

# Public Route Group

(public)

Contains:

Homepage

Future landing pages

Robots

Sitemap

Manifest

SEO files

Example

(public)

page.tsx

layout.tsx

loading.tsx

error.tsx

---

# Admin Route Group

(admin)

dashboard

products

categories

pages

seo

settings

login

Every route loads its feature.

Never place feature logic directly inside routes.

---

# Feature Folder

Every feature follows exactly the same structure.

Example

features/

products/

components/

server-actions/

services/

repositories/

schemas/

hooks/

types/

utils/

constants/

validators/

mappers/

queries/

mutations/

Each feature owns everything related to itself.

---

# Components

Contains ONLY Product components.

Example

ProductTable

ProductForm

ProductCard

ProductImages

ProductSEOCard

ProductTabs

ProductSidebar

ProductDeleteDialog

No Category components.

No SEO components.

---

# Server Actions

Every mutation lives here.

Example

createProduct.ts

updateProduct.ts

deleteProduct.ts

duplicateProduct.ts

restoreProduct.ts

generateSlug.ts

generateSEO.ts

No business logic.

Server Actions only coordinate services.

---

# Services

Contains business logic.

Examples

ProductService

InventoryService

SlugService

SEOGenerator

HistoryService

Services never render UI.

Services never access React.

---

# Repositories

Responsible for persistence.

Examples

ProductRepository

CategoryRepository

SettingsRepository

HistoryRepository

Repositories interact with Prisma only.

---

# Schemas

Contains Zod schemas.

Examples

CreateProductSchema

UpdateProductSchema

ImportProductsSchema

SEOUpdateSchema

Validation is centralized.

---

# Validators

Business validation.

Examples

UniqueSlugValidator

SKUValidator

CategoryValidator

CanonicalValidator

---

# Queries

Read operations.

Examples

getProducts

getProduct

getCategories

getSEOScore

Prefer server-side queries.

---

# Mutations

Business mutations.

Examples

publishProduct

updateSEO

moveCategory

restoreVersion

---

# Hooks

Only feature-specific hooks.

Example

useProductFilters

useBulkSelection

Never place global hooks here.

---

# Types

Only Product types.

Never place shared types.

---

# Constants

Only Product constants.

---

# Utils

Small helper functions.

Never place business logic.

---

# Shared Folder

shared/

components/

icons/

hooks/

providers/

layouts/

table/

form/

typography/

feedback/

navigation/

utils/

Only reusable code.

Never Product-specific.

---

# Shared Components

Examples

Button

Input

Textarea

Dialog

Drawer

Badge

Avatar

Spinner

Loader

Toast

Pagination

SearchInput

DataTable

Card

Section

Container

PageHeader

StatCard

EmptyState

Skeleton

ErrorState

---

# Shared Hooks

Examples

useDebounce

useMediaQuery

useMounted

usePagination

useLocalStorage

Generic only.

---

# Shared Utilities

Examples

cn()

formatDate()

formatCurrency()

slugify()

sanitizeHtml()

generateId()

---

# Core Folder

core/

auth/

seo/

database/

logger/

storage/

security/

cache/

events/

Core contains application infrastructure.

---

# Core/Auth

Authentication

Session

Permissions

Middleware

Cookie management

---

# Core/SEO

Shared SEO engine.

Contains

Score Engine

Rules Engine

Metadata Generator

Schema Generator

Canonical Generator

Slug Generator

Template Engine

Robots Engine

This is the heart of SEO.

---

# Core/Database

Prisma Client

Database initialization

Transactions

---

# Core/Logger

Structured logging.

Application

Security

SEO

Errors

Performance

---

# Core/Security

HTML sanitization

CSRF

Headers

Validation

Security helpers

---

# Lib Folder

Contains integrations.

Examples

Supabase

Prisma

Monaco

Tiptap

Sonner

date-fns

Never business logic.

---

# Config

Contains configuration.

Examples

Navigation

Sidebar

Dashboard widgets

Languages

SEO defaults

Limits

Storage

Routes

---

# Constants

Application constants.

Example

Roles

Languages

Supported image types

Max upload size

Regex

---

# Types

Global shared interfaces.

AppUser

Pagination

ApiResponse

ServerActionResult

SEOScore

HistoryRecord

---

# Public Folder

Contains

Images

Icons

Fonts

Manifest

Favicon

No uploaded files.

Uploads belong to Supabase Storage.

---

# Naming Convention

Folders

lowercase

Example

products

seo

dashboard

Files

camelCase

Example

createProduct.ts

generateSlug.ts

updateCategory.ts

Components

PascalCase

ProductTable.tsx

DashboardCard.tsx

SEOScore.tsx

Interfaces

PascalCase

I prefix is forbidden.

Correct

Product

ProductSEO

SEOAnalysis

Incorrect

IProduct

ISEO

---

# File Size Limits

React Components

Maximum 250 lines

Hard limit

350 lines

Services

Maximum 300 lines

Repositories

Maximum 250 lines

Validators

Maximum 200 lines

If limits are exceeded,

split the implementation.

---

# Import Rules

Allowed

shared

↓

feature

↓

core

Forbidden

feature

↓

feature

Example

Products importing Categories directly

Forbidden

Instead

Create shared abstraction.

---

# Barrel Exports

Every folder should contain

index.ts

Avoid long import paths.

---

# Co-location

Files used together

should stay together.

Never scatter implementation across unrelated folders.

---

# Testing Preparation

Every feature reserves

__tests__/

Future-ready.

---

# Documentation

Complex features may include

README.md

inside their folder.

Purpose

Explain architecture.

Explain business rules.

Explain extension points.

---

# Forbidden Structure

Do NOT create folders such as

/components
/services
/hooks
/utils

at the project root containing mixed concerns.

Everything belongs either to a feature or to shared/core depending on responsibility.

---

# Cursor Requirements

Before creating any new file, Cursor MUST determine:

1. Which feature owns this functionality?
2. Can an existing component be reused?
3. Does similar logic already exist?
4. Should this belong to shared instead?
5. Does this violate dependency rules?
6. Will this file exceed the size limit?
7. Can the implementation be split into smaller units?

Only after answering these questions may a new file be created.