# API Architecture

Version: 1.0

Status: Approved

Priority: Critical

---

# Purpose

The CMS follows a modern API architecture based on Next.js App Router, React Server Components and Server Actions.

The application is designed with an API-first mindset internally, while avoiding unnecessary public REST endpoints.

Business logic must never exist inside React components.

All data access must pass through dedicated repositories and services.

The architecture must support future public APIs without requiring major refactoring.

---

# Design Goals

✓ Type Safe

✓ Server First

✓ Secure

✓ Modular

✓ Scalable

✓ Testable

✓ Reusable

✓ Enterprise Ready

---

# Architecture Overview

Presentation Layer

↓

Server Actions

↓

Services

↓

Repositories

↓

Database

---

No component should communicate directly with the database.

---

# API Philosophy

Current Version

Private CMS

Internal API

Server Actions

---

Future Ready

REST API

GraphQL

Public API

Mobile API

Partner API

Webhook API

---

# Request Flow

User

↓

React Component

↓

Server Action

↓

Validation

↓

Service Layer

↓

Repository

↓

Database

↓

Repository

↓

Service

↓

Server Action

↓

UI Update

---

# Server Actions

Purpose

Execute all mutations and protected queries.

---

Responsibilities

Authentication

Authorization

Validation

Transactions

Error Handling

Audit Logging

Cache Invalidation

Realtime Events

---

Naming Convention

createProduct()

updateProduct()

deleteProduct()

restoreProduct()

publishProduct()

duplicateProduct()

---

Every action

Single Responsibility

Strong Typing

Error Handling

Validation

---

# Repository Pattern

Purpose

Abstract all database communication.

---

Repositories

ProductRepository

CategoryRepository

SeoRepository

MediaRepository

AnalyticsRepository

SettingsRepository

AuditRepository

BackupRepository

AuthenticationRepository

NotificationRepository

---

Responsibilities

CRUD

Pagination

Filtering

Searching

Sorting

Transactions

Relations

Optimized Queries

---

Repositories never contain business logic.

---

# Service Layer

Purpose

Business rules.

---

Services

ProductService

CategoryService

SeoService

MediaService

SettingsService

AnalyticsService

BackupService

AuthenticationService

NotificationService

AuditService

ValidationService

---

Responsibilities

Business Logic

Transactions

Complex Operations

Automation

Calculations

Validation

Event Dispatching

---

# Validation Layer

Library

Zod

---

Validation Types

Input

Business Rules

Database Constraints

Dependencies

Localization

---

Validation executed

Before every mutation.

---

# Error Handling

Standard Response

Success

↓

Data

↓

Message

↓

Metadata

---

Error Response

Code

Message

Details

Suggestion

Correlation ID

---

Error Categories

Validation

Authentication

Authorization

Database

Storage

Network

Unexpected

---

# API Response Standards

Every successful response contains

success

data

message

timestamp

requestId

---

Every error contains

success

error

code

details

timestamp

requestId

---

# Pagination

Cursor Pagination

Preferred

---

Offset Pagination

Supported

Future

---

Default

25

Options

25

50

100

250

---

# Filtering

Supported

Search

Category

Language

Status

Date

SEO Score

Visibility

Custom Filters

---

Multiple filters supported simultaneously.

---

# Sorting

Ascending

Descending

Multiple Columns

Natural Sorting

Locale Aware

---

# Transactions

Every complex operation executed inside database transaction.

Examples

Create Product

↓

Create SEO

↓

Assign Category

↓

Create Audit Log

↓

Commit

---

Rollback on failure.

---

# Cache Strategy

Technology

Next.js Cache

TanStack Query

Server Cache

---

Automatic Cache Invalidation

Product Updated

Category Updated

SEO Updated

Settings Updated

Media Uploaded

Backup Restored

---

# Realtime Events

Technology

Supabase Realtime

---

Events

Create

Update

Delete

Restore

Import

Export

Audit

Settings

Media

Notifications

---

# Security

Authentication Required

Server-side Authorization

Input Validation

Rate Limiting

CSRF Protection

XSS Protection

SQL Injection Protection

Secure Headers

---

Secrets never exposed.

---

# Logging

Every API call records

Request ID

Duration

User

Action

Repository

Status

Error

---

# Performance

Target Response

<200ms

Search

<100ms

Pagination

<150ms

Server Action

<200ms

---

# API Versioning

Current

v1

Architecture prepared for

v2

v3

---

Versioning Strategy

Non-breaking changes preferred.

---

# Future Public API

Prepared Endpoints

/products

/categories

/seo

/media

/settings

/search

/sitemap

/health

---

JWT Authentication

Prepared.

---

# Webhooks

Prepared Events

Product Created

Product Updated

Category Updated

SEO Audit Completed

Backup Completed

Media Uploaded

Settings Updated

---

Retry Strategy

Exponential Backoff

Administrator configurable.

---

# Rate Limiting

Authentication

Search

Imports

Exports

Uploads

API Requests

---

Default

100 requests / minute

Administrator configurable.

---

# Monitoring

Metrics

Average Response Time

Slow Queries

Error Rate

Success Rate

Cache Hit Ratio

Database Time

Server Time

---

Prepared for

OpenTelemetry

Sentry

Prometheus

Grafana

---

# Repository Dependency Rules

Presentation Layer

↓

Server Actions

↓

Services

↓

Repositories

↓

Database

---

Reverse dependency forbidden.

---

# Dependency Injection

Services receive repositories via dependency injection.

Prepared for testing and mocking.

---

# Testing

Unit Tests

Repository Tests

Service Tests

Integration Tests

End-to-End Tests

Contract Tests (Future)

---

# Documentation

Architecture prepared for

OpenAPI

Swagger

Scalar

Future SDK Generation

---

# Accessibility

Not applicable to API responses.

Developer documentation must follow semantic structure.

---

# Acceptance Criteria

✓ All business logic isolated inside services.

✓ Database access isolated inside repositories.

✓ Server Actions perform all mutations.

✓ Validation executed before every operation.

✓ Transactions rollback automatically on failure.

✓ Cache invalidation executed automatically.

✓ Realtime events dispatched after successful mutations.

✓ API prepared for future public exposure.

✓ Architecture supports enterprise-scale applications.

✓ Fully type-safe implementation.
