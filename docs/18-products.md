# Products Module Specification

Version: 1.0

Status: Approved

---

# Purpose

The Products module is the central business module of the CMS.

It allows administrators to create, edit, organize, optimize and publish products while maintaining complete SEO control.

This module must be designed for speed, scalability and ease of use.

Every action should require as few clicks as possible.

The interface should resemble a premium SaaS product rather than a traditional CMS.

The Products module integrates with:

• Catalog Domain

• SEO Engine

• Media Library

• History System

• Settings

• Category Manager

• Translation System

---

# Design Goals

The module must prioritize:

✓ Speed

✓ Simplicity

✓ Predictability

✓ Discoverability

✓ Accessibility

✓ Mobile-first

✓ SEO-first

✓ Future scalability

---

# User Stories

As an administrator I want to:

Create products quickly.

Duplicate existing products.

Edit all product information.

Manage SEO.

Upload images.

Assign categories.

Preview changes.

Publish immediately.

Save drafts.

Restore previous versions.

Bulk edit products.

Delete products safely.

Search products instantly.

Filter products efficiently.

---

# Navigation

Sidebar

↓

Products

↓

Product List

↓

Create Product

↓

Edit Product

---

# Product List

Purpose

The Product List is the main management screen.

It should allow administrators to manage thousands of products comfortably.

---

# Layout

Desktop

┌──────────────────────────────────────────────────────────┐

Header

Filters

Search

Bulk Actions

----------------------------------------------------------

Table

----------------------------------------------------------

Pagination

└──────────────────────────────────────────────────────────┘

---

Mobile

Header

↓

Search

↓

Filters

↓

Cards

↓

Pagination

---

# Header

Contains

Page Title

Products

Product Count

Primary Button

+ New Product

---

# Search

Real-time.

Debounce

300ms.

Search Fields

Product Name

Slug

SKU

Barcode

Category

Brand

SEO Title

---

Search is case insensitive.

Supports partial matching.

---

# Filters

Status

Published

Draft

Archived

Hidden

---

Category

Tree selector.

Supports nested categories.

---

Brand

Dropdown.

---

Language

UA

EN

---

Stock

In Stock

Out of Stock

Preorder

---

SEO Score

0-20

21-40

41-60

61-80

81-100

---

Created Date

Date Range

---

Updated Date

Date Range

---

Price

Range Slider

---

Has Images

Yes

No

---

Has SEO

Yes

No

---

Has Schema

Yes

No

---

Has ALT

Yes

No

---

Published

Yes

No

---

# Table

Columns

Checkbox

Image

Product Name

SKU

Category

Price

Status

SEO Score

Updated

Actions

---

# Column

Checkbox

Supports bulk selection.

---

# Column

Image

Shows

Cover Image

Rounded

8px

Lazy loaded.

---

If missing

Placeholder Image.

---

# Column

Product Name

Displays

Name

Slug

Language Badge

---

Click

Open editor.

---

# Column

SKU

Monospace font.

Copy button on hover.

---

# Column

Category

Displays

Category

↓

Subcategory

---

# Column

Price

Current Price

Old Price

Currency

---

# Column

Status

Badge

Draft

Published

Archived

Hidden

---

# Column

SEO Score

Circular Indicator

0-100

Hover

Opens summary.

---

Colors

Red

Orange

Yellow

Green

Emerald

---

# Column

Updated

Relative Time

Example

2 hours ago

Hover

Exact timestamp.

---

# Actions

Edit

Duplicate

Preview

Publish

Archive

Delete

---

Actions hidden inside dropdown on mobile.

---

# Bulk Actions

Publish

Unpublish

Archive

Delete

Move Category

Generate Metadata

Generate Slug

Generate Schema

Assign Category

Assign Brand

Export

---

Bulk actions require confirmation.

---

# Pagination

Default

25

Options

10

25

50

100

---

Remember page size.

---

# Empty State

Illustration

↓

No Products

↓

Create First Product

Button

---

# Loading State

Skeleton Table

---

# Error State

Friendly message

Retry

---

# Create Product

Click

↓

Open Product Editor

# Tab 2 — Content

Purpose

Contains all textual information that is displayed on the website.

The editor must support multilingual content.

