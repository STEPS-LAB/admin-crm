# Settings Database Schema

Version: 1.0

Status: Approved

---

# Purpose

The Settings domain defines global system configuration.

It controls application-wide behavior, SEO defaults, UI preferences, integrations, and system-level flags.

Settings are not user-specific.

Settings are global.

---

# Domain Scope

Settings control:

- SEO defaults
- Site identity
- Localization
- UI configuration
- Integration keys
- Script injection
- Feature flags
- System behavior
- Default templates

---

# Entity: Settings

Table

settings

---

Primary Key

id UUID

Only one row exists in MVP.

Future-ready for multi-tenant support.

---

# Fields

id

UUID

---

site_name

TEXT

Required

---

site_description

TEXT

Nullable

---

site_url

TEXT

Required

Absolute URL

---

default_language

ENUM

uk

en

Default uk

---

supported_languages

ARRAY

uk, en

---

timezone

TEXT

Default Europe/Kyiv

---

currency

TEXT

Default UAH

---

logo_url

TEXT

Nullable

---

favicon_url

TEXT

Nullable

---

---

# SEO Defaults

default_meta_title

TEXT

---

default_meta_description

TEXT

---

default_og_image

TEXT

---

default_twitter_card

ENUM

summary

summary_large_image

---

default_indexing

BOOLEAN

Default true

---

default_follow

BOOLEAN

Default true

---

default_robots

TEXT

Default:

index, follow

---

# Sitemap Settings

sitemap_enabled

BOOLEAN

Default true

---

sitemap_auto_generate

BOOLEAN

Default true

---

sitemap_update_frequency

ENUM

hourly

daily

weekly

monthly

---

sitemap_include_images

BOOLEAN

---

sitemap_include_videos

BOOLEAN

---

---

# Robots Settings

robots_enabled

BOOLEAN

---

robots_content

TEXT

Raw robots.txt

---

---

# UI Settings

theme

ENUM

light

dark

system

---

primary_color

TEXT

---

border_radius

INTEGER

Default 8–10px

---

layout_density

ENUM

compact

comfortable

---

---

# Script Injection

head_scripts

TEXT

Nullable

---

body_scripts

TEXT

Nullable

---

footer_scripts

TEXT

Nullable

---

allow_custom_scripts

BOOLEAN

Default false (security)

---

---

# Integrations

google_analytics_id

TEXT

---

google_tag_manager_id

TEXT

---

google_search_console_verification

TEXT

---

bing_webmaster_verification

TEXT

---

facebook_pixel_id

TEXT

---

---

# System Flags

maintenance_mode

BOOLEAN

---

debug_mode

BOOLEAN

---

cache_enabled

BOOLEAN

---

seo_automation_enabled

BOOLEAN

---

auto_generate_schemas

BOOLEAN

---

auto_generate_metadata

BOOLEAN

---

---

# Business Rules

Only one settings record exists in MVP.

All changes must be audited.

Changes require history logging.

Critical fields require validation.

Invalid settings must not be saved.

---

# Validation Rules

site_url must be valid URL

language must match supported list

scripts must be sanitized

no unsafe HTML allowed

---

# Performance

Settings load time

< 10 ms (cached)

---

# Future Extensions

Multi-tenant settings

Per-domain settings

Environment-based overrides

Feature flag system expansion

A/B testing configuration