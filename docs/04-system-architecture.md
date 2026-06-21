# System Architecture

Version: 1.0

Status: Approved

---

# Purpose

This document defines the architectural principles of the Headless SEO CMS Platform.

All implementation decisions MUST follow this architecture.

Architecture has higher priority than implementation speed.

The system must remain maintainable for many years.

Short-term optimizations that reduce maintainability are prohibited.

---

# Architecture Goals

The architecture must prioritize:

• Scalability

• Maintainability

• Testability

• Separation of Concerns

• Performance

• Security

• Predictability

• Reusability

• Type Safety

---

# Architectural Style

The application follows a modular Feature-Based Architecture with clear separation between presentation, business logic and persistence.

This project intentionally does NOT use classic MVC.

MVC becomes difficult to maintain as projects grow.

Instead, every feature owns its own logic.

Each feature is independent.

Each feature contains everything it needs.

---

# High-Level Architecture

Application

├── Frontend Website

├── Admin Dashboard

├── Shared Design System

├── Shared Core

├── Shared Infrastructure

└── Database

The frontend must never directly access the database.

All communication goes through Server Actions.

---

# Feature-Based Structure

Every major feature is isolated.

Example:

Products

Categories

SEO

Dashboard

Settings

Authentication

Pages

Media

Each feature owns:

UI

Business Logic

Validation

Types

Server Actions

Services

Utilities

Constants

---

# Folder Structure Philosophy

The project must NOT be organized by file type.

Incorrect:

components/

hooks/

services/

utils/

Correct:

features/

products/

categories/

seo/

dashboard/

settings/

Every feature is self-contained.

---

# Layered Design

Each feature contains multiple layers.

Presentation Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer

---

## Presentation Layer

Responsible for UI only.

Contains:

Pages

Components

Dialogs

Tables

Forms

Cards

Tabs

Drawers

No business logic allowed.

---

## Application Layer

Coordinates use cases.

Examples:

Create Product

Delete Product

Update SEO

Generate Slug

Run SEO Analysis

Generate Sitemap

The application layer orchestrates services.

---

## Domain Layer

Contains business rules.

Examples

SEO Score calculation

Slug validation

Canonical generation

Schema validation

URL rules

Business rules never belong inside components.

---

## Infrastructure Layer

Responsible for:

Prisma

Supabase

Storage

External APIs

Database queries

File uploads

Infrastructure must never contain business logic.

---

# Dependency Rules

Allowed

UI

↓

Application

↓

Domain

↓

Infrastructure

Forbidden

Infrastructure calling UI

Components calling database directly

Components containing SQL

Components containing business logic

---

# Server Components

Server Components are the default.

Everything should be implemented as Server Components unless interaction requires client rendering.

Examples

Dashboard

Tables

Settings

SEO pages

Lists

Statistics

---

# Client Components

Client Components should only exist when required.

Allowed:

Forms

Editors

Drag & Drop

Image Upload

Tabs

Dialogs

Dropdowns

Search Input

Table interaction

Animations

Everything else stays server-side.

---

# Server Actions

Server Actions are the preferred communication layer.

Never create unnecessary REST endpoints.

Preferred

Component

↓

Server Action

↓

Service

↓

Repository

↓

Database

Avoid

Component

↓

Fetch

↓

API Route

↓

Database

unless external integration requires REST.

---

# Services

Every business operation belongs inside a service.

Example

ProductService

SEOService

CategoryService

SchemaService

RedirectService

SlugService

MediaService

HistoryService

Services contain business logic.

Services never render UI.

---

# Repository Pattern

Database access must be abstracted.

Components must never know how data is stored.

Repository example

ProductRepository

CategoryRepository

SEORepository

SettingsRepository

MediaRepository

This enables future database replacement without rewriting business logic.

---

# Validation Pipeline

Every request follows the same validation flow.

Client Validation

↓

Server Validation

↓

Business Rules

↓

Database Constraints

↓

Persist

Never trust client-side validation.

---

# Error Handling