The interface must minimize switching between languages.

---

Layout

Desktop

┌──────────────────────────────────────────────┐

Language Switch

----------------------------------------------

Short Description

----------------------------------------------

Description

----------------------------------------------

Specifications (Future)

----------------------------------------------

Content Analysis

└──────────────────────────────────────────────┘

---

Mobile

Language Tabs

↓

Short Description

↓

Editor

↓

SEO Warnings

---

Languages

Supported

🇺🇦 Ukrainian

🇬🇧 English

---

Switching language must NOT reload the page.

The application keeps both translations in memory until Save.

---

Fields

Short Description

UA

Required

Maximum

500 characters

Live counter

Displayed below the field.

---

Short Description

EN

Required

Maximum

500 characters

---

Description

UA

Rich Text Editor

Required

---

Description

EN

Rich Text Editor

Required

---

Rich Text Editor

Technology

Tiptap

Configured for SSR compatibility.

---

Supported Formatting

Paragraph

Heading 1

Heading 2

Heading 3

Heading 4

Bold

Italic

Underline

Strike

Bullet List

Numbered List

Task List

Blockquote

Table

Horizontal Rule

Code Block

Inline Code

Links

Images

Video Placeholder

Callout

Divider

Undo

Redo

---

Paste Behavior

Paste from

Word

Google Docs

Websites

Markdown

HTML

Automatically clean:

Inline styles

Microsoft Office markup

Empty tags

Unused spans

Deprecated HTML

---

Supported Keyboard Shortcuts

Ctrl+B

Ctrl+I

Ctrl+Z

Ctrl+Shift+Z

Ctrl+K

Tab

Shift+Tab

---

Auto Formatting

Convert

--

↓

—

---

Replace

Straight quotes

↓

Smart quotes

Optional

---

Multiple spaces

↓

Single space

---

Trailing spaces removed automatically.

---

Image Embedding

Administrator can insert

Existing Media Library image

or

Upload new image.

---

Image Settings

ALT

Title

Caption

Width

Alignment

Lazy Load

Priority

---

Every inserted image automatically references Media Library.

Images are never duplicated.

---

Links

Supports

Internal Links

External Links

Anchor Links

Email Links

Telephone Links

---

Internal Link Picker

Search

↓

Products

↓

Categories

↓

Pages

↓

Select

↓

Insert Link

---

External Links

Automatically suggest

Open in new tab

Add rel="noopener"

Add rel="nofollow"

Add rel="sponsored"

Add rel="ugc"

---

Tables

Supports

Responsive layout

Header row

Merge cells

Alignment

Copy/Paste

---

Code Blocks

Supported Languages

HTML

CSS

JavaScript

TypeScript

JSON

SQL

Bash

PHP

---

Content Validation

Runs continuously.

Checks

Missing title

Missing description

Empty headings

Multiple H1

Broken heading hierarchy

Very short content

Very long content

Broken links

Duplicate content

Missing images

Missing ALT

---

Readability Analysis

Calculates

Average sentence length

Paragraph length

Heading distribution

Reading complexity

Passive voice (future)

---

Content Score

Displayed in sidebar.

0–100

Updates in real time.

---

Sidebar

Always visible.

Contains

Content Score

Word Count

Character Count

Paragraph Count

Heading Count

Image Count

Internal Links

External Links

Estimated Reading Time

---

Word Count

Per language.

---

Character Count

Per language.

---

Estimated Reading Time

Example

3 min read

---

Heading Structure

Visual Tree

H1

↓

H2

↓

H3

↓

H4

Administrator immediately sees incorrect hierarchy.

---

Duplicate Content Detection

Warn when

UA and EN content identical.

Duplicate paragraph detected.

Description copied from another product.

---

Unsaved Changes

Header indicator

● Unsaved Changes

Appears immediately after modification.

---

Autosave

Enabled

Default

ON

---

Interval

30 seconds

or

After user stops typing

3 seconds

---

Autosave Indicator

Saving...

↓

Saved

↓

Last saved

12:41:08

---

If save fails

Red indicator

Retry automatically.

---

Offline Support

If connection lost

Changes stored locally.

When connection returns

Synchronize automatically.

---

Conflict Resolution

