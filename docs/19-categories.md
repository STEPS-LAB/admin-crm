# Categories Module Specification

Version: 1.0

Status: Approved

---

# Purpose

The Categories module manages the complete taxonomy of the catalog.

Unlike a traditional CMS where categories are only simple folders, this module is designed as a full-featured Taxonomy Management System (TMS).

Categories determine:

• Product organization

• URL hierarchy

• Breadcrumbs

• Navigation

• XML Sitemap

• SEO Structure

• Internal Linking

• Future Filtering System

The architecture must support unlimited growth without redesign.

---

# Design Goals

The Categories module must be:

✓ Fast

✓ Predictable

✓ Visual

✓ SEO-first

✓ Mobile-friendly

✓ Easy to maintain

✓ Enterprise-ready

---

# Taxonomy Architecture

Instead of one enormous category tree, the system supports multiple independent trees.

Example

Catalog

├── Electronics
├── Home
├── Furniture

Blog

├── News
├── Articles
├── Reviews

Services

├── Installation
├── Warranty
├── Delivery

Each tree behaves independently.

Each tree has its own:

Slug hierarchy

SEO

Navigation

Sorting

Permissions (future)

---

# Navigation

Sidebar

↓

Categories

↓

Category Trees

↓

Category List

↓

Category Editor

---

# Category Trees

Purpose

Allows administrators to organize large catalogs into several logical trees.

Benefits

Improved usability

Smaller navigation depth

Better scalability

Cleaner URLs

---

Each Tree

Displays

Name

Slug

Category Count

SEO Score

Created Date

Updated Date

---

Actions

Edit

Duplicate

Archive

Delete

---

# Category List

Layout

Desktop

Header

↓

Search

↓

Filters

↓

Tree View

↓

Details Panel

---

Mobile

Search

↓

Filters

↓

Accordion Tree

↓

Editor

---

# Tree View

Expandable

Collapsible

Virtualized

Supports

Unlimited nesting.

---

Each Node Displays

Expand Icon

Category Icon

Category Name

Product Count

Children Count

SEO Score

Visibility Badge

Status Badge

---

Hover Actions

Create Child

Edit

Duplicate

Move

Archive

Delete

Preview

---

Drag & Drop

Supported.

Administrator may

Move Category

↓

Change Parent

↓

Reorder

↓

Save Automatically

---

Protection

Prevent cyclic hierarchy.

Impossible cases

Parent becomes child.

Category moved into itself.

Category moved into descendant.

Validation blocks operation.

---

# Search

Real-time

Searches

Name

Slug

Description

SEO Title

SEO Description

---

# Filters

Tree

Status

Visibility

Language

Has Products

Has Children

SEO Score

Created Date

Updated Date

---

# Bulk Actions

Publish

Archive

Delete

Restore

Generate SEO

Generate Slugs

Move Parent

Change Visibility

Export

---

# Create Category

Button

New Category

↓

Open Category Editor

---

# Category Editor

Tabs

General

Content

Media

SEO

Advanced

History

Preview

---

Header

Contains

Category Name

Save

Publish

Preview

Back

More Actions

---

Autosave enabled.

Unsaved changes indicator visible.

---

# Tab 1 — General

Fields

Name UA

Required

---

Name EN

Required

---

Slug UA

Auto-generated

Editable

---

Slug EN

Auto-generated

Editable

---

Tree

Required

---

Parent Category

Optional

Tree Selector

---

Sort Order

Integer

---

Status

Draft

Published

Hidden

Archived

---

Visibility

Visible

Hidden

---

Icon

Media Picker

---

Color

Optional

HEX

---

Short Label

Optional

Used in Navigation.

---

Validation

Duplicate slug

Duplicate sibling

Invalid parent

Reserved words

---

# Tab 2 — Content

Fields

Description UA

Rich Text

---

Description EN

Rich Text

---

Short Description UA

---

Short Description EN

---

Content Score

Displayed in sidebar.

Word Count

Heading Count

Reading Time

Internal Links

Images

---

