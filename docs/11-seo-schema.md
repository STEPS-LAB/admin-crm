# SEO Database Schema

Version: 1.0

Status: Approved

---

# Purpose

The SEO Domain is responsible for every search engine optimization capability of the platform.

SEO is an independent domain.

Products, Categories and Pages never store SEO fields directly.

Instead they reference a SEO Profile.

This architecture allows every future entity to become SEO-enabled without redesigning the database.

---

# Domain Overview

SEO Domain

├── SEO Profile
├── Metadata
├── Canonical
├── Robots
├── OpenGraph
├── Twitter Card
├── JSON-LD Schema
├── Breadcrumb Schema
├── Redirect Rules
├── Hreflang
├── Verification
├── SEO Templates
├── SEO Score
├── SEO Analysis
├── Internal Linking
├── Custom Head Tags
├── Sitemap Configuration
├── Robots Configuration
└── SEO History

---

# Core Entity: SEO Profile

Purpose

SEO Profile represents the SEO identity of a business entity.

Supported owners

Product

Category

Page

Brand

Collection

Tag

Landing Page

Future custom entities

---

Table

seo_profiles

---

Primary Key

id UUID

---

Fields

id

owner_type

ENUM

owner_id

UUID

language

ENUM

uk

en

is_indexable

BOOLEAN

Default true

priority

NUMERIC(2,1)

Default

0.5

change_frequency

ENUM

always

hourly

daily

weekly

monthly

yearly

never

created_at

updated_at

deleted_at

---

Unique Constraint

(owner_type, owner_id, language)

---

Indexes

owner_type

owner_id

language

is_indexable

---

Relationships

SEO Profile

↓

Metadata

↓

OpenGraph

↓

Twitter

↓

Canonical

↓

Robots

↓

JSON-LD

↓

SEO Score

↓

SEO Analysis

↓

History

---

# Entity: Metadata

Purpose

Stores classic metadata.

---

Fields

seo_profile_id

meta_title

meta_description

meta_keywords

meta_author

meta_generator

application_name

theme_color

viewport

referrer

creator

publisher

copyright

rating

distribution

revisit_after

subject

abstract

news_keywords

category

classification

---

Rules

Maximum title length configurable.

Maximum description length configurable.

Real-time validation.

Automatic score calculation.

---

# Entity: Canonical

Fields

seo_profile_id

canonical_url

auto_generate

BOOLEAN

force_https

BOOLEAN

remove_trailing_slash

BOOLEAN

lowercase

BOOLEAN

append_locale

BOOLEAN

---

Purpose

Canonical URL generation.

---

# Entity: Robots

Fields

seo_profile_id

index

follow

archive

snippet

image_index

translate

max_snippet

max_video_preview

max_image_preview

custom_directives

---

Output

Automatically generates robots meta tag.

---

# Entity: Open Graph

Fields

seo_profile_id

og_title

og_description

og_image

og_image_width

og_image_height

og_type

og_locale

og_site_name

og_url

video

audio

determiner

ttl

---

Preview

Facebook Preview

LinkedIn Preview

Discord Preview

---

# Entity: Twitter Card

Fields

seo_profile_id

card_type

title

description

image

creator

site

image_alt

player

app_name

iphone_app

android_app

---

Supported Cards

Summary

Summary Large Image

Player

App

---

# Entity: Structured Data

Purpose

Stores JSON-LD documents.

---

Table

schema_documents

---

Fields

id

seo_profile_id

schema_type

enabled

priority

json

validation_status

created_at

updated_at

---

Supported Types

Product

Organization

WebSite

WebPage

FAQ

Breadcrumb

Person

Review

AggregateRating

Offer

LocalBusiness

Service

Article

NewsArticle

VideoObject

ImageObject

SearchAction

Event

SoftwareApplication

Recipe

Book

Course

HowTo

Dataset

MedicalEntity

Custom JSON-LD

---

Rules

Unlimited schemas per entity.

Execution order configurable.

JSON validation required.

---

# Entity: Redirect Rule

Purpose

Manages URL redirects.

---

Fields

source

destination

status_code

enabled

hits

last_hit_at

created_at

updated_at

---

Supported Codes

301

302

307

308

---

Rules

Prevent redirect loops.

Detect duplicate redirects.

Track redirect usage.

---

# Entity: Hreflang

Fields

seo_profile_id

language

url

is_default

---

Purpose

Generate alternate language links.

---

# Entity: Verification Codes

Stores

Google Search Console

Bing Webmaster

Pinterest

Yandex

Facebook Domain Verification

Custom verification

---

# Entity: Custom Head Tags

Purpose

Allows advanced users to inject custom tags.

Supported

meta

link

script

style

noscript

base

custom

---

Validation

Whitelist allowed tags.

Prevent unsafe scripts.

---

# Entity: SEO Template

Purpose

Automatically generates metadata.

Examples

{{product.name}}

{{category.name}}

{{brand.name}}

{{site.name}}

{{price}}

{{sku}}

{{year}}

{{language}}

{{custom.field}}

---

Supports

Conditional placeholders

Fallback values

Localization

---

# Entity: SEO Analysis

Purpose

Stores latest analysis.

Fields

overall_score

technical_score

metadata_score

schema_score

content_score

images_score

performance_score

accessibility_score

warnings

errors

recommendations

last_scan_at

---

History retained.

---

# Entity: SEO Score History

Purpose

Tracks SEO score evolution.

Stores

Previous score

New score

Changed fields

Timestamp

---

# Entity: Internal Linking

Purpose

Stores manually curated internal links.

Supports

Related Products

Related Categories

Landing Pages

Manual anchors

Automatic suggestions

---

# Entity: Sitemap Configuration

Stores

Priority

Change frequency

Image sitemap

Video sitemap

News sitemap

Exclude

Include

Auto generation

---

# Entity: Robots Configuration

Stores

User agents

Allow

Disallow

Host

Sitemap references

Custom directives

---

# Business Rules

Every SEO Profile must belong to exactly one business entity.

A deleted business entity automatically archives its SEO Profile.

Metadata validation runs before publishing.

Structured Data must always contain valid JSON.

Canonical URLs must be absolute.

Redirect loops are forbidden.

Only enabled schemas are rendered.

All generated tags must be server-side rendered.

---

# Performance

Metadata retrieval

< 20 ms

SEO Profile retrieval

< 50 ms

Schema generation

< 100 ms

SEO Analysis

Asynchronous where possible.

---

# Future Extensions

Architecture supports

AI-generated metadata

AI schema generation

Automatic keyword clustering

Content optimization

SERP tracking

Backlink monitoring

Search Console integration

Google Analytics integration

Bing Webmaster integration

Custom SEO plugins

SEO API

Without schema redesign.