If another administrator changed the product

Show comparison dialog.

Administrator chooses

Keep Mine

Use Server Version

Merge Manually

---

Validation Rules

Before Publish

Required

UA Name

EN Name

UA Description

EN Description

Category

SKU

Price

SEO Profile Exists

Slug Exists

No duplicate slug

---

Warnings

Do not block publishing

Missing images

Missing ALT

Short description

Low content score

Low SEO score

---

Blocking Errors

Duplicate SKU

Duplicate Slug

Invalid Category

Invalid Price

Missing Required Fields

Database Error

---

Save Flow

User edits

↓

Local Validation

↓

Autosave Queue

↓

Server Action

↓

Database Transaction

↓

History Record

↓

SEO Recalculation

↓

Success Notification

---

Server Actions

saveDraft()

publishProduct()

updateContent()

validateContent()

autosaveDraft()

calculateContentScore()

---

Database Updates

Tables

products

↓

product_translations

↓

history_entries

↓

seo_analysis

---

Notifications

Success

Draft saved.

Product published.

Content updated.

---

Warning

Content score is low.

SEO score decreased.

Missing translation.

---

Error

Unable to save.

Retry.

---

Performance

Editor loads

<200ms

Autosave

<500ms

Validation

Real-time

No noticeable UI lag.

---

Accessibility

WCAG AA

Keyboard navigation

ARIA labels

Screen reader compatible

Focus management

Visible focus indicators

---

Acceptance Criteria

✓ Rich Text Editor supports all required formatting.

✓ Switching languages never reloads the page.

✓ Autosave never interrupts typing.

✓ Validation updates in real time.

✓ Content score recalculates automatically.

✓ Word count updates instantly.

✓ Unsaved changes indicator works correctly.

✓ All content is stored transactionally.

✓ History entry created after every successful save.

✓ Mobile editing experience remains fully functional.

# Tab 3 — Media

Purpose

The Media tab manages every visual asset associated with a product.

Unlike traditional CMS implementations where images are merely uploaded, this module functions as an integrated Product Asset Management (PAM) system.

Every uploaded file becomes a reusable Media Asset managed by the global Media Library.

Images are never duplicated.

The same asset may be attached to multiple entities.

---

Design Goals

Fast upload

Simple organization

Professional asset management

SEO-first

Responsive

Future-proof

---

Layout

Desktop

┌───────────────────────────────────────────────────────────────┐

Upload Zone

---------------------------------------------------------------

Cover Image

---------------------------------------------------------------

Gallery

---------------------------------------------------------------

Selected Image Properties

---------------------------------------------------------------

SEO Analysis

└───────────────────────────────────────────────────────────────┘

---

Mobile

Upload

↓

Cover

↓

Gallery

↓

Properties

↓

SEO Score

---

Supported Formats

Images

JPG

JPEG

PNG

WEBP

AVIF

SVG

GIF

Future

PDF

MP4

WEBM

---

Upload Methods

Drag & Drop

Click Upload

Paste Image (Clipboard)

Select From Media Library

Bulk Upload

---

Drag & Drop

Dragging files over the page displays:

Highlighted Drop Zone

↓

Animated Border

↓

Upload Hint

---

Multiple file upload supported.

---

Clipboard Support

Ctrl + V

↓

Automatically uploads image.

---

Maximum Upload Size

Default

25 MB

Configurable in Settings.

---

Upload Queue

Each file displays

Thumbnail

Filename

Progress

Compression Status

Optimization Status

Success

Failure

Retry

Cancel

---

Upload Flow

User

↓

Client Validation

↓

Upload Queue

↓

Supabase Storage

↓

Optimization Worker

↓

Metadata Extraction

↓

Database

↓

Gallery

---

Client Validation

Validate

Extension

Mime Type

Maximum Size

Corrupted Files

Duplicate Selection

---

Duplicate Detection

Calculate SHA-256

↓

Existing Asset?

↓

Yes

Reuse Existing Asset

↓

No

Upload

---

Gallery

Grid Layout

Responsive

Gap

12px

Border Radius

10px

---

Each Card Displays

Thumbnail

Cover Badge

Image Size

Dimensions

Usage Count

Optimization Badge

SEO Badge

---

