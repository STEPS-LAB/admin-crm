# Technology Stack

Version: 1.0

Status: Approved

---

# Purpose

This document defines the official technology stack for the Headless SEO CMS Platform.

These technologies are mandatory.

Cursor must not replace them with alternatives unless explicitly approved.

Every implementation decision must follow this document.

---

# Core Philosophy

The project must prioritize:

• Maintainability

• Scalability

• Performance

• Type Safety

• Security

• Accessibility

• SEO

• Developer Experience

• Long-term support

Avoid trendy libraries that do not provide long-term stability.

Choose mature, well-maintained solutions with strong community support.

---

# Runtime

Node.js

Latest LTS Version

---

# Package Manager

pnpm

Reasons:

- Fastest installation
- Disk space optimization
- Better monorepo support
- Reliable dependency management

---

# Framework

Next.js 15+

App Router

React Server Components

Server Actions

Streaming

Partial Prerendering (when stable)

Edge Runtime where appropriate

---

# Language

TypeScript

Strict Mode

Required:

strict = true

noImplicitAny = true

strictNullChecks = true

exactOptionalPropertyTypes = true

noUncheckedIndexedAccess = true

Never disable TypeScript rules.

Never use "any".

Prefer "unknown" when necessary.

---

# Styling

Tailwind CSS v4

Requirements

Utility-first

No CSS frameworks

Minimal custom CSS

Use CSS variables for colors

Use design tokens

Dark mode architecture ready (implementation optional)

---

# UI Components

Primary

shadcn/ui

Reasons

Excellent accessibility

Based on Radix UI

Reusable

Production quality

Composable

---

# Primitive Components

Radix UI

Use Radix primitives whenever available.

Examples

Dialog

Popover

Dropdown

Tooltip

Tabs

Accordion

Navigation Menu

Hover Card

Toast

Scroll Area

Context Menu

Menubar

Separator

Checkbox

Switch

Slider

Radio Group

Collapsible

Resizable Panels

---

# Icons

Lucide React

Requirements

Consistent stroke width

Tree-shakeable

SVG

---

# Animations

Framer Motion

Use only when animation improves UX.

Avoid decorative animations.

Preferred:

Fade

Scale

Slide

Height Auto

Layout Animation

Hover transitions

Micro interactions

Never animate large page transitions.

---

# Forms

React Hook Form

Combined with

Zod

Reasons

Performance

Minimal re-renders

Excellent validation

Type-safe forms

---

# Validation

Zod

All validation schemas must be centralized.

Never validate directly inside components.

Validation layers

Client

↓

Server

↓

Database

---

# Database

Supabase

Reasons

Managed PostgreSQL

Authentication support

Storage

Realtime (future)

Backups

Scalable

---

# ORM

Prisma ORM

Reasons

Excellent Type Safety

Migration system

Readable queries

Relationships

Great developer experience

Future scalability

Never write raw SQL unless absolutely necessary.

---

# Authentication

Supabase Auth

Requirements

Email login

Secure sessions

Server validation

Protected middleware

HTTP-only cookies

Automatic refresh

---

# File Storage

Supabase Storage

Store

Images

SEO Images

Open Graph Images

Category Images

Product Images

Future documents

---

# Rich Text Editor

Tiptap

Requirements

Modern editor

Extensible

Minimal UI

Support

Headings

Lists

Tables

Images

Links

Code Blocks

Markdown

HTML Export

---

# JSON Editor

Monaco Editor

Purpose

JSON-LD

robots.txt

Custom Scripts

Advanced Configuration

Requirements

Syntax Highlighting

Auto Formatting

Error Highlighting

Bracket Matching

Line Numbers

---

# Data Tables

TanStack Table

Required Features

Sorting

Filtering

Column Visibility

Pagination

Sticky Headers

Virtualization Ready

Bulk Selection

Resizable Columns

Search

---

# Search

Fuse.js

Purpose

Fast client-side fuzzy search

Search products

Categories

Settings

SEO

Schemas

Redirects

---

# Charts

Recharts

Dashboard Only

Charts

SEO Health

Statistics

Product Growth

Category Growth

Issues

Redirect Trends

---

# Notifications

Sonner

Reasons

Beautiful

Minimal

Accessible

Promise support

---

# Date Handling

date-fns

Never use Moment.js.

---

# HTTP Client

Native Fetch

Use Server Actions whenever possible.

Avoid unnecessary REST calls.

---

# State Management

Default

React Server Components

+

Server Actions

Only use client state where required.

Client State

React Context

Small UI state

Local component state

Avoid global state libraries unless absolutely necessary.

No Redux.

No MobX.

No Zustand unless justified.

---

# Caching

React Cache

Next.js Cache

Server Cache

Revalidation

Tag-based revalidation

Route revalidation

---

# Images

Next/Image

Requirements

Lazy Loading

Responsive

Automatic Optimization

WebP

AVIF

Blur Placeholder

---

# SEO

Native Next.js Metadata API

JSON-LD

Dynamic Metadata

Dynamic Robots

Dynamic Sitemap

Dynamic Canonical

Dynamic OpenGraph

Dynamic Twitter

---

# Internationalization

next-intl

Languages

English

Ukrainian

SEO fields stored independently.

---

# Logging

Use structured logging.

Separate

Application logs

Error logs

Security logs

Audit logs

---

# Error Tracking

Architecture ready

Sentry integration later

---

# Testing

Architecture prepared for

Vitest

Playwright

Testing Library

Implementation optional for MVP.

---

# Code Formatting

Prettier

Mandatory

---

# Linting

ESLint

Strict configuration

No warnings in production.

---

# Git Hooks

Husky

lint-staged

Run automatically before commit.

---

# Security Libraries

DOMPurify

Sanitize HTML

Never trust user input.

---

# Slug Generation

Use proper Ukrainian transliteration.

Requirements

Readable URLs

SEO Friendly

Lowercase

Hyphen separated

No duplicated slugs

Manual override supported

Automatic uniqueness check

Example

Телефон Apple Pro Max

↓

telefon-apple-pro-max

---

# Performance Targets

First Load JS

Minimal

Lighthouse

Performance

95+

Accessibility

100

SEO

100

Best Practices

100

CLS

Below 0.1

LCP

Below 2.5 seconds

INP

Excellent

---

# Browser Support

Latest

Chrome

Safari

Firefox

Edge

Mobile browsers

---

# Mobile First

Every component must be designed for mobile first.

Breakpoints

sm

md

lg

xl

2xl

Desktop layout should never be the primary design target.

---

# Accessibility

WCAG AA

Keyboard navigation

ARIA labels

Screen reader friendly

Visible focus states

Semantic HTML

High contrast support

Reduced motion support

---

# Future Ready

Architecture should support future integration with

OpenAI

Cloudflare

Redis

Queue Workers

Email Services

Payments

Multi-user roles

API Keys

Plugins

Without major refactoring.