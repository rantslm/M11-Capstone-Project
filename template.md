# Capstone Project Document Template

> [!NOTE]
> The following are the candidate sections of the document. They are presented here for guidance. Questions in each section could be used as possible aspects to cover. Some questions may not be applied to each project. On the other hand, additional information may be needed.

## Introduction

### Purpose

**What is the problem or the opportunity that the project is investigating?**

Job searching lacks a centralized place to organize everything like job listings, application statuses, interview notes, followups, emails. This project provides a system to organize the information and also provide visibility through the job application lifecycle.

**Why is this problem valuable to address?**

A disorganized job search can lead to missed follow-ups, duplicated applications, mistracked interview stages, and reduced hiring/offer rates. In this job market, better organization can streamline the process and directly impact employment outcomes.

**What is the current state (e.g. unsatisfied users, lost revenue)?**

Many users like myself rely on manually tracking through tools like spreadsheets, notes apps, or sheer memory to track applications. While platforms like LinkedIn and Indeed provide job listings they lack hiring pipeline tools beyond just what was saved or applied.

**What is the desired state?**

A centralized dashboard where users can:
- manage applications(company, role, salary range, location, link),
- track progress through defined stages (Saved, Applied, Interviewing, Offer, Rejected),
- log interview activities(calls, emails, interviews),
- store contacts per company (recruiter, hiring manager),
- add tasks/reminders (follow up next Monday)
- store attachments/notes/links

**Has this problem been addressed by other projects? What were the outcomes?**

From what I have researched, platforms like Hunter and other tools have similar pipeline style tracking systems but are subscription-based, have limited customization, or just dont integrate enough relational data modeling, resulting in going off app…users eventually just result to using excel or combination of other manual ways to note/track jobs.

### Industry/ Domain

**What is the industry/ domain?**

he project falls within the Job Search Technology and Career Management Software domain, which is part of the broader HR Technology (HRTech) industry.

**What is the current state of this industry? (e.g. challenges from startups)**

The industry is highly competitive and dominated by large platforms such as LinkedIn and Indeed--if you were to narrow the scope to job discovery. Startups in this space aim to provide more user-centered tools that improve organization, automation, and analytics during the job search process.

**What is the overall industry value-chain?**

The value chain typically includes:
- Employers creating job listings
- Platforms distributing job postings
- Candidates discovering and applying to jobs
- Recruiters reviewing and interviewing candidates
- Hiring decisions and onboarding

This project operates within the candidate management stage of the value chain, focusing on applicant-side organization rather than employer-side recruitment systems.

**What are the key concepts in the industry?**
- Applicant tracking
- Hiring pipeline stages
- Workflow management
- User authentication and security
- Data organization and analytics
- Productivity and career management

**Is the project relevant to other industries?**

Yes. The core architecture of this system could be adapted to other pipeline-based workflows such as sales tracking/CRM systems, project management tools, freelance client tracking, or college admissions tracking systems. The underlying design pattern is applicable to any structured multi-stage process.

### Stakeholders

**Who are the stakeholders? (be as specific as possible as to who would have access to the software)**

Primary Users: Job seekers managing their application pipeline
Secondary Users (future scope): Career coaches or mentors who may assist applicants
Developers/Maintainers: Individuals responsible for maintaining and scaling the system

**Why do they care about this software?**

Primary stakeholders (job seekers) care because the job search process is often stressful, fragmented, and difficult to manage. This software provides structure, visibility, and control over their application pipeline, helping them avoid missed follow-ups, duplicate applications, and lost opportunities. By centralizing job data in one system, users can make more informed decisions and track measurable progress toward employment.

Secondary stakeholders, such as career coaches or mentors, care because the system provides transparent insight into a candidate’s progress. It allows them to identify bottlenecks in the hiring process and offer targeted guidance.

From a technical perspective, developers and maintainers care because the system demonstrates scalable architecture, secure authentication, structured data modeling, and maintainable code practices. These qualities ensure the software is reliable, extensible, and adaptable to future enhancements.

**What are the stakeholders’ expectations?**
- Secure authentication and data privacy
- Reliable CRUD functionality
- Clear dashboard visualization of application stages
- Accurate data persistence
- Responsive and intuitive UI
- Stable performance and test coverage

## Product Description

### Architecture Diagram

- Include a diagram of the building blocks of the design including users and how they interact with the product.

---

### User Stories

#### 1. Account Registration

**Priority:** High

**Description:**
User is able to create an account using email and password.

**User Story:**
As a user, I want to create an account with my email and password
so that I can securely access and manage my job applications.