Hover Actions

Preview

Edit

Replace

Set Cover

Copy URL

Open Media Library

Delete

---

Selecting Image

Displays Properties Panel.

---

Properties Panel

Image Preview

↓

Filename

↓

Dimensions

↓

File Size

↓

Mime Type

↓

Created Date

↓

Optimization

↓

SEO Fields

---

SEO Fields

ALT (UA)

ALT (EN)

Title (UA)

Title (EN)

Caption (UA)

Caption (EN)

Copyright

Photographer

License

---

Every field supports

Character Counter

Real-time Save

Validation

---

Image Analysis

Automatically calculates

Width

Height

Aspect Ratio

Orientation

File Size

Compression Ratio

Color Palette

Dominant Color

BlurHash

---

Optimization Status

Displays

Original

Optimized

WebP

AVIF

Thumbnail

Responsive

---

Optimization Pipeline

Original Upload

↓

Strip Metadata

↓

Auto Rotate

↓

Compress

↓

Generate Thumbnail

↓

Generate WebP

↓

Generate AVIF

↓

Generate Responsive Sizes

↓

Store Metadata

---

Original image is always preserved.

---

Responsive Variants

Thumbnail

320px

640px

960px

1280px

1920px

Automatically generated.

---

Cover Image

Exactly one image may be Cover.

Changing Cover

↓

Updates instantly

↓

History Entry

↓

Frontend Preview

---

Gallery Sorting

Drag & Drop

↓

Sort Order Saved

↓

Frontend Updated

---

Gallery supports

Keyboard Sorting

Touch Sorting

Mouse Sorting

---

Replace Image

Administrator

↓

Replace

↓

New Upload

↓

Keep Metadata

↓

History Record

↓

Old Asset Optional Delete

---

Delete Image

Confirmation Dialog

↓

Remove Usage

↓

Still Used?

↓

Yes

Keep Asset

↓

No

Soft Delete

---

Image Preview

Modal

Supports

Zoom

Pan

Keyboard Navigation

Fullscreen

Next

Previous

Download Original

Open Asset

---

Media Library Integration

Click

Select Existing

↓

Search

↓

Filter

↓

Choose Asset

↓

Attach

---

Media Library Filters

Filename

Date

Extension

Orientation

Resolution

Unused

Recently Uploaded

Optimized

Missing ALT

---

Image SEO Score

Each image receives

0–100

---

Calculation

ALT

20%

Title

10%

Caption

10%

Filename

10%

Compression

15%

Responsive Variants

10%

WebP

10%

AVIF

10%

Dimensions

10%

Lazy Loading

5%

---

Color Indicator

Red

Orange

Yellow

Green

Emerald

---

Image Recommendations

Missing ALT

Missing Caption

Large File

Missing WebP

Missing AVIF

No Thumbnail

Incorrect Aspect Ratio

Filename not optimized

---

Automatic Filename Generator

Input

Apple iPhone 17 Pro Max

↓

Output

apple-iphone-17-pro-max.webp

Supports

UA Transliteration

EN Normalization

Reserved Character Removal

Duplicate Detection

---

EXIF Processing

Extract

Camera

Lens

Date

GPS

Orientation

---

GPS Data

Removed by default.

Privacy First.

---

Image Compression

Target Quality

90%

Configurable

Never upscale images.

---

Lazy Loading

Enabled by default.

Exceptions

Cover Image

Hero Images

Open Graph Images

---

Priority Images

Administrator may mark

Priority

↓

Preload on Frontend

---

Accessibility

Checks

Missing ALT

Duplicate ALT

Generic ALT

Image-only Product

Low Contrast Placeholder

---

Bulk Image Actions

Generate ALT

Optimize

Delete

Replace

Download

Move

Attach

Detach

Regenerate Variants

---

Server Actions

uploadMedia()

attachMedia()

detachMedia()

setCoverImage()

replaceMedia()

deleteMedia()

sortGallery()

optimizeMedia()

generateVariants()

calculateImageSeoScore()

---

Database Tables

media_assets

↓

media_usage

↓

history_entries

↓

seo_analysis

---

Notifications

Upload Complete

Optimization Complete

Variant Generation Complete

Image Attached

Image Deleted

Image Replaced

