# Driver Sentiment Engine

A Project for analyzing driver performance through employee feedback. Features real-time sentiment analysis, JWT role-based authentication, and a non-blocking asynchronous queue for processing feedback. Built with **Express.js + TypeScript** on the Backend and **Next.js + Tailwind CSS** on the Frontend, backed by **MongoDB**.

This system was engineered with a focus on **algorithm efficiency, data structure optimization, and clean architecture (OOP).**

## Key Features

- **Real-time Sentiment Analysis**: Instantly categorizes text feedback into positive/neutral/negative ratings using a localized natural language processing bag-of-words approach, mathematically blended with quantitative star ratings.
- **Secure Authentication & Role-Based Access (JWT)**: Login system utilizing bcrypt password hashing and JSON Web Tokens. Admin vs. Employee roles dictate strict, isolated UI routing and component rendering.
- **Dynamic Feature Flags**: Centralized config system allows toggling UI components (like marshal feedback) on the fly without deploying new code.
- **Asynchronous Task Processing**: Real-time feedback submission with non-blocking, background queue processing for data persistence and alerting.

## Technical Highlights & Engineering Decisions

### 1. Data Structures & Algorithm Efficiency
- **$O(1)$ Sentiment Word Lookup containing Hash Sets**: The Sentiment Analysis Engine relies on predefined dictionaries. Instead of using arrays (which run in $O(N)$), we utilize `Set<string>` structures mapped in isolated memory, enabling instant $O(1)$ lookups per localized tokenized word.
- **Amortized $O(1)$ In-Memory Queue**: Feedback processing is completely decoupled from the HTTP response cycle using an asynchronous FIFO `InMemoryQueue<T>`. This allows instant feedback submission for users, while heavy sentiment crunching and database writes happen sequentially in the background worker.
- **$O(1)$ Rolling Average Updates**: Instead of recalculating a driver's average rating by querying all past feedback ($O(N)$ operations which would destroy database performance at scale), we store `totalScore` and `totalFeedback` on the driver document directly. Updating the average score requires only a single atomic `$inc`/`$set` MongoDB transaction.

### 2. Architecture & Design Patterns
- **Repository Pattern**: Strict separation of concerns mirroring Spring Boot. Controllers handle HTTP schemas, Services contain business logic, and Repositories handle MongoDB transactions. E.g. If we swap from MongoDB to PostgreSQL, only the `src/repositories` layer changes.
- **Singleton Pattern**: Built a `Database` connection class strictly enforcing a single MongoDB connection pool across the application lifecycle to prevent memory leaks and max connection limits.
- **Dependency Injection**: Root `Server.ts` explicitly wires all Repositories, Services, and Controllers together at boot via Constructors (Poor Man's DI). This ensures high testability and prevents cross-dependency code-spaghetti. 
- **Graceful Degradation & "Zero-Config" Seeding**: `AuthService` auto-seeds demo admin/employee users on startup if the database is completely empty.

## Screenshots

| Home Page | Feedback Flow | Admin Dashboard | Driver's Score Graph |
|---|---|---|---|
| ![alt text](readImg1.png) | ![alt text](readImg2.png) | ![alt text](readImg3.png) | ![alt text](readImg4.png) |

## Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (Mongoose)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB

### 1. Backend Setup
```bash
cd backend
npm install
# Ensure MongoDB is running locally or provide a MONGO_URI in .env
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Login
- **Admin**
- **Employee**