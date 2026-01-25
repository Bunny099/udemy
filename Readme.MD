# Udemy (Backend MVP)

A minimal backend implementation of a Udemy-like platform built for learning and clarity.

This project focuses on role-based access, course ownership, and enrollment logic using a clean and practical backend design.

---

## Tech Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT Authentication
- bcrypt

---

## Authentication

- Users register as **Instructor** or **Student**
- Login returns a JWT token
- Protected routes use an auth middleware
- `/auth/me` returns the authenticated user

JWT is used for authentication only.  
Authorization is handled using roles and database relationships.

---

## Instructor Capabilities

- Create course drafts
- Publish courses (requires at least one lesson)
- Update and delete draft courses
- Manage lessons for draft courses
- View lessons of owned courses

**Constraints**
- Only course owners can manage their courses
- Published courses cannot be modified

---

## Student Capabilities

- Enroll in published courses
- Access lessons of enrolled courses
- Mark lessons as completed
- Enrollment and progress actions are idempotent

**Constraints**
- Students can only access enrolled courses
- Instructor access to student routes is restricted

---

## Authorization Design

- JWT middleware attaches `req.user`
- No repeated user existence checks after authentication
- Access is validated via:
  - role checks
  - course ownership
  - enrollment relationships

This keeps the system simple while avoiding unnecessary database queries.

---

## Status

- Backend MVP completed
- Core flows implemented for instructors and students
- Focused on correctness, access control, and clean API design