Optimization Failed

---

Performance

Upload

Streaming

Parallel Uploads

Maximum Parallel Uploads

5

Lazy Loading Required

Gallery Virtualization

Enabled

---

Caching

Thumbnail Cache

Browser Cache

CDN Ready

---

Responsive Behaviour

Desktop

5–8 Columns

Tablet

3–4 Columns

Mobile

2 Columns

Properties Panel

↓

Bottom Sheet

---

Accessibility

WCAG AA

Keyboard Navigation

Screen Reader Support

Focus Trapping

ARIA Labels

---

Acceptance Criteria

✓ Drag & Drop works across all modern browsers.

✓ Clipboard paste uploads images.

✓ Gallery sorting updates instantly.

✓ Cover image updates frontend preview.

✓ Images are optimized automatically.

✓ WebP and AVIF generated asynchronously.

✓ Duplicate uploads reuse existing assets.

✓ Every image supports multilingual metadata.

✓ Image SEO Score updates automatically.

✓ Responsive variants generated successfully.

✓ Upload progress visible in real time.

✓ Mobile upload experience fully supported.

✓ History records created for every media operation.

# Tab 4 — SEO

Purpose

The SEO tab is the most advanced section of the Product Editor.

It integrates directly with the SEO Engine and provides complete control over every SEO-related aspect of the product.

Unlike traditional CMS platforms, every SEO component is editable independently while still supporting automatic generation through templates and automation rules.

The interface must be suitable for both beginner users and advanced SEO specialists.

---

Design Principles

• Everything important visible immediately

• Advanced settings hidden behind expandable sections

• Live Preview everywhere

• Real-time validation

• Real-time SEO Score

• No page refresh

• No hidden save buttons

• Every change reflected instantly

---

Layout

Desktop

┌──────────────────────────────────────────────────────────────┐

SEO Score

SERP Preview

--------------------------------------------------------------

Metadata

--------------------------------------------------------------

Open Graph

--------------------------------------------------------------

Twitter Card

--------------------------------------------------------------

Canonical

--------------------------------------------------------------

Robots

--------------------------------------------------------------

Structured Data

--------------------------------------------------------------

Advanced SEO

--------------------------------------------------------------

Recommendations

└──────────────────────────────────────────────────────────────┘

---

Mobile

SEO Score

↓

Preview

↓

Metadata

↓

OG

↓

Twitter

↓

Canonical

↓

Schema

↓

Recommendations

---

SEO Sidebar

Always visible on Desktop.

Sticky.

Displays

Overall Score

Metadata Score

Schema Score

Image Score

Technical Score

Content Score

URL Score

Internal Linking Score

Accessibility Score

---

Overall Score

0–100

Updates immediately after every change.

Animated.

---

Score Distribution

Metadata

20%

Content

15%

Structured Data

20%

Images

10%

Open Graph

5%

Twitter

5%

Canonical

5%

Robots

5%

URL

5%

Internal Linking

5%

Accessibility

5%

---

Score Colors

0–39

Critical

40–59

Poor

60–79

Good

80–89

Very Good

90–100

Excellent

---

SEO Health Summary

Displays

Critical Issues

Warnings

Suggestions

Passed Checks

---

Clicking an item scrolls to the related section.

---

SECTION

Metadata

Fields

Meta Title UA

Meta Title EN

Meta Description UA

Meta Description EN

Keywords

Author

Publisher

Copyright

Robots Override

---

Meta Title

Maximum

60 characters

Pixel Width

580px

Real-time counter.

Color Indicator

Green

Optimal

Yellow

Near limit

Red

Too long

---

Meta Description

Maximum

160 characters

Pixel Width

920px

Live validation.

---

Meta Keywords

Optional.

Disabled by default.

Available for legacy compatibility.

---

Template Variables

Administrator may insert

{{product.name}}

{{category.name}}

{{brand.name}}

{{price}}

{{sku}}

{{site.name}}

{{currency}}

{{year}}

{{stock}}

{{custom.field}}

Variables rendered instantly.

---

Live SERP Preview

Google Desktop

Google Mobile

Supports

Title

Description

Breadcrumb

URL

Rich Snippet Preview

Date

Site Name

---

