# CLAUDE.md

# Project Identity

This project is a production-grade SEO CMS built with modern web technologies.

This is NOT a demo.

This is NOT a prototype.

This is NOT an MVP.

Every implementation decision must assume the application will be deployed into production and maintained for many years.

The codebase should represent the quality expected from an enterprise SaaS product.

---

# Source of Truth

The `/docs` directory contains the complete Software Requirements Specification.

Read all documentation before implementing new functionality.

Never ignore the SRS.

Never replace documented behavior with assumptions.

If implementation conflicts with documentation:

The documentation always wins.

---

# Development Philosophy

Architecture first.

Quality second.

Speed last.

Never optimize for generating code quickly.

Always optimize for maintainability.

Think before writing code.

---

# Architecture Rules

The project follows strict layered architecture.

Presentation

↓

Server Actions

↓

Services

↓

Repositories

↓

Database

Never bypass layers.

Never place business logic inside React components.

Never access the database outside repositories.

Never query Supabase directly from components.

Never perform validation inside UI components.

---

# Technology Stack

Always use

Next.js App Router

TypeScript Strict

React Server Components

Server Actions

Tailwind CSS

shadcn/ui

Supabase

Drizzle ORM

TanStack Query

React Hook Form

Zod

Lucide React

Framer Motion

next/font

Never introduce unnecessary libraries.

Avoid duplicate dependencies.

---

# Code Quality

Write code like a senior engineer.

Readable.

Predictable.

Reusable.

Scalable.

Simple.

No hacks.

No shortcuts.

No temporary solutions.

No placeholder implementations.

No unfinished features.

No commented-out code.

No duplicated code.

---

# TypeScript

Strict Mode is mandatory.

Never use

any

unless absolutely unavoidable.

Never disable TypeScript errors.

Never use ts-ignore.

Always prefer explicit types.

Every exported function must declare a return type.

---

# Components

Components are responsible only for

Rendering

Interaction

Delegation

Components never contain

Business Logic

Database Queries

Complex Calculations

Security Rules

SEO Algorithms

---

# Services

Services contain

Business Logic

SEO Logic

Calculations

Validation Coordination

Transactions

Automation

Nothing else.

---

# Repositories

Repositories communicate with

Database

Storage

Nothing else.

Repositories never import React.

Repositories never contain UI logic.

Repositories never contain business logic.

---

# UI Standards

Every interface must look like premium SaaS software.

Characteristics

Minimal

Elegant

Modern

Soft

Responsive

Mobile-first

Excellent spacing

Consistent typography

Subtle animations

Professional tables

Professional forms

Professional dialogs

Professional navigation

Never make the UI look generic.

---

# Styling

Tailwind CSS only.

Prefer utility classes.

Avoid custom CSS.

Use design tokens.

Use spacing consistently.

Border radius

8–10px

Soft shadows only.

---

# Accessibility

Accessibility is mandatory.

Support

Keyboard navigation

Screen readers

Visible focus

ARIA labels

Semantic HTML

Reduced motion

Touch targets

WCAG 2.2 AA

Never ship inaccessible components.

---

# SEO

SEO is the core feature.

Every SEO feature described in the SRS must be implemented.

Nothing should be hardcoded.

Everything must be configurable.

Always think from Google's perspective.

Support

Metadata

Canonical

Robots

JSON-LD

OpenGraph

Twitter Cards

Sitemap

Redirects

SEO Templates

SEO Variables

SEO Validation

SEO Score

Structured Data

Image SEO

Internal Linking

Everything.

---

# Performance

Always optimize for

React Server Components

Streaming

Minimal Client JavaScript

Lazy Loading

Optimistic UI

Caching

Memoization

Virtualization

Image Optimization

Avoid unnecessary renders.

---

# Security

Follow OWASP Top 10.

Validate every input.

Escape every output.

Never trust the client.

Never expose secrets.

Never leak stack traces.

Always authorize on the server.

Always validate uploads.

Always sanitize rich text.

---

# Forms

Use

React Hook Form

+

Zod

Every form requires

Validation

Loading State

Error State

Success State

Disabled State

Accessibility

---

# Database

Always use Drizzle ORM.

Always use migrations.

Always use repositories.

Use transactions for complex operations.

Index searchable fields.

Normalize schema.

Support soft deletes where required.

---

# File Structure

Never create random folders.

Respect the project structure.

Every feature belongs inside its domain.

Every module owns

Components

Hooks

Schemas

Services

Repositories

Tests

Utilities

Documentation

---

# Naming

Components

PascalCase

Hooks

useSomething

Utilities

camelCase

Repositories

SomethingRepository

Services

SomethingService

Server Actions

camelCase

Database

snake_case

---

# Error Handling

Never swallow errors.

Never use empty catch blocks.

Every error should

Be meaningful

Be logged

Contain context

Hide sensitive information

---

# Logging

Use structured logging.

No console.log in production.

Support

Debug

Info

Warning

Error

Critical

---

# Testing

Every important feature should include

Unit Tests

Integration Tests

E2E Tests where appropriate

Regression Tests for bug fixes.

---

# Git

Prefer small logical commits.

Follow Conventional Commits.

Examples

feat:

fix:

refactor:

docs:

perf:

test:

chore:

---

# Before Writing Code

Always think about

Architecture

Performance

Security

Accessibility

SEO

Maintainability

Scalability

Developer Experience

Only then start implementation.

---

# Before Finishing Any Feature

Verify

✓ Types compile

✓ ESLint passes

✓ Build succeeds

✓ No duplicated logic

✓ Responsive

✓ Accessible

✓ Secure

✓ SEO compatible

✓ Documentation updated

✓ Tests added when appropriate

---

# Output Style

When completing a task always include

## Summary

What was implemented.

## Files

Created files.

Modified files.

## Decisions

Important architectural decisions.

## Validation

How the implementation follows the SRS.

## Next Step

The next recommended feature.

---

# Absolute Rules

Never violate the SRS.

Never simplify architecture.

Never replace quality with speed.

Never ignore accessibility.

Never ignore security.

Never ignore SEO.

Never ignore performance.

Never generate placeholder code.

Never generate fake implementations.

Never use mock business logic in production code.

Never leave the repository in a broken state.

Always deliver production-ready code.

The final application should feel comparable in engineering quality to products built by companies such as Vercel, Stripe, Linear or Notion, while remaining an original implementation.