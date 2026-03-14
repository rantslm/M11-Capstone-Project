# Job Application Tracker

## Overview

Job Application Tracker is a full-stack web application designed to help users manage the job search process in one centralized place. Instead of relying on spreadsheets, notes apps, email threads, or memory, users can track applications, manage related contacts, log interview activity, and create follow-up tasks through a connected interface.

The project was built as a Software Engineering Capstone and demonstrates full-stack development across frontend, backend, database design, authentication, testing, and project documentation.

## Features

- User registration and login with JWT-based authentication
- Protected routes for authenticated users only
- Create, view, update, and delete job applications
- Track application stages such as Saved, Applied, Interviewing, Offer, and Rejected
- Store contacts linked to applications
- Log activities such as calls, emails, interviews, and notes
- Create and manage follow-up tasks
- Dashboard summary view for recent records and job search progress
- Archive support for application records
- Search and filtering support on key pages

## Tech Stack

### Frontend

- React
- React Router
- Vite
- Material UI
- Emotion

### Backend

- Node.js
- Express.js
- Sequelize
- MySQL2
- JWT (`jsonwebtoken`)
- bcrypt
- dotenv
- cors

### Testing

- Jest
- Supertest

### Development Tools

- Git and GitHub
- VS Code
- Hoppscotch
- Mermaid / Mermaid Viewer

## Repository Structure

```text
M11-Capstone-Project/
├── README.md
├── template.md
├── database.md
├── rubric.md
├── capstone-frontend/
└── capstone-backend/
```

### Frontend Structure

The frontend is located in `capstone-frontend` and includes:

- `src/pages` for application pages such as Auth, Dashboard, Applications, Contacts, Activities, Tasks, and Archive
- `src/components` for shared layout components
- `src/utils` for shared frontend helper logic

### Backend Structure

The backend is located in `capstone-backend` and follows an MVC-style structure:

- `src/routes` for API route definitions
- `src/controllers` for request handling and business logic
- `src/middleware` for authentication middleware
- `models` for Sequelize models
- `migrations` for database schema history
- `seeders` for demo data
- `tests` for backend API test coverage

## Prerequisites

Before running this project locally, make sure you have the following installed:

- Node.js
- npm
- MySQL
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/rantslm/M11-Capstone-Project.git
cd M11-Capstone-Project
```

### 2. Install frontend dependencies

```bash
cd capstone-frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../capstone-backend
npm install
```

## Environment Variables

Create a `.env` file inside `capstone-backend` and add the following:

```env
PORT=3001

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=capstone_jobtracker
DB_USER=root
DB_PASS=your_password_here

JWT_SECRET=thesecretissecret1776
```

Update the database credentials to match your local MySQL setup.

## Database Setup

This project uses Sequelize migrations and seeders.

From the `capstone-backend` folder, run:

### Run migrations

```bash
npx sequelize-cli db:migrate
```

### Seed demo data

```bash
npx sequelize-cli db:seed:all
```

Make sure your MySQL server is running and that the database named `capstone_jobtracker` already exists before running migrations.

## Running the Application

### Start the backend

From `capstone-backend`:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3001
```

### Start the frontend

Open a second terminal, then from `capstone-frontend`:

```bash
npm run dev
```

Vite will provide the local frontend URL in the terminal, typically:

```text
http://localhost:5173
```

## Testing

Backend API tests are implemented on the backend testing branch and located in:

```text
capstone-backend/tests
```

Current test coverage includes:

- authentication
- applications
- contacts
- activities
- tasks
- app-level API behavior

If working on the branch that includes the backend test setup, tests can be run from the `capstone-backend` folder using the configured Jest test command.

## Documentation

Project files included in this repository:

- `template.md` for the capstone project documentation
- `database.md` for the logical database design and ER diagram
- `rubric.md` for the project evaluation rubric

Additional project links:

- GitHub repository: https://github.com/rantslm/M11-Capstone-Project
- Project submission document: https://docs.google.com/document/d/1fq_CEFfOgy-JyznMJKG7uOj4_Fd9AqIlidBckc7MXd8/edit?usp=drive_link

## Current Status

The application is functional as an MVP and supports the core workflow of a job tracking platform:

- authenticate a user
- manage job applications
- track related contacts, activities, and tasks
- view structured records in the frontend interface

Production deployment is planned for a future phase. The intended deployment direction is AWS, with Docker-based containerization considered as part of the deployment strategy.

## Future Improvements

- Deploy frontend and backend to a cloud environment
- Connect to AWS-based infrastructure
- Expand dashboard analytics and reporting
- Improve archive workflows
- Add file attachment support
- Extend search, filtering, and sorting across records
- Improve responsive polish and UX refinements

## Author

Created by Leilani Rants as part of the Institute of Data Software Engineering Capstone Project.