Preview updates on every keystroke.

---

Pixel Width Analyzer

Instead of only counting characters

Calculate rendered width.

Warn

Too wide

Too narrow

---

Duplicate Detection

Warn if

Meta Title duplicated

Description duplicated

Canonical duplicated

Slug duplicated

Across all products.

---

SECTION

URL

Slug UA

Slug EN

---

Auto Generated

↓

Transliteration

↓

Lowercase

↓

Replace spaces

↓

Remove special symbols

↓

Uniqueness validation

---

Administrator may manually override.

---

Reserved Words

Reject

admin

login

dashboard

api

system

robots

sitemap

etc.

Configurable.

---

URL Preview

Displays final URL.

https://example.com/en/apple-iphone-17

---

SECTION

Canonical

Mode

Automatic

Manual

Disabled

---

Automatic

Generated from routing.

---

Manual

Administrator specifies canonical URL.

---

Validation

Absolute URL

HTTPS

No loops

No invalid characters

---

SECTION

Robots

Checkboxes

Index

Follow

NoArchive

NoSnippet

NoImageIndex

Max Snippet

Max Video Preview

Max Image Preview

Custom Directives

---

Preview

<meta name="robots">

Generated live.

---

SECTION

Open Graph

Fields

Title

Description

Image

Type

Locale

Site Name

URL

---

Image Picker

Uses Media Library.

Shows

Dimensions

Aspect Ratio

File Size

SEO Score

---

Preview

Facebook

LinkedIn

Discord

Slack

Messenger

---

SECTION

Twitter Card

Card Type

Summary

Summary Large Image

Player

App

---

Fields

Title

Description

Image

Creator

Site

Image ALT

---

Preview

Native Twitter Preview.

---

SECTION

Structured Data

Builder Mode

Simple

Advanced

Raw JSON

---

Supported Schemas

Product

Offer

AggregateRating

Review

Organization

Brand

Breadcrumb

FAQ

WebPage

WebSite

ImageObject

VideoObject

Person

SearchAction

Custom JSON-LD

---

Each Schema

Enabled Toggle

Priority

Validation Status

Expand

Duplicate

Delete

---

Raw JSON Editor

Syntax Highlighting

Auto Formatting

Validation

Error Highlighting

Line Numbers

Copy

Format

---

Schema Validation

Checks

Required fields

JSON syntax

Duplicate schema

Invalid properties

Google Rich Result compatibility

---

SECTION

Hreflang

Displays

UA

EN

Default

URL

Validation

---

SECTION

Internal Linking

Suggestions

Related Products

Related Categories

Manual Links

Priority

Anchor Text

---

SECTION

Redirect Suggestions

If slug changed

System suggests

301 Redirect

Administrator

Accept

Decline

Custom Destination

---

SECTION

Image SEO

Displays

Images without ALT

Images without Caption

Large Images

Missing WebP

Missing AVIF

Duplicate ALT

---

SECTION

Advanced SEO

Custom Head Tags

Meta Tags

Additional Link Tags

Preload

Prefetch

DNS Prefetch

Preconnect

Custom JSON

---

SECTION

SEO Recommendations

Grouped

Critical

Warning

Suggestion

Passed

---

Each Recommendation

Icon

Title

Description

Why It Matters

How To Fix

Fix Automatically (when possible)

Go To Field

---

Example

Missing Meta Description

↓

Why

Search engines may generate random snippets.

↓

Fix

Write between 140–160 characters.

↓

Button

Generate From Template

---

Live Validation

Runs after every modification.

No manual refresh.

---

Autosave

Integrated with Product Editor.

SEO changes saved together with product transaction.

---

History

Every SEO change recorded.

Supports comparison.

Supports rollback.

---

Server Actions

updateMetadata()

updateSlug()

updateCanonical()

updateRobots()

updateOpenGraph()

updateTwitter()

updateSchema()

validateSeo()

calculateSeoScore()

generateMetadata()

generateSchema()

generateCanonical()

---

Database Tables

seo_profiles

↓

metadata

↓

canonical

↓

robots

↓

schema_documents

↓

history_entries

↓

seo_analysis

---

Performance

SEO Score

<100ms

SERP Preview

Real-time

Schema Validation