Errors must never leak to users.

Return structured errors.

Example

type AppError = {
  code: string
  message: string
  field?: string
}

User-friendly messages only.

Detailed errors belong in logs.

---

# Logging Strategy

Log categories

Application

Security

Database

Authentication

SEO

Uploads

System

Each log entry contains

Timestamp

Operation

Entity

User

Status

Duration

---

# Transactions

Use database transactions whenever multiple writes occur.

Examples

Delete Product

↓

Delete Images

↓

Delete SEO

↓

Delete History

↓

Commit

Never leave partial updates.

---

# File Upload Pipeline

Upload

↓

Validate

↓

Optimize

↓

Generate WebP

↓

Generate Thumbnail

↓

Store

↓

Save Metadata

No uploaded file may bypass validation.

---

# SEO Engine

The SEO module is its own domain.

It is NOT a helper.

It contains

SEO Service

SEO Repository

SEO Validator

SEO Score Engine

SEO Rules Engine

Metadata Generator

Schema Generator

Canonical Generator

Slug Generator

Open Graph Generator

Twitter Generator

Robots Generator

Breadcrumb Generator

Each component must be independent.

---

# SEO Rules Engine

The SEO Rules Engine is responsible for evaluating SEO quality.

It uses deterministic rules.

No AI required.

Rules produce

Errors

Warnings

Suggestions

Passed Checks

Overall Score

---

# Scoring Engine

Every score is computed independently.

Overall Score is calculated from weighted metrics.

Example

Metadata

20%

Structured Data

15%

Canonical

10%

Robots

5%

Images

10%

Content

15%

URL

10%

Accessibility

5%

Performance Signals

10%

Technical SEO

10%

Weights should be configurable.

---

# Event Flow

Typical operation

User

↓

Form

↓

Validation

↓

Server Action

↓

Service

↓

Repository

↓

Database

↓

History

↓

Revalidate

↓

UI Refresh

---

# Caching Strategy

Static data

↓

Cache Forever

Frequently changing

↓

Tag Revalidation

Critical

↓

No Cache

---

# Configuration

Never hardcode values.

Configuration belongs inside

Environment Variables

Settings

Constants

Database

---

# Shared Modules

Shared contains only reusable code.

Allowed

Buttons

Inputs

Cards

Icons

Typography

Utilities

Hooks

Validators

Forbidden

Product-specific code

SEO-specific code

Category-specific code

---

# Design System

Every UI element must use design tokens.

Never invent spacing.

Never invent colors.

Never invent typography.

Everything comes from the design system.

---

# Security Boundaries

Every Server Action

↓

Authentication

Authorization

Validation

Sanitization

Logging

Database

Every step is mandatory.

---

# Performance Strategy

Prefer

Server Rendering

Streaming

Lazy Loading

Image Optimization

Suspense

Code Splitting

Avoid

Large Client Components

Large Bundles

Repeated Queries

Duplicate Requests

---

# Scalability

Every module must support future extension.

Examples

Multiple administrators

Permissions

Plugins

Themes

Public API

Webhooks

AI integrations

Without major architectural changes.

---

# Anti-Patterns (Forbidden)

The following practices are prohibited:

- Business logic inside React components
- Direct database queries in UI
- Using `any`
- Duplicate validation logic
- Massive files (>300–400 lines unless justified)
- God components
- Deep prop drilling
- Hardcoded strings
- Inline styles
- Anonymous exported components
- Uncontrolled forms
- Unhandled promises
- Nested conditional rendering that hurts readability
- Circular dependencies between features
- Feature-to-feature direct imports (use shared abstractions where appropriate)
- Copy-paste implementations instead of reusable services/components

---

# Code Quality Requirements

Every implementation MUST be:

- Strongly typed
- Modular
- Reusable
- Readable
- Self-documenting where possible
- Consistent with the design system
- Consistent with naming conventions
- Optimized before release

The generated project should resemble a production SaaS application maintained by an experienced engineering team rather than a rapidly generated prototype.