# Storage Database Schema

Version: 1.0

Status: Approved

---

# Purpose

The Storage domain is responsible for managing all uploaded media assets within the platform.

The application uses Supabase Storage for physical file storage while PostgreSQL stores only metadata.

The Storage domain is designed as a reusable Media Asset Management (MAM) system.

Every uploaded asset becomes a reusable resource that can be attached to multiple entities without duplication.

Supported owners include:

- Products
- Categories
- Brands
- Pages
- SEO Profiles
- Open Graph
- Organization Logo
- Site Settings
- Future entities

---

# Storage Architecture

Administrator

↓

Upload File

↓

Supabase Storage

↓

Image Processing Service

↓

Metadata Extraction

↓

Database Record

↓

Media Library

↓

Reusable Asset

---

# Storage Buckets

The application uses dedicated buckets.

products/

categories/

brands/

pages/

seo/

settings/

system/

temporary/

---

Each bucket has independent access rules.

Temporary uploads are automatically cleaned.

---

# Entity: Media Asset

Table

media_assets

---

Primary Key

id UUID

---

Fields

id

UUID

PK

---

storage_bucket

TEXT

Required

---

storage_path

TEXT

Required

Unique

---

original_filename

TEXT

Required

---

generated_filename

TEXT

Required

---

extension

TEXT

Required

---

mime_type

TEXT

Required

---

file_size

BIGINT

Bytes

---

width

INTEGER

Nullable

---

height

INTEGER

Nullable

---

aspect_ratio

NUMERIC(6,3)

Nullable

---

dominant_color

TEXT

Nullable

Hex color.

Used for placeholder generation.

---

blurhash

TEXT

Nullable

Supports progressive image loading.

---

sha256_hash

TEXT

Required

Unique

Used for duplicate detection.

---

alt_uk

TEXT

Nullable

---

alt_en

TEXT

Nullable

---

title_uk

TEXT

Nullable

---

title_en

TEXT

Nullable

---

caption_uk

TEXT

Nullable

---

caption_en

TEXT

Nullable

---

copyright

TEXT

Nullable

---

photographer

TEXT

Nullable

---

license

TEXT

Nullable

---

is_public

BOOLEAN

Default true

---

is_optimized

BOOLEAN

Default false

---

has_webp

BOOLEAN

Default false

---

has_avif

BOOLEAN

Default false

---

has_thumbnail

BOOLEAN

Default false

---

is_deleted

BOOLEAN

Default false

---

created_at

TIMESTAMP

---

updated_at

TIMESTAMP

---

deleted_at

TIMESTAMP

Nullable

Soft delete.

---

# Relationships

One Media Asset

↓

Many Products

↓

Many Categories

↓

Many Brands

↓

Many Pages

↓

Many SEO Profiles

---

Media is reusable.

The same image may be attached to multiple entities.

---

# Entity: Media Usage

Purpose

Tracks where media is used.

---

Table

media_usage

---

Fields

id

UUID

---

media_asset_id

FK

Required

---

owner_type

ENUM

product

category

brand

page

seo

settings

future

---

owner_id

UUID

Required

---

usage_type

ENUM

cover

gallery

icon

thumbnail

open_graph

twitter

logo

banner

attachment

custom

---

sort_order

INTEGER

Default 0

---

created_at

TIMESTAMP

---

Indexes

media_asset_id

owner_type

owner_id

(owner_type, owner_id)

---

# Image Variants

Generated automatically.

Original

↓

Thumbnail

↓

Small

↓

Medium

↓

Large

↓

WebP

↓

AVIF

---

Variant generation must be asynchronous.

---

# Supported Formats

Images

JPEG

PNG

WEBP

AVIF

SVG

GIF

---

Future

PDF

DOCX

XLSX

PPTX

ZIP

MP4

WEBM

MP3

---

# Image Optimization

Automatically perform:

Metadata stripping

Compression

Responsive resizing

Thumbnail generation

WebP conversion

AVIF conversion

Orientation correction (EXIF)

---

Optimization must never overwrite the original file.

---

# Duplicate Detection

Before storing a new file:

Calculate SHA-256 hash.

If identical file already exists:

Reuse existing asset.

Create new Media Usage record only.

Do not duplicate storage.

---

# ALT Text Strategy

ALT text supports:

Ukrainian

English

---

ALT text is optional during upload.

However:

SEO Analyzer reports missing ALT text.

---

# Validation Rules

Maximum upload size

Configurable.

Default:

25 MB

---

Allowed mime types configurable.

---

SVG must be sanitized.

Executable files forbidden.

---

Filenames normalized automatically.

Unsafe characters removed.

---

# Folder Structure

Storage paths generated automatically.

Example

products/2026/05/uuid.webp

categories/uuid.webp

seo/default-og.webp

---

Administrator never edits storage paths manually.

---

# Soft Delete

Deleting media:

Marks record as deleted.

↓

Checks active usage.

↓

If no references remain:

Eligible for permanent deletion.

---

Physical file removal executed by background job.

---

# Media Library

Supports:

Search

Filtering

Sorting

Preview

Grid view

List view

Usage count

Duplicate detection

Unused media

Recently uploaded

Recently updated

---

# Search

Search by

Filename

ALT

Title

Caption

Mime type

Extension

---

# Performance

Metadata query

< 20 ms

Image lookup

< 30 ms

Library search

< 100 ms

Upload

Depends on file size.

---

# Security

Validate MIME type.

Validate extension.

Sanitize SVG.

Reject executable content.

Generate signed URLs for private assets.

Never trust client-provided metadata.

---

# Future Extensions

The architecture supports:

Image Editor

Crop Tool

Rotate

Background Removal

AI ALT Generator

OCR

Face Detection

Duplicate Suggestions

Versioning

CDN Integration

Without database redesign.