<300ms

---

Accessibility

Keyboard Accessible

ARIA Labels

Screen Reader Support

Visible Focus

---

Acceptance Criteria

✓ Metadata validates in real time.

✓ Google preview updates instantly.

✓ Pixel width calculation accurate.

✓ Open Graph preview reflects selected image.

✓ Twitter preview updates immediately.

✓ Canonical validation prevents invalid URLs.

✓ Robots directives generate correct meta tags.

✓ JSON-LD validates before save.

✓ Hreflang generated automatically.

✓ Redirect suggestion appears after slug change.

✓ SEO Score recalculates automatically.

✓ Recommendations prioritized by severity.

✓ All changes included in history.

✓ No SEO change requires page reload.

# Tab 5 — Advanced

Purpose

The Advanced tab contains technical product settings that are not required during daily content editing but provide full control for advanced users and developers.

This tab should remain clean and organized using collapsible sections.

Default state:

All sections collapsed except the first one.

---

Layout

Desktop

General Settings

↓

Visibility

↓

Publication

↓

Identifiers

↓

Custom Fields

↓

Feature Flags

↓

Developer Options

↓

Danger Zone

---

# Section — Visibility

Fields

Visibility

Public

Hidden

Private

Password Protected (Future)

---

Search Visibility

Visible

Hidden

---

Include in Navigation

Boolean

---

Include in XML Sitemap

Boolean

Overrides global setting if enabled.

---

Include in Internal Search

Boolean

---

Featured Product

Boolean

---

New Product Badge

Boolean

---

Sale Badge

Boolean

---

Custom Badge

Optional

Text

Color

Icon

---

# Section — Publication

Fields

Publish Date

Datetime

---

Expiration Date

Optional

---

Scheduled Publication

Supported.

Background scheduler publishes automatically.

---

Scheduled Unpublish

Supported.

---

Publication Status

Draft

Scheduled

Published

Archived

Hidden

---

# Section — Product Identifiers

Fields

Internal ID

Read-only

---

UUID

Read-only

---

SKU

Editable

Unique

---

Barcode

Editable

---

EAN

Optional

---

GTIN

Optional

---

MPN

Optional

---

Manufacturer Code

Optional

---

# Section — Custom Fields

Purpose

Allows adding additional business-specific information without database redesign.

Supported Types

Text

Textarea

Number

Decimal

Boolean

Date

Datetime

Select

Multi Select

Color

URL

JSON

---

Fields stored as JSONB.

Validation generated dynamically.

---

# Section — Feature Flags

Administrator may enable

Allow Reviews

Allow Rating

Allow Questions

Allow Wishlist

Allow Compare

Allow Share

Allow Purchase

Allow Stock Notifications

---

These flags are frontend-ready.

---

# Section — Developer Options

Canonical Override

Developer Notes

Internal Tags

Debug Information

Rendering Strategy

Experimental Flags

---

Visible only in Developer Mode.

---

# Section — Danger Zone

Collapsible.

Red border.

Contains

Archive Product

Soft Delete Product

Restore Product

Duplicate Product

Export JSON

Export Markdown

Reset SEO

Reset Slug

Reset Metadata

---

Every destructive action requires confirmation.

---

Confirmation Dialog

Displays

Product Name

Consequences

Confirmation Checkbox

Danger Button

---

# Tab 6 — History

Purpose

Displays every modification ever made to the product.

History is immutable.

---

Layout

Timeline

Newest First

↓

Expandable Entry

↓

Diff Viewer

---

History Entry

Displays

Date

Administrator

Action

Changed Fields

Summary

---

Actions

Created

Updated

Published

Archived

Deleted

Restored

SEO Updated

Media Updated

Category Changed

Slug Changed

Schema Updated

---

Diff Viewer

Split View

Before

↓

After

---

Highlights

Added

Green

Modified

Yellow

Removed

Red

---

Supported Data Types

Text

JSON

Arrays

Numbers

Booleans

---

Filtering

Date

Administrator

Action

Keyword

---

Search

Searches

Summary

Field Name

Changed Value

---

Restore

Administrator selects entry

↓

Preview Changes

↓

Restore

↓

Creates New History Record

Original history never changes.

---

# Tab 7 — Preview

