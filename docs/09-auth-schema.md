# Authentication Database Schema

Version: 1.0

Status: Approved

---

# Purpose

This document defines the authentication-related database model.

Authentication is handled by Supabase Auth.

The application stores only additional profile information required by the CMS.

Never duplicate sensitive authentication data already managed by Supabase.

---

# Authentication Architecture

Supabase Auth
        │
        ▼
auth.users (managed by Supabase)
        │
        ▼
profiles
        │
        ▼
audit_logs
        │
        ▼
sessions (optional metadata)

---

# Entity: Profile

Purpose

Stores administrator profile information.

Authentication credentials remain inside Supabase Auth.

---

Table

profiles

---

Primary Key

id UUID

References

auth.users.id

One profile exists for exactly one authenticated user.

---

Fields

id

UUID

PK

FK -> auth.users.id

---

email

TEXT

Indexed

Unique

Read-only

Used for display purposes only.

---

display_name

TEXT

Maximum length

100

Required

Displayed inside dashboard.

---

avatar_url

TEXT

Nullable

Points to Supabase Storage.

---

locale

TEXT

Default

uk

Allowed

uk

en

---

timezone

TEXT

Default

Europe/Kyiv

---

created_at

TIMESTAMP

Required

---

updated_at

TIMESTAMP

Required

---

last_login_at

TIMESTAMP

Nullable

Updated automatically.

---

is_active

BOOLEAN

Default true

Inactive users cannot access the dashboard.

---

Relationships

Profile

1 : 1

Supabase User

---

Indexes

email

display_name

is_active

---

Constraints

Email must remain unique.

Profile cannot exist without Supabase User.

---

# Entity: Audit Log

Purpose

Stores security-sensitive events.

---

Table

audit_logs

---

Fields

id

UUID

PK

---

profile_id

FK

---

action

TEXT

Examples

LOGIN

LOGOUT

FAILED_LOGIN

PASSWORD_RESET

PROFILE_UPDATED

---

ip_address

INET

Nullable

---

user_agent

TEXT

Nullable

---

created_at

TIMESTAMP

---

Indexes

profile_id

action

created_at

---

Retention

Logs are immutable.

No updates allowed.

Deletion only through retention policy.

---

# Entity: Session Metadata (optional)

Purpose

Stores additional information about active sessions.

Supabase manages authentication sessions.

This table only stores application metadata.

---

Fields

id

UUID

profile_id

FK

device_name

TEXT

browser

TEXT

operating_system

TEXT

country

TEXT

city

TEXT

last_activity

TIMESTAMP

expires_at

TIMESTAMP

---

Indexes

profile_id

expires_at

---

Business Rules

Only one administrator account is supported in MVP.

Architecture must support multiple administrators in the future without schema redesign.

The application must never store passwords.

Authentication tokens remain managed exclusively by Supabase.
