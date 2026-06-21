# Domain Model

Version: 1.0

Status: Approved

---

# Purpose

This document defines the business domains of the Headless SEO CMS Platform.

Every entity described here represents a business concept rather than a database table.

Database implementation must follow this domain model.

---

# Core Domains

The application consists of the following independent domains:

• Authentication

• Dashboard

• Products

• Categories

• Pages

• SEO

• Metadata

• Structured Data

• Media

• URL Management

• Redirects

• Robots

• Sitemap

• History

• Settings

Each domain owns its own business logic.

Domains communicate only through services.

Direct domain-to-domain coupling is forbidden.

---

# Product

The Product is one of the primary business entities.

Responsibilities:

- Store product information
- Manage multilingual content
- Manage inventory
- Manage pricing
- Manage media
- Manage SEO
- Track history
- Support future extensions

A Product must always belong to exactly one Category.

A Product may belong to one optional Subcategory.

Each Product owns one SEO profile.

Each Product owns many images.

Each Product owns many history records.

---

# Category

A Category organizes Products.

Responsibilities:

- Hierarchical structure
- Navigation
- SEO
- Slug management
- Breadcrumb generation

Categories support unlimited nesting.

A Category may have:

- one parent
- many children
- many products

---

# Page

Pages represent frontend content.

Current implementation contains only Home.

Architecture supports unlimited pages.

Each Page owns:

- metadata
- SEO
- structured data
- history

---

# SEO Profile

SEO is treated as an independent domain.

Every SEO Profile contains all SEO-related configuration for one entity.

Supported owners:

- Product
- Category
- Page
- Global Settings

A SEO Profile contains:

Meta Title

Meta Description

Keywords

Canonical URL

Robots

Open Graph

Twitter Card

Schema References

SEO Score

SEO Analysis

Verification State

---

# SEO Score

SEO Score is calculated, never manually entered.

Responsibilities:

- Aggregate rule results
- Store last analysis
- Provide score history
- Display recommendations

Each score contains:

Overall Score

Technical Score

Metadata Score

Content Score

Image Score

Structured Data Score

Accessibility Score

Performance Score

---

# SEO Rule

A SEO Rule describes one validation rule.

Examples:

Title too long

Missing Description

Duplicate Canonical

Broken Image

No ALT

Missing H1

Invalid Robots

Every Rule returns:

Passed

Warning

Critical

Suggestion

---

# Schema

Represents one JSON-LD document.

Supported types include:

Product

Organization

Breadcrumb

FAQ

WebSite

WebPage

Article

LocalBusiness

Service

Offer

Review

AggregateRating

SearchAction

Custom JSON-LD

A Schema belongs to one owner.

---

# Redirect

Represents one redirect rule.

Fields include:

Source URL

Destination URL

Status Code

Enabled

Created Date

Last Updated

Redirect types:

301

302

307

308

---

# Sitemap

Represents sitemap configuration.

Contains:

Included entity types

Excluded URLs

Priority rules

Change frequency

Image sitemap

Generated timestamp

---

# Robots

Represents robots.txt configuration.

Contains:

User-agent rules

Allow rules

Disallow rules

Host

Sitemap references

Custom directives

---

# Media Asset

Represents uploaded media.

Supported types:

Images

Future documents

Future videos

Metadata includes:

Dimensions

Size

Mime type

Generated formats

ALT text

Hash

Storage path

---

# History Entry

Represents one change.

Stores:

Timestamp

Entity

Field

Old Value

New Value

Operation

User

Every important mutation creates a History Entry.

---

# Settings

Represents global application configuration.

Divided into logical groups:

General

Localization

SEO

Appearance

Security

Storage

Scripts

Advanced

Each group evolves independently.

---

# Dashboard Metrics

Dashboard never stores business data.

It aggregates information from other domains.

Metrics include:

SEO Health

Product Count

Category Count

Broken Links

Missing Metadata

Storage Usage

Recent Changes

---

# Domain Relationships

Product

→ Category

→ SEO Profile

→ Media Assets

→ History

Category

→ Parent Category

→ Child Categories

→ Products

→ SEO Profile

Page

→ SEO Profile

→ History

SEO Profile

→ SEO Score

→ Schema

→ Redirects

→ Analysis

Settings

→ Global SEO

→ Robots

→ Sitemap

→ Scripts

---

# Business Rules

A Product cannot exist without a Category.

A Category cannot reference itself.

Slugs must be unique within their scope.

SEO Scores are read-only.

History records are immutable.

Schema must always be valid JSON.

Redirect loops are forbidden.

Robots configuration must always be syntactically valid.

Only published entities appear in the generated sitemap.

---

# Future Extension Points

The domain model must support future modules without refactoring:

- Multi-user roles
- API keys
- Plugin system
- Themes
- Public REST API
- GraphQL API
- AI integrations
- Marketplace
- Multi-tenant support

All future modules should integrate through services rather than modifying existing domain responsibilities.