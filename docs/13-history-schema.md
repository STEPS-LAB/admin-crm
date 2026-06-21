# History Database Schema

Version: 1.0

Status: Approved

---

# Purpose

The History domain provides a complete, immutable audit trail of all significant actions performed within the CMS.

Every important modification to business entities must be recorded.

History records are append-only and can never be modified or deleted through the application.

The primary objectives are:

- Auditability
- Traceability
- Accountability
- Change comparison
- Recovery support
- Future versioning support

---

# Scope

History is recorded for:

- Products
- Categories
- SEO Profiles
- Metadata
- Redirects
- Sitemap Configuration
- Robots Configuration
- Global Settings
- Media
- Pages
- Future entities

---

# Architecture

Administrator Action

↓

Business Service

↓

Database Transaction

↓

History Service

↓

history_entries

---

History must always be written inside the same transaction as the business operation.

If the business operation fails, no history record may be created.

---

# Entity: History Entry

Table

history_entries

---

Primary Key

id UUID

---

Fields

id

UUID

Primary Key

---

entity_type

ENUM

Supported values

product

category

seo_profile

metadata

schema

redirect

media

settings

page

brand

system

future entities

---

entity_id

UUID

Required

References the affected entity.

---

operation

ENUM

create

update

delete

restore

publish

unpublish

login

logout

import

export

generate

scan

system

---

performed_by

UUID

Nullable

FK → profiles.id

Null when action is performed automatically by the system.

---

performed_at

TIMESTAMP

Required

Automatically generated.

---

ip_address

INET

Nullable

---

user_agent

TEXT

Nullable

---

session_id

UUID

Nullable

Future-ready.

---

change_summary

TEXT

Required

Human-readable summary.

Example:

"Updated Meta Title"

"Changed Product Price"

"Published Product"

---

before_data

JSONB

Nullable

Contains the previous state.

---

after_data

JSONB

Nullable

Contains the new state.

---

changed_fields

JSONB

Nullable

Example

[
  "meta_title",
  "canonical_url",
  "price"
]

---

reason

TEXT

Nullable

Optional administrator comment.

---

is_system_action

BOOLEAN

Default false

True when action is executed automatically.

---

created_at

TIMESTAMP

Required

---

Indexes

entity_type

entity_id

performed_by

performed_at

operation

created_at

(entity_type, entity_id)

---

# Data Strategy

before_data

Contains only fields that changed.

Never duplicate the entire entity unless required.

after_data

Contains only updated values.

Large binary data must never be stored.

---

# Business Rules

History entries are immutable.

Updates are forbidden.

Deletes are forbidden.

History records may only be archived according to retention policies.

---

# Comparison Support

The application must support comparing two history entries.

Comparison should highlight:

Added values

Removed values

Modified values

Unchanged values

The comparison engine must support nested JSON structures.

---

# Restore Support

History records themselves are never restored.

Instead:

Administrator selects a history entry

↓

Application reads after_data

↓

Creates a new update transaction

↓

Writes a new history record

↓

Entity restored

Original history remains unchanged.

---

# Filtering

History page supports filtering by:

Entity Type

Entity ID

Administrator

Operation

Date Range

Keyword

---

Sorting

Newest First

Oldest First

---

Search

Search inside:

Change Summary

Reason

Changed Fields

---

# Retention Policy

History is never deleted during normal operation.

Optional archival policy:

After 5 years

↓

Archive

↓

Cold Storage

---

# Security

History is read-only.

Only authenticated administrators may access history.

Sensitive values must be masked.

Examples:

API Keys

Verification Tokens

Passwords

Secrets

Access Tokens

These values must never be stored in plain text.

---

# Performance

Insert

< 20 ms

Search

< 100 ms

Comparison

< 150 ms

---

# Future Extensions

Support:

Version Browser

Entity Timeline

Rollback Assistant

Visual Diff Viewer

Activity Feed

Webhook Events

External Audit Export

Compliance Reports

Without schema redesign.