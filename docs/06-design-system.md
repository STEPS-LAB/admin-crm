# Design Language Specification

Version: 1.0

Status: Approved

---

# Purpose

This document defines the visual language of the application.

Every page.

Every button.

Every table.

Every card.

Every modal.

Every input.

Every animation.

Must follow these rules.

Consistency has higher priority than creativity.

The interface must look like it was designed by one design team.

---

# Design Philosophy

The UI should feel like a premium SaaS platform.

Inspired by:

• Linear

• Stripe Dashboard

• Vercel Dashboard

• Supabase Studio

• Notion

The interface should never feel overloaded.

Whitespace is part of the design.

Minimalism does not mean lack of functionality.

---

# Design Principles

Simple

Modern

Premium

Elegant

Lightweight

Predictable

Accessible

Fast

Professional

---

# Visual Identity

No gradients.

No glassmorphism.

No neumorphism.

No flashy colors.

No oversized shadows.

No heavy borders.

Everything should feel subtle.

---

# Color Palette

Primary

Soft Indigo

Used for

Primary buttons

Links

Focus

Selections

Charts

---

Secondary

Slate

Used for

Backgrounds

Borders

Secondary text

Cards

---

Success

Soft Green

Warnings

Soft Amber

Errors

Soft Red

Information

Soft Blue

---

Colors should never be fully saturated.

Pastel colors only.

---

# Border Radius

Small

6px

Default

8px

Cards

10px

Dialogs

12px

Never exceed 16px.

---

# Shadows

Very subtle.

Cards

Small shadow only.

Dialogs

Medium shadow.

Dropdowns

Small shadow.

Never create dramatic shadows.

---

# Borders

Use borders more often than shadows.

Border color should be barely visible.

---

# Typography

Font

Geist

Fallback

Inter

System UI

No serif fonts.

---

# Font Sizes

12

Captions

14

Small text

16

Body

18

Section titles

24

Page titles

32

Dashboard title

---

# Font Weight

400

Body

500

Labels

600

Cards

700

Titles

Never use extremely bold typography.

---

# Line Height

Comfortable.

Never cramped.

---

# Icons

Lucide only.

Size

16

18

20

24

Never mix icon libraries.

---

# Layout

Max Width

1600px

Content

Centered

Sidebar

Fixed

Header

Sticky

---

# Grid

Use CSS Grid whenever possible.

Avoid deeply nested flex layouts.

---

# Spacing System

Use 4px scale.

4

8

12

16

20

24

32

40

48

64

80

96

Never invent custom spacing.

---

# Sidebar

Collapsed

72px

Expanded

280px

Sticky

Yes

Scroll independently

Yes

---

Sidebar Sections

Dashboard

Products

Categories

Pages

SEO

Settings

Divider

Go To Website

---

# Header

Sticky

Transparent while scrolling

Solid on scroll

Height

64px

Contains

Breadcrumb

Search

Notifications

User Menu

---

# Cards

Cards are the primary container.

Characteristics

Rounded

Border

Subtle shadow

Padding 24px

Background white

Hover elevation

Very subtle

---

# Tables

One of the most important UI components.

Requirements

Sticky Header

Column Resize

Column Visibility

Sorting

Filtering

Search

Bulk Selection

Pagination

Hover

Row Selection

Responsive

---

Table Rows

Height

56px

Hover

Soft background

Selected

Soft primary color

---

# Forms

Forms must be highly readable.

Labels above inputs.

Required indicators.

Descriptions.

Validation.

Sections.

Grouping.

---

# Inputs

Height

44px

Rounded

8px

Focus

Primary color ring

Invalid

Soft red

Disabled

Reduced opacity

---

# Buttons

Primary

Filled

Secondary

Outline

Ghost

Text only

Danger

Soft red

Icon

Square

Loading

Spinner

Disabled

Reduced opacity

---

Button Heights

36

40

44

---

# Dropdowns

Rounded

Shadow

Keyboard accessible

Searchable when needed

---

# Dialogs

Centered

Rounded

Scrollable

Responsive

Escape closes

Outside click configurable

---

# Drawers

Used on mobile.

Desktop prefers pages.

---

# Tabs

Rounded

Animated indicator

Keyboard accessible

---

# Accordions

Smooth animation.

Used for advanced SEO settings.

---

# Badges

Rounded pill.

Soft background.

Never bright colors.

---

# Toast Notifications

Top right.

Minimal.

Auto dismiss.

Undo support.

Success

Green

Warning

Amber

Error

Red

Information

Blue

---

# Skeleton Loading

Mandatory.

Every page.

Every table.

Every card.

Never show blank pages.

---

# Empty States

Illustration

Title

Description

Primary Action

Optional documentation link

---

# Error States

Readable.

Never expose stack traces.

Provide recovery actions.

---

# Loading Indicators

Buttons

Spinner

Pages

Skeleton

Long tasks

Progress bar

Uploads

Percentage

---

# Hover States

Every interactive component must have hover feedback.

Transitions

150ms–200ms

Ease Out

---

# Focus States

Highly visible.

Accessible.

Never remove outline without replacement.

---

# Animations

Use Framer Motion.

Maximum duration

250ms

Preferred

Fade

Slide

Scale

Height

Opacity

Avoid

Bounce

Rotate

Complex transforms

---

# Dashboard Widgets

Equal heights.

Consistent spacing.

Rounded.

Interactive.

Clickable.

---

# SEO Score

Large circular indicator.

0–100

Color changes gradually.

Accompanied by detailed breakdown.

---

# Charts

Minimal.

No unnecessary decoration.

Readable.

Accessible.

---

# Mobile First

Every component must start from mobile layout.

Desktop extends mobile.

Never the opposite.

---

# Accessibility

WCAG AA

Color contrast

Keyboard support

Screen readers

Reduced motion

ARIA

Semantic HTML

---

# UI Consistency Rules

The same action must always look identical.

Delete button

Always red.

Primary action

Always primary.

Cancel

Always secondary.

Back

Always ghost.

Never invent variations.

---

# Design Tokens

All colors, spacing, typography, radius, shadows and transitions must be centralized.

Never hardcode values.

Use CSS variables and Tailwind theme tokens.

---

# Component Quality Standard

Every component must satisfy:

Reusable

Composable

Accessible

Responsive

Typed

Documented

Testable

Minimal

Performant

Beautiful

---

# Final Goal

A user opening the application for the first time should immediately recognize it as a premium SaaS product.

The UI should communicate confidence, clarity and professionalism rather than visual complexity.