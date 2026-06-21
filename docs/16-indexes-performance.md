# Database Indexes & Performance Specification

Version: 1.0

Status: Approved

---

# Purpose

This document defines database optimization strategies, indexing policies, query performance standards, caching mechanisms, and scalability guidelines for the Headless SEO CMS Platform.

The objective is to guarantee predictable performance as the platform grows from hundreds to hundreds of thousands of products without requiring architectural changes.

Target database:

PostgreSQL 16 (Supabase)

ORM:

Prisma ORM

---

# Performance Goals

Dashboard

< 500 ms

Product List

< 300 ms

Single Product

< 100 ms

SEO Profile

< 100 ms

Search

< 200 ms

Media Library

< 300 ms

Settings

< 20 ms

History

< 300 ms

Redirects

< 100 ms

---

# General Indexing Rules

Every foreign key must be indexed.

Every frequently filtered field must be indexed.

Every frequently sorted field must be indexed.

Composite indexes should be preferred over multiple single-column indexes when queries commonly combine filters.

Avoid unnecessary indexes on low-cardinality columns.

Review indexes after each major feature addition.

---

# Primary Keys

All entities use:

UUID

Primary key index is automatically created.

---

# Products

Indexes

sku

category_id

brand_id

status

created_at

updated_at

published_at

price

stock_quantity

slug

Composite Indexes

(category_id, status)

(status, created_at)

(status, published_at)

(brand_id, status)

(language, slug)

(status, price)

---

# Categories

Indexes

parent_id

status

sort_order

slug

(language, slug)

(parent_id, sort_order)

---

# SEO Profiles

Indexes

owner_type

owner_id

language

(owner_type, owner_id)

(owner_type, owner_id, language)

is_indexable

---

# Metadata

Indexes

meta_title

meta_description

seo_profile_id

---

# Redirects

Indexes

source

destination

status_code

enabled

hits

Composite

(enabled, status_code)

(source, enabled)

---

# Media

Indexes

storage_path

sha256_hash

mime_type

created_at

updated_at

is_deleted

Composite

(is_deleted, created_at)

(storage_bucket, generated_filename)

---

# History

Indexes

entity_type

entity_id

performed_by

performed_at

operation

Composite

(entity_type, entity_id)

(entity_type, performed_at)

(operation, performed_at)

---

# Settings

Single row table.

No additional indexes required.

---

# Search Strategy

Products

Searchable Fields

Name

Slug

SKU

Barcode

Description

Category

Brand

Search must support:

Partial match

Case insensitive

Accent insensitive

Multilingual

Future full-text search compatibility.

---

# Full-Text Search

Architecture must support PostgreSQL Full Text Search.

Recommended fields:

Product Name

Description

Category Name

Brand Name

SEO Title

SEO Description

Implementation should allow migration to tsvector without schema redesign.

---

# Pagination Strategy

Default page size

25

Allowed

10

25

50

100

Maximum

250

---

Offset pagination

Administration tables.

Cursor pagination

API endpoints.

---

# Query Optimization

Always use:

select()

Instead of:

include()

when complete relations are unnecessary.

Load nested relations only when required.

Avoid N+1 queries.

Use relation counts where appropriate.

---

# Transactions

Use database transactions for:

Create Product

Update Product

Delete Product

Publish Product

SEO Updates

Bulk Operations

Import

Restore

---

# Bulk Operations

Supported

Bulk Publish

Bulk Delete

Bulk Category Change

Bulk SEO Update

Bulk Redirect Creation

Bulk Metadata Generation

Operations should be processed in batches.

Recommended batch size:

100 records

---

# Connection Pooling

Use Supabase Connection Pooler.

Recommended pool size:

10–20 connections

Idle timeout:

30 seconds

Connection lifetime:

30 minutes

---

# Caching Strategy

Cache:

Settings

Languages

Categories Tree

SEO Templates

Feature Flags

Static Configuration

Do not cache:

History

User Sessions

Recent Activity

Audit Logs

---

# Image Optimization

Generate:

Thumbnail

Small

Medium

Large

WebP

AVIF

Generation must be asynchronous.

Original file must never be modified.

---

# Lazy Loading

Required for:

Media Library

History

SEO Analysis

Dashboard Charts

Activity Feed

---

# Database Constraints

Prefer database constraints over application-only validation.

Examples:

Unique slug

Unique SKU

Foreign key integrity

Check constraints

---

# Explain Analyze

Every query exceeding:

100 ms

must be analyzed using

EXPLAIN ANALYZE

before release.

---

# Monitoring

Track:

Slow Queries

Failed Queries

Connection Count

Database Size

Table Growth

Index Usage

Cache Hit Ratio

Query Duration

Transaction Duration

---

# Logging

Log:

Query Duration

Failed Transactions

Migration Duration

Import Statistics

Bulk Operations

---

# Security

Parameterized queries only.

No raw SQL unless absolutely necessary.

Validate all inputs.

Never concatenate SQL strings.

Restrict database roles using least-privilege principles.

---

# Backup Strategy

Automatic daily backups.

Point-in-time recovery enabled.

Migration rollback strategy documented.

---

# Scalability

Architecture must support:

100 Products

1,000 Products

10,000 Products

100,000 Products

1,000,000 Products

Without schema redesign.

---

# Future Optimizations

Prepared Statements

Materialized Views

Read Replicas

Partitioned Tables

Redis Cache

Edge Cache

Background Workers

Search Index

ElasticSearch Integration

Meilisearch Integration

OpenSearch Integration

Without changing application architecture.

---

# Acceptance Criteria

✓ No full table scans on primary business queries.

✓ All list views load within target performance.

✓ Bulk operations complete without timeouts.

✓ Search remains performant on 100,000+ products.

✓ Indexes reviewed after every major schema change.

✓ Performance regression testing included in CI/CD pipeline.