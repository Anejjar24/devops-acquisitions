# DevOps Acquisitions Platform

A modern, production-ready **DevOps-oriented backend project** designed
for showcasing cloud-native, secure, and scalable architecture in a
portfolio.\
Project name suggestion: **devops-acquisitions-platform**

------------------------------------------------------------------------

## 🚀 Overview

This project is a **Node.js/Express API** packaged with best DevOps
practices and modern tooling, including containerization, orchestration,
security layers, structured logging, role‑based access control,
automated database migrations, and schema validation.

It is purpose-built for demonstrating skills in:

-   Cloud-native backend architecture\
-   DevOps tooling and containerization (Docker & Kubernetes)\
-   Modern TypeScript-first backend development\
-   Secure authentication & API design\
-   CI/CD-ready project structure

------------------------------------------------------------------------

## ⚙️ Tech Stack

### **Security & Runtime**

-   **Arcjet** -- developer-first security layer for bot protection,
    rate limiting, email validation & attack prevention.
-   **Node.js** -- event-driven, scalable JavaScript runtime.
-   **Express.js** -- fast and minimal backend framework.

### **Containerization & DevOps**

-   **Docker** -- app containerization for consistent deployments.
-   **Kubernetes** -- orchestration, autoscaling, load balancing &
    self-healing.
-   **Warp Terminal** -- Rust-based productivity terminal with
    AI-assisted developer experience.

### **Database & Validation**

-   **Neon Postgres** -- serverless PostgreSQL with autoscaling &
    branching.
-   **Drizzle ORM** -- TypeScript-first SQL ORM with strong typing &
    migrations.
-   **Zod** -- runtime schema validation for API requests.

### **Tooling & Quality**

-   **ESLint + Prettier** -- code quality & formatting.
-   **Winston + Morgan** -- structured logging.
-   **Jest + SuperTest** -- (optional) testing stack.

------------------------------------------------------------------------

## 🔋 Key Features

-   ✔️ **User Authentication** with JWT & httpOnly cookies\
-   ✔️ **Role-Based Access Control** (admin & user)\
-   ✔️ **Business Listings** CRUD\
-   ✔️ **Deal Management** (create, accept, reject offers)\
-   ✔️ **Structured Logging** using Winston\
-   ✔️ **Absolute Imports** using `#` aliases\
-   ✔️ **Zod Request Validation**\
-   ✔️ **PostgreSQL + Drizzle ORM**\
-   ✔️ **Health Monitoring Endpoint**\
-   ✔️ **Hot Reload** with Nodemon\
-   ✔️ **Docker-Ready** for dev & prod\
-   ✔️ **Kubernetes Deployment Files** (optional extension)\
-   ✔️ **CI/CD Friendly Architecture**

------------------------------------------------------------------------

## 📁 Project Structure (src/)

    src/
     ├── index.js          # Entry point (env loading)
     ├── server.js         # HTTP server creation
     ├── app.js            # Express app, middleware, routes
     ├── config/           # DB, logger configuration
     ├── routes/           # Route definitions
     ├── controllers/      # Request handlers
     ├── services/         # Business logic + DB access
     ├── models/           # Drizzle schemas
     ├── validations/      # Zod validation schemas
     ├── utils/            # JWT, cookies, formatting

Path aliases via `package.json#imports`:

    #config/logger.js
    #routes/auth.routes.js
    #services/user.service.js
    ...

------------------------------------------------------------------------

## 🧩 Architecture Summary

### **Express App**

-   Security: `helmet`, `cors`
-   Body parsing: JSON + URL encoded
-   Logging: `morgan` piped into Winston
-   Cookie parsing: `cookie-parser`
-   Mounted routes: `/api/auth`, `/api/...`

### **Authentication Flow**

-   Request → Zod Validation → Controller\
    → Service → DB (Drizzle + Neon) → JWT Signing → httpOnly Cookie →
    Response

### **Database Layer**

-   Neon SQL Client using `@neondatabase/serverless`
-   Drizzle ORM for queries, migrations & schemas

------------------------------------------------------------------------

## 🧪 Commands

### Development

    npm run dev

### Linting & Formatting

    npm run lint
    npm run lint:fix
    npm run format
    npm run format:check

### Database

    npm run db:generate
    npm run db:migrate
    npm run db:studio

------------------------------------------------------------------------



## 🐳 Docker Usage

Development & production-ready Dockerfiles included.

    docker build -t devops-acquisitions .
    docker run -p 3000:3000 devops-acquisitions

------------------------------------------------------------------------

## ☸️ Kubernetes 

You can deploy this project to Kubernetes using: - Deployment.yaml\
- Service.yaml\
- ConfigMap.yaml\
- Secret.yaml


------------------------------------------------------------------------

## 📄 WARP.md

Documentation is included to optimize Warp terminal usage with this
repository.

------------------------------------------------------------------------

## 📦 How to Run

1.  Clone the repo\
2.  Create a `.env` file with database & JWT variables\
3.  Install dependencies\
4.  Run migrations\
5.  Start dev server

------------------------------------------------------------------------