Purpose

Shows how the product will appear on the frontend before publishing.

---

Preview Modes

Desktop

Tablet

Mobile

---

Preview Types

Website

Google

Facebook

Twitter

---

Website Preview

Uses the real frontend.

No mockups.

Preview rendered using draft data.

---

Preview URL

Temporary signed URL.

Expires automatically.

---

Live Preview

Editing

↓

Auto Save

↓

Preview Refresh

Without page reload.

---

Preview Information

Status

SEO Score

Last Saved

Last Published

Language

Viewport

---

# Autosave System

Global autosave service.

Tracks

General

Content

Media

SEO

Advanced

---

Indicators

Saving...

Saved

Unsaved Changes

Offline

Conflict

---

Conflict Resolution

Detect

Concurrent Modification

↓

Display Comparison

↓

Merge

↓

Save

---

# Validation Engine

Runs

Client Side

↓

Server Side

↓

Database Constraints

↓

SEO Validation

↓

Publish Validation

---

Validation Categories

Business

SEO

Media

Translation

Security

Performance

Schema

Accessibility

---

Blocking Errors

Duplicate SKU

Duplicate Slug

Missing Required Fields

Database Constraint

Invalid Schema

Missing Category

---

Warnings

Missing ALT

Missing Description

Low SEO Score

Missing Open Graph

Missing Twitter Card

Large Images

---

# Notifications

Success

Draft Saved

Published

Deleted

Restored

Media Uploaded

SEO Updated

---

Warning

Low SEO Score

Missing Translation

Large Images

---

Error

Save Failed

Upload Failed

Validation Failed

---

# Keyboard Navigation

Tab Navigation

Arrow Navigation

Escape closes dialogs

Enter confirms primary action

Space toggles checkboxes

---

# Responsive Behaviour

Desktop

Multi-column layout

Sticky sidebar

---

Tablet

Reduced sidebar

Responsive forms

---

Mobile

Single column

Bottom sheets

Collapsible sections

Sticky action bar

---

# Server Actions

createProduct()

updateProduct()

publishProduct()

archiveProduct()

restoreProduct()

deleteProduct()

duplicateProduct()

autosaveProduct()

validateProduct()

previewProduct()

loadProductHistory()

restoreHistoryVersion()

---

# Repository Layer

ProductRepository

↓

SeoRepository

↓

MediaRepository

↓

HistoryRepository

↓

SettingsRepository

---

# Database Flow

Administrator

↓

Validation

↓

Transaction

↓

Products

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

# Logging

Every operation logs

Timestamp

Administrator

Entity

Changes

Duration

IP Address

User Agent

---

# Performance Requirements

Product List

<300ms

Product Editor

<250ms

Autosave

<500ms

Publish

<700ms

History

<300ms

Preview Refresh

<400ms

---

# Security

Authentication Required

CSRF Protection

Rate Limiting

Input Sanitization

XSS Protection

SQL Injection Protection

Content Security Policy

Signed Upload URLs

Permission Validation

Server-side Validation

Audit Logging

---

# Accessibility

WCAG 2.2 AA

Keyboard Navigation

Screen Reader Support

High Contrast Compatible

ARIA Labels

Logical Tab Order

Visible Focus Indicators

Touch Target ≥44px

---

# Acceptance Criteria

General

✓ Product creation requires fewer than 2 minutes for a complete entry.

✓ Every field validates in real time.

✓ Autosave never interrupts editing.

✓ All operations are transactional.

✓ Product duplication preserves configurable data.

✓ Soft delete is fully reversible.

✓ Every change generates a history record.

✓ Preview reflects draft changes immediately.

✓ Product editor works entirely without page reloads.

✓ Mobile editing experience is fully supported.

Performance

✓ Lighthouse Performance ≥95

✓ Lighthouse Accessibility =100

✓ Lighthouse Best Practices ≥95

✓ Lighthouse SEO =100

Reliability

✓ No data loss during unexpected refresh.

✓ Conflict detection prevents overwriting changes.

✓ Database consistency maintained after every operation.

Scalability

✓ Supports 1,000,000+ products without architectural redesign.

✓ Ready for future API, Plugins, Multi-tenant architecture and Headless integrations.