# Tab 3 — Media

Supports

Cover Image

Banner

Icon

Gallery

---

Uses Media Library.

Drag & Drop.

Image SEO.

Automatic optimization.

Responsive variants.

---

# Tab 4 — SEO

Every category has a dedicated SEO Profile.

Fields

Meta Title

Meta Description

Canonical

Robots

Open Graph

Twitter

JSON-LD

Breadcrumb Schema

Collection Schema

Custom Head Tags

---

SEO Score

Real-time

0–100

Uses same SEO Engine as Products.

---

SERP Preview

Desktop

Mobile

---

Recommendations

Critical

Warning

Suggestion

Passed

---

# Breadcrumb Builder

Visual Builder.

Example

Home

↓

Electronics

↓

Smartphones

↓

Android

---

Administrator may override automatically generated breadcrumbs.

---

# URL Preview

Automatically generated.

Example

example.com/electronics/smartphones/android

Updates instantly.

---

# Internal Linking

Shows

Parent

Children

Sibling Categories

Related Categories

Products

---

# Product Statistics

Displays

Total Products

Published Products

Draft Products

Average SEO Score

Average Product Score

Last Updated

---

# Tab 5 — Advanced

Fields

Include in Navigation

Include in Sitemap

Indexable

Searchable

Featured Category

Hide Empty Category

Custom Template (future)

Feature Flags

---

# Tab 6 — History

Timeline

↓

Diff Viewer

↓

Restore

Every modification logged.

---

# Tab 7 — Preview

Desktop

Tablet

Mobile

Google

Facebook

Twitter

Real Frontend Preview.

---

# Tree Operations

Supported

Expand All

Collapse All

Move Branch

Duplicate Branch

Delete Branch

Archive Branch

Export Branch

Import Branch

---

Moving a branch updates

Breadcrumbs

URLs

Internal Links

Sitemap

History

SEO Analysis

Automatically.

---

# Smart Validation

Prevent

Duplicate sibling names

Duplicate slug

Circular hierarchy

Too deep nesting (configurable)

Orphan category

Broken tree

---

# Tree Health

Dashboard Widget

Displays

Maximum Depth

Average Depth

Orphan Categories

Duplicate Names

Duplicate Slugs

Broken Parents

Hidden Parents

Published Children of Hidden Parent

---

Overall Tree Health Score

0–100

---

# Category SEO

Additional Analysis

Too many child categories

Too few products

No description

No images

Missing schema

Duplicate metadata

Weak hierarchy

Missing breadcrumbs

---

# Category Score

Calculated independently.

Displayed

Tree

Category List

Editor

Dashboard

---

# Server Actions

createCategory()

updateCategory()

deleteCategory()

archiveCategory()

restoreCategory()

duplicateCategory()

moveCategory()

sortCategories()

validateTree()

generateBreadcrumbs()

generateCategorySEO()

previewCategory()

---

# Repository Layer

CategoryRepository

↓

SeoRepository

↓

MediaRepository

↓

HistoryRepository

---

# Database Flow

Validation

↓

Transaction

↓

Categories

↓

Translations

↓

SEO

↓

Media Usage

↓

History

↓

Commit

↓

Cache Invalidation

↓

Frontend Refresh

---

# Performance

Tree Loading

<300ms

Editor

<200ms

Drag & Drop

<100ms

Search

<150ms

Preview

<300ms

---

# Accessibility

WCAG 2.2 AA

Keyboard Navigation

Screen Reader Support

Tree Navigation

ARIA Tree Roles

Focus Management

---

# Acceptance Criteria

✓ Unlimited category nesting supported.

✓ Multiple independent trees supported.

✓ Drag & Drop updates hierarchy instantly.

✓ Circular references impossible.

✓ Breadcrumbs generated automatically.

✓ Every category has a complete SEO profile.

✓ Tree Health Score calculated automatically.

✓ Product statistics updated in real time.

✓ History records created for every change.

✓ Mobile tree navigation fully functional.

✓ Supports catalogs containing over 100,000 categories.