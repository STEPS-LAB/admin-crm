# Dashboard Module Specification

Version: 1.0

Status: Approved

---

# Purpose

The Dashboard is the entry point of the CMS after authentication.

Unlike traditional CMS dashboards that display generic statistics, this dashboard acts as the operational command center of the platform.

Its primary objective is to provide immediate insight into:

- SEO health
- Catalog status
- System health
- Recent activity
- Content quality
- Critical issues requiring administrator attention

The administrator should understand the current state of the website within five seconds.

---

# User Goals

The administrator must be able to instantly answer:

• How healthy is the SEO?

• Are there critical problems?

• How many products exist?

• How many products require attention?

• Are there missing metadata?

• Are redirects working?

• Is Sitemap valid?

• Is Robots.txt configured?

• Has anything changed recently?

---

# Navigation

Sidebar

Dashboard

Products

Categories

SEO Center

Settings

Go to Website

Future (disabled)

Media

Analytics

Pages

Brands

Audit Logs

Notifications

API

Plugins

---

# Layout

Desktop

┌──────────────────────────────────────────────┐

Top Navigation

├──────────────────────────────────────────────┤

Sidebar │ Main Content

│

│ SEO Health

│

│ Statistics

│

│ Recent Activity

│

│ Quick Actions

│

│ SEO Issues

│

│ Charts

│

│ Catalog Summary

│

└──────────────────────────────────────────────┘

---

Mobile

Header

↓

Cards

↓

Widgets

↓

Charts

↓

Recent Activity

↓

Quick Actions

Sidebar becomes Drawer.

---

# Header

Contains

CMS Logo

Breadcrumb

Search Button (future)

Theme Toggle

Language Switcher

Administrator Avatar

Logout

---

# Hero Section

Contains

SEO Health Score

Large circular progress indicator.

0-100

Animated.

Shows

Overall score

Last analysis

Improvement trend

Critical issues

---

Color Rules

0-39

Red

40-59

Orange

60-79

Yellow

80-89

Green

90-100

Emerald

---

Clicking the score opens

SEO Center → Analysis

---

# KPI Cards

Cards

Products

Categories

SEO Profiles

Media Assets

Redirects

Schemas

---

Each Card Displays

Icon

Title

Primary Number

Secondary Information

Trend

Hover Animation

Clickable

---

Example

Products

1,284

+14 this month

Published

1,130

Draft

154

---

# SEO Health Widget

Displays

Metadata Score

Schema Score

Images Score

Performance Score

URL Score

Accessibility Score

Technical Score

Internal Linking Score

Each metric

Progress bar

Score

Status

Click action

---

# Catalog Summary

Displays

Total Products

Published

Draft

Archived

Hidden

Categories

Subcategories

Brands

Average Product Score

Average SEO Score

---

# Content Quality Widget

Shows

Products without images

Products without descriptions

Products without SEO

Products without ALT

Products without schema

Products with duplicate titles

Products with duplicate slug

Products with broken canonical

---

Each row links directly to filtered Product List.

---

# SEO Issues

Grouped

Critical

Warning

Recommendation

Passed

---

Each issue contains

Severity

Entity

Description

Recommended action

Button

Go to item

---

# Recent Activity

Timeline

Newest first.

Supported Events

Product Created

Product Updated

Category Updated

SEO Updated

Redirect Created

Redirect Deleted

Settings Changed

Schema Updated

Login

Logout

Import

Export

---

# Quick Actions

Buttons

Create Product

Create Category

Open SEO Center

Generate Sitemap

View Website

Open Settings

---

Buttons use primary CTA styling.

---

# Charts

Chart 1

SEO Score

Last

7 days

30 days

90 days

---

Chart 2

Published Products

---

Chart 3

Recent Activity

---

Charts use Recharts.

Lazy loaded.

---

# Empty States

Every widget supports

Illustration

Description

Primary Action

Example

"No products yet."

Button

Create Product

---

# Loading States

Skeleton UI

No spinners.

---

# Error States

Friendly message

Retry button

Technical details hidden.

---

# Responsive Behavior

Desktop

Sidebar expanded.

Tablet

Sidebar collapsible.

Mobile

Drawer navigation.

Cards become vertical.

Charts resize automatically.

---

# Accessibility

WCAG AA

Keyboard navigation

Visible focus

ARIA labels

Screen reader support

Contrast compliant

---

# Performance

Dashboard render

<500ms

API calls

Parallel

Widgets lazy loaded.

Charts deferred.

---

# Security

Authenticated users only.

Server Components by default.

Sensitive data never exposed to Client Components.

---

# Data Sources

Dashboard aggregates data from

Products

Categories

SEO Profiles

History

Settings

Media

Redirects

Schemas

---

# Server Actions

LoadDashboard()

LoadSeoHealth()

LoadRecentActivity()

LoadStatistics()

LoadQuickActions()

---

# Acceptance Criteria

✓ Dashboard loads in under 500ms.

✓ All KPI cards update automatically.

✓ SEO score reflects latest analysis.

✓ Every widget has loading, empty and error states.

✓ Mobile usability score ≥95.

✓ Lighthouse Performance ≥95.

✓ Lighthouse Accessibility ≥100.

✓ No layout shift during loading.

✓ Fully keyboard accessible.