**Acceptance Criteria:**
- Given a user submits valid registration details, then a new account is created and stored in the database.
- Given a user submits an email that already exists, then the system displays an appropriate error message.

---

#### 2. Login Functionality

**Priority:** High

**Description:**
User is able to log in securely.

**User Story:**
As a user, I want to log in using my credentials
so that I can access my saved job applications and data.

**Acceptance Criteria:**
- Given a user enters valid login credentials, then they are authenticated and redirected to the dashboard.
- Given invalid credentials are entered, then the system displays an error message.

---

#### 3. Create Job Application

**Priority:** High

**Description:**
User can create a new job application entry.

**User Story:**
As a user, I want to add a job application including company, role, salary range, location, and job link
so that I can track all relevant details in one place.

**Acceptance Criteria:**
- Given a user submits a completed job application form, then the application is saved in the database.
- Given required fields are missing, then the system prevents submission and displays validation errors.

---

#### 4. Track Application Progress

**Priority:** High

**Description:**
User can update the hiring stage of an application.

**User Story:**
As a user, I want to update an application's status
so that I can clearly see where I stand in the hiring process.

**Acceptance Criteria:**
- Given a user selects a new hiring stage, then the updated stage is saved to the database.
- Given the dashboard loads, then each application displays its current stage.

---

#### 5. Interview Activity Logging

**Priority:** High

**Description:**
User can log interview-related activities.

**User Story:**
As a user, I want to record interview dates and notes
so that I can track communication history and prepare for next steps.

**Acceptance Criteria:**
- Given a user submits interview details, then the activity is saved and linked to the correct application.
- Given an application is viewed, then all associated interview activities are displayed.

---

#### 6. Manage Contacts

**Priority:** Medium

**Description:**
User can store recruiter or company contact information.

**User Story:**
As a user, I want to save contact details for recruiters or hiring managers
so that I can easily reference them for follow-ups.

**Acceptance Criteria:**
- Given a user submits contact information, then the contact is saved in the database.
- Given a user views an application, then associated contact details are displayed.

---

#### 7. Follow-Up Task Management

**Priority:** High

**Description:**
User can create and manage follow-up tasks.

**User Story:**
As a user, I want to create reminders for follow-ups or deadlines
so that I do not miss important actions in the hiring process.

**Acceptance Criteria:**
- Given a user creates a task with a due date, then the task is saved and linked to the appropriate application.
- Given a user marks a task as complete, then the task status updates accordingly.

---

#### 8. Dashboard Summary

**Priority:** Medium

**Description:**
User can view an overview of application statistics.

**User Story:**
As a user, I want to see a summary of my applications
so that I can quickly understand my overall progress.

**Acceptance Criteria:**
- Given a user logs in, then the dashboard displays total application count.
- Given applications exist in different stages, then the dashboard shows a breakdown by stage.

---

#### 9. Application Search & Filtering

**Priority:** Medium

**Description:**
User can filter applications by stage or company.

**User Story:**
As a user, I want to filter or search my applications
so that I can quickly find specific entries.

**Acceptance Criteria:**
- Given a user enters search criteria, then only matching applications are displayed.
- Given a user selects a stage filter, then only applications in that stage are shown.

---

#### 10. Archive/Delete Application

**Priority:** Medium

**Description:**
User can remove or archive applications.

**User Story:**
As a user, I want to delete or archive old applications
so that my dashboard stays organized.

**Acceptance Criteria:**
- Given a user selects delete, then the application is removed from the database.
- Given a user selects archive, then the application is marked inactive and removed from the active dashboard view.

---

### User Flow

- Present as a flow diagram the steps a user may make in interacting with the software.

### Wireframe Design

- Show elements of the user interface, either manually or via a tool such as Figma.

## Open Questions / Out of Scope

- What features are considered out of scope?

#### Non-functional Requirements

- What are the key security requirements? (e.g. login, storage of personal details, inactivity timeout, data encryption)
- How many transactions should be enabled at peak time?
- How easy to use does the software need to be?
- How quickly should the application respond to user requests?
- How reliable must the application be? (e.g. mean time between failures)
- Does the software conform to any technical standards to ease maintainability?

## Project Planning

- Include GitHub project board showing key milestones (with dates) to complete the project.

### Testing Strategy

- What were steps undertaken to achieve product quality?
- How was each feature of the application tested?
- How did you handle edge cases?

### Implementation

- What were the considerations for deploying the software?

### End-to-end Solution

- How well did the software meet its objectives?

### References

- Where is the code used in the project? (Use permalinks to GitHub)
- What are the resources used in the project? (libraries, APIs, databases, tools, etc)
