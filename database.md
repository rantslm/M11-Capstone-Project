# Database Design (Logical Model)

This document defines the logical data model for the Job Application Tracker capstone.
Target DB: **MySQL** (implemented via Sequelize models + migrations).
Ownership rule: All records are private to the logged-in user. A user can only access records linked to their own `user_id` via the `applications` table.

---

## Entities

### users
Represents an account that owns data in the system.

**Key fields**
- id (PK)
- email (unique)
- password_hash
- first_name, last_name
- created_at, updated_at

---

### applications
Central record in the system. Each application represents a single role a user is pursuing.
In the UI, applications are labeled as: **`company_name — position_title`**.

**Key fields**
- `id` (PK)
- `user_id` (FK → `users.id`)
- `company_name` (string; user-entered)
- `position_title` (string; user-entered)
- `stage` (enum: Saved | Applied | Interviewing | Offer | Rejected)
- `job_url` (optional)
- `location` (optional)
- `salary_min`, `salary_max` (optional)
- `applied_at` (optional datetime)
- `notes` (optional text)
- `created_at`, `updated_at`

**Notes**
- “Company” is not a separate table in MVP; it is stored on the application record.
- Multiple applications may share the same `company_name` (e.g., applying to different roles at the same company).

---

### activities
Logged interactions related to an application (emails, calls, interviews, notes).

**Key fields**
- id (PK)
- application_id (FK → applications.id)
- type (Email | Call | Interview | Note)
- occurred_at (datetime)
- summary (short text)
- details (long text, optional)
- created_at, updated_at

---

### tasks
Follow-ups or reminders related to an application.

**Key fields**
- id (PK)
- application_id (FK → applications.id)
- title
- due_at (datetime, optional)
- status (Open | Done | Snoozed)
- created_at, updated_at

---

### contacts
People associated with a company (recruiters, hiring managers, etc).

**Key fields**
- id (PK)
- company_id (FK → companies.id)
- name
- title (optional)
- email (optional)
- phone (optional)
- linkedin_url (optional)
- contact_type (Recruiter | HiringManager | Other)
- notes (optional)
- created_at, updated_at

---

## Relationships

### MVP relationships (build first)
- **Users 1 → M Applications**
- **Applications 1 → M Activities**
- **Applications 1 → M Tasks**
- **Applications 1 → M Contacts**

---

## Delete Behavior (Recommended)
- Deleting an **Application** deletes its **Activities**, **Tasks**, and **Contacts** (cascade).
- Deleting a **User** deletes their **Applications** and all dependent records (cascade).

---

## Data Access Rule (API Enforcement)
All reads/writes must be scoped to the logged-in user by enforcing:
- `applications.user_id = req.user.id`
and only allowing access to activities/tasks/contacts through an application that belongs to that user.

---

### Defaults (implemented in migrations)
- `applications.stage` default = `Saved`
- `tasks.status` default = `Open`

### Enum sets (implemented as MySQL ENUM or Sequelize validation)
- `applications.stage`: Saved, Applied, Interviewing, Offer, Rejected
- `tasks.status`: Open, Done, Snoozed
- `activities.type`: Email, Call, Interview, Note
- `contacts.contact_type`: Recruiter, HiringManager, Interviewer, Other

---

## Mermaid ER Diagram

```mermaid
erDiagram
  USERS ||--o{ APPLICATIONS : owns
  APPLICATIONS ||--o{ CONTACTS : has
  APPLICATIONS ||--o{ ACTIVITIES : logs
  APPLICATIONS ||--o{ TASKS : tracks

  USERS {
    int id PK
    string email "UNIQUE"
    string password_hash
    datetime created_at
    datetime updated_at
  }

  APPLICATIONS {
    int id PK
    int user_id FK
    string company_name
    string position_title
    string stage "Saved|Applied|Interviewing|Offer|Rejected"
    string job_url
    string location
    int salary_min
    int salary_max
    datetime applied_at
    text notes
    datetime created_at
    datetime updated_at
  }

  CONTACTS {
    int id PK
    int application_id FK
    string name
    string title
    string email
    string phone
    string linkedin_url
    string contact_type "Recruiter|HiringManager|Interviewer|Other"
    text notes
    datetime created_at
    datetime updated_at
  }

  ACTIVITIES {
    int id PK
    int application_id FK
    string type "Email|Call|Interview|Note"
    datetime occurred_at
    string summary
    text details
    datetime created_at
    datetime updated_at
  }

  TASKS {
    int id PK
    int application_id FK
    string title
    string status "Open|Done|Snoozed"
    datetime due_at
    datetime created_at
    datetime updated_at
  }
  ```
