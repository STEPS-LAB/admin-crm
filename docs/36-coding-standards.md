# Coding Standards & Development Guidelines

Version: 1.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines mandatory coding standards, architectural conventions, naming rules and development practices for the entire project.

Every line of code must follow these standards.

Consistency is more important than personal preference.

Any code that violates these guidelines should be considered invalid during code review.

The objective is to produce a codebase that remains maintainable, scalable and understandable for years.

---

# General Principles

Write code for humans first.

Optimize only after measuring.

Prefer readability over cleverness.

Avoid premature abstraction.

Keep functions small.

Keep components focused.

Every module should have a single responsibility.

Avoid duplicated logic.

Prefer composition over inheritance.

Never sacrifice maintainability for brevity.

---

# Technology Stack

Framework

Next.js App Router

Language

TypeScript (Strict Mode)

Styling

Tailwind CSS

Database

PostgreSQL

ORM

Drizzle ORM

Authentication

Supabase Auth

Storage

Supabase Storage

State Management

TanStack Query

Validation

Zod

Forms

React Hook Form

Charts

Recharts

Icons

Lucide React

Animations

Framer Motion

---

# TypeScript Standards

Strict Mode

Required

No any

Allowed only with documented justification.

Prefer

type

for objects.

interface

Only when extension is required.

Avoid

unknown casting

double casting

non-null assertions

unless absolutely necessary.

Every exported function

Must have explicit return type.

---

# Naming Conventions

Components

PascalCase

Example

ProductCard.tsx

---

Hooks

camelCase

Prefix

use

Example

useSeoScore.ts

---

Utilities

camelCase

Example

generateSlug.ts

---

Repositories

PascalCase

Example

ProductRepository.ts

---

Services

PascalCase

Example

SeoService.ts

---

Server Actions

camelCase

Example

createProduct()

updateCategory()

runSeoAudit()

---

Constants

UPPER_SNAKE_CASE

---

Enums

PascalCase

Enum values

UPPER_SNAKE_CASE

---

Database Tables

snake_case

---

Database Columns

snake_case

---

Environment Variables

UPPER_SNAKE_CASE

---

# File Naming

Components

PascalCase.tsx

Hooks

useSomething.ts

Utilities

camelCase.ts

Types

types.ts

Schemas

schema.ts

Repositories

Repository.ts

Services

Service.ts

---

# Folder Rules

One responsibility per folder.

Avoid folders with unrelated logic.

Maximum nesting

4 levels

Preferred

3 levels

---

# Component Standards

Maximum Length

250 Lines

Preferred

150 Lines

---

Responsibilities

Rendering

User Interaction

Delegating Business Logic

---

Never

Direct Database Access

Business Logic

Complex Calculations

---

# Function Standards

Maximum Length

50 Lines

Preferred

30 Lines

---

Maximum Parameters

5

Otherwise

Use Object Parameter

---

Functions must

Have descriptive names

Return predictable values

Avoid side effects

---

# Comments

Comment

Why

Not

What

---

Avoid

Obvious comments

Outdated comments

Commented-out code

---

Documentation required for

Complex Algorithms

Architecture Decisions

Performance Optimizations

Business Rules

---

# Error Handling

Never ignore errors.

Never use empty catch blocks.

Every error must

Be logged

Return meaningful messages

Include context

Avoid exposing sensitive information

---

# Async Rules

Always use

async/await

Avoid

.then()

Nested Promises

Callback Hell

---

Every async operation

Must handle failures.

---

# React Standards

Server Components

Default

Client Components

Only when necessary

---

Prefer

Composition

Controlled Components

Small Components

Memoization when measured

---

Avoid

Prop Drilling

Large Contexts

Deep Component Trees

Anonymous Components

---

# State Management

Server State

TanStack Query

UI State

React

Form State

React Hook Form

Persistent Settings

Local Storage

Prepared

---

Never duplicate state.

---

# Styling Standards

Tailwind CSS only.

Avoid inline styles.

Avoid custom CSS unless necessary.

Use design tokens.

Use spacing scale consistently.

Border Radius

8px

10px

12px

---

Shadows

Soft

Minimal

Premium

---

Animations

Fast

Natural

Optional

Respect reduced motion.

---

# Accessibility

WCAG 2.2 AA

Semantic HTML

Keyboard Navigation

Visible Focus

ARIA Labels

Screen Reader Support

Minimum Touch Targets

44px

---

Accessibility is mandatory.

---

# Forms

Validation

Zod

React Hook Form

Inline Errors

Realtime Validation

Optimistic UX

Accessible Labels

Keyboard Support

---

# Database Rules

Never query database directly from UI.

Repositories only.

Every migration reviewed.

Indexes documented.

Transactions for complex operations.

---

# SEO Rules

Metadata generated server-side.

Canonical URLs validated.

Structured Data validated.

Image ALT required.

Slug uniqueness enforced.

---

# Security Rules

Never trust client input.

Validate everything.

Escape output.

No secrets in frontend.

Parameterized queries only.

Audit sensitive actions.

---

# Git Standards

Commit Messages

Conventional Commits

Examples

feat:

fix:

refactor:

docs:

test:

perf:

chore:

---

Small commits preferred.

---

# Pull Requests

Every PR must include

Description

Screenshots (UI)

Testing Notes

Checklist

Linked Issue (Future)

---

Maximum recommended size

500 Lines

---

# Code Review Checklist

Architecture

Naming

Performance

Accessibility

Security

SEO

Testing

Documentation

Error Handling

Maintainability

---

# Logging

Use structured logging.

Avoid console.log in production.

Log levels

Debug

Info

Warning

Error

Critical

---

# Documentation

Every public module documented.

Every complex workflow documented.

Architecture changes documented.

Breaking changes documented.

---

# Testing Standards

New feature

↓

Unit Tests

↓

Integration Tests

↓

E2E (if critical)

---

No feature complete without tests.

---

# Performance Rules

Measure first.

Optimize second.

Avoid unnecessary renders.

Lazy load heavy modules.

Use virtualization.

Optimize images.

---

# Dependency Rules

Keep dependencies minimal.

Avoid abandoned packages.

Review licenses.

Monitor vulnerabilities.

Update regularly.

---

# Forbidden Practices

Using any without justification.

Business logic inside components.

Direct database access from UI.

Duplicated code.

Large God Components.

Magic Numbers.

Hardcoded Strings.

Hardcoded Colors.

Unchecked Promises.

Disabled ESLint rules.

Ignoring TypeScript errors.

---

# Repository Layer

Every feature must follow

Component

↓

Server Action

↓

Service

↓

Repository

↓

Database

No shortcuts allowed.

---

# Definition of Done

A feature is complete only when

Implementation finished

Code reviewed

Tests passing

Accessibility verified

SEO validated

Performance checked

Documentation updated

Audit logging implemented

No TypeScript errors

No ESLint warnings

Production build successful

---

# Acceptance Criteria

✓ Entire project follows consistent coding standards.

✓ TypeScript Strict Mode enforced.

✓ Every feature follows repository/service architecture.

✓ Components remain small and maintainable.

✓ Code review checklist applied to every Pull Request.

✓ Accessibility requirements enforced.

✓ Security and SEO requirements respected.

✓ Documentation maintained.

✓ Testing mandatory for all production features.

✓ Codebase prepared for long-term enterprise maintenance.
