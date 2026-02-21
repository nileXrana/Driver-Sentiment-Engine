# Driver Sentiment Engine

A production-grade MVP for analyzing driver performance through rider and marshal feedback, built with **Express.js + TypeScript** (Backend) and **Next.js** (Frontend), backed by **MongoDB**.

---

## System Architecture

```
┌─────────────┐     ┌──────────────────────────────────────────────────────┐
│   Next.js   │────▶│                   Express Backend                    │
│  Frontend   │     │                                                      │
│             │◀────│  Controller ──▶ Service ──▶ Repository ──▶ MongoDB   │
└─────────────┘     │      │                                               │
                    │      ▼                                               │
                    │  FeedbackController                                  │
                    │      │                                               │
                    │      ▼                                               │
                    │  SentimentEngine ──▶ InMemoryQueue ──▶ QueueWorker  │
                    │  (Bag of Words)         │                            │
                    │                         ▼                            │
                    │               DriverService (Rolling Avg)            │
                    │                         │                            │
                    │                         ▼                            │
                    │               AlertService (Threshold Check)         │
                    └──────────────────────────────────────────────────────┘
```

---

## System Design Decisions

### 1. In-Memory Queue: Speed vs. Persistence Trade-off

**Choice:** We use a simple `InMemoryQueue<T>` (array-backed FIFO) instead of Redis or RabbitMQ.

**Why:**
- **Speed:** Zero network overhead. Enqueue/dequeue are `O(1)` amortized operations on a JavaScript array.
- **Simplicity:** No infrastructure dependencies — the queue lives inside the Node.js process.
- **MVP-appropriate:** For a case study/demo, in-memory is the right level of complexity.

**Trade-off:**
- If the server crashes, any unprocessed items in the queue are **lost**.
- In a production system, we would swap `InMemoryQueue` with a Redis-backed queue (e.g., BullMQ). Because we coded to the `IQueue<T>` interface, this swap requires **zero changes** to the rest of the codebase (Open/Closed Principle).

**Capacity guard:** The queue has a configurable `maxCapacity` (default: 10,000) to prevent unbounded memory growth.

---

### 2. Sentiment Analysis: O(1) Word Lookup with Sets

**Algorithm:** Bag-of-Words with a hardcoded dictionary.

**Time Complexity Analysis:**
| Operation | Complexity | Explanation |
|-----------|-----------|-------------|
| Tokenization | `O(n)` | Split text into `n` words |
| Per-word lookup | `O(1)` | `Set.has()` uses a hash table internally |
| Total analysis | `O(n)` | One pass through all words |

**Why `Set<string>` instead of `Array`?**
- `Array.includes()` scans linearly → `O(k)` per lookup where `k` = dictionary size.
- `Set.has()` uses hashing → `O(1)` average per lookup.
- For `n` words in the text and `k` words in the dictionary:
  - Array approach: `O(n × k)` total
  - Set approach: `O(n)` total ← **what we use**

**Score Formula:**
```
ratio = (positiveCount - negativeCount) / totalSentimentWords
score = ((ratio + 1) / 2) × 4 + 1    // Maps [-1, +1] to [1, 5]
```

---

### 3. Rolling Average: O(1) Score Updates

**Problem:** A naive approach recalculates the average by querying ALL past feedback:
```
average = SUM(score for all feedback) / COUNT(all feedback)   → O(n) reads
```
If a driver has 10,000 trips, that's 10,000 database reads per new feedback.

**Our Solution:** Store `totalScore` and `totalTrips` directly on the Driver document:
```
// When new feedback (score = 4.2) arrives:
newTotalScore = driver.totalScore + 4.2
newTotalTrips = driver.totalTrips + 1
newAverage    = newTotalScore / newTotalTrips
```

| Approach | DB Reads per Update | Time Complexity |
|----------|-------------------|----------------|
| Naive (re-sum all) | `n` (all feedback) | `O(n)` |
| Rolling average | `1` (driver doc) | `O(1)` |

**Atomicity:** We use MongoDB's `$inc` and `$set` operators to update these fields atomically, preventing race conditions when two pieces of feedback arrive simultaneously.

---

### 4. Alert Anti-Spam: Cooldown Mechanism

**Problem:** If a driver gets 10 bad reviews in 5 minutes, they'd get 10 alerts.

**Solution:** Before creating an alert, we check:
```
timeSinceLastAlert = now - lastAlert.createdAt
if timeSinceLastAlert < COOLDOWN_SECONDS → skip alert
```

Default cooldown: **1 hour** (configurable via `ALERT_COOLDOWN_SECONDS` env var).

---

### 5. Feature Flags: Runtime Configurability

The `/api/config/flags` endpoint returns:
```json
{
  "enableRiderFeedback": true,
  "enableMarshalFeedback": false,
  "enableTripIdField": true,
  "enableSentimentDetails": true,
  "enableAlertDashboard": true
}
```

The frontend fetches these flags on page load and **conditionally renders** UI sections. This means we can enable/disable features (like marshal feedback) without deploying new code.

---

## OOP Principles Used

| Principle | Where Applied |
|-----------|--------------|
| **Single Responsibility** | Each class has one job (e.g., `AlertService` only handles alerts) |
| **Open/Closed** | `IQueue<T>` interface — swap InMemory for Redis without changing consumers |
| **Dependency Inversion** | Controllers depend on interfaces, not concrete classes |
| **Dependency Injection** | All dependencies passed via constructor (see `Server.ts`) |
| **Singleton** | `Database` class ensures one MongoDB connection pool |
| **Repository Pattern** | Data access isolated in `*Repository` classes |

---

## Project Structure

```
backend/src/
├── config/
│   ├── Database.ts              # Singleton MongoDB connection
│   └── FeatureFlags.ts          # Static feature flag config
├── interfaces/
│   ├── ISentimentAnalyzer.ts    # Sentiment engine contract
│   ├── IQueue.ts                # Queue abstraction contract
│   ├── IDriverService.ts        # Driver operations contract
│   ├── IAlertService.ts         # Alert system contract
│   └── index.ts                 # Barrel exports
├── types/
│   ├── model.types.ts           # MongoDB document types
│   ├── request.types.ts         # API request DTOs
│   └── response.types.ts        # API response DTOs
├── models/
│   ├── Driver.model.ts          # Mongoose schema: Driver
│   ├── Feedback.model.ts        # Mongoose schema: Feedback
│   └── Alert.model.ts           # Mongoose schema: Alert
├── repositories/
│   ├── DriverRepository.ts      # Driver data access
│   ├── FeedbackRepository.ts    # Feedback data access
│   └── AlertRepository.ts       # Alert data access
├── services/
│   ├── SentimentAnalysisService.ts   # Bag-of-words engine
│   ├── InMemoryQueue.ts              # Generic async queue
│   ├── DriverService.ts              # Rolling average logic
│   ├── AlertService.ts               # Threshold alert + anti-spam
│   ├── FeedbackProcessorService.ts   # Queue worker orchestrator
│   └── FeatureFlagService.ts         # Flag retrieval
├── controllers/
│   ├── FeedbackController.ts    # POST /api/feedback
│   ├── DriverController.ts      # GET /api/drivers
│   └── ConfigController.ts      # GET /api/config/flags
├── routes/
│   ├── feedback.routes.ts
│   ├── driver.routes.ts
│   └── config.routes.ts
└── Server.ts                    # Entry point & DI composition root
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/feedback` | Submit rider/marshal feedback |
| `GET` | `/api/drivers` | List all drivers with scores |
| `GET` | `/api/drivers/:driverId` | Get single driver details |
| `GET` | `/api/drivers/alerts/all` | List all alerts |
| `GET` | `/api/config/flags` | Get feature flags |
| `GET` | `/api/health` | Health check |

### Sample Request: Submit Feedback
```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "DRV001",
    "driverName": "Rajesh Kumar",
    "tripId": "TRIP-1234",
    "feedbackText": "Very rude driver, was speeding the whole time. Felt unsafe.",
    "submittedBy": "rider"
  }'
```

### Sample Response
```json
{
  "success": true,
  "message": "Feedback received and queued for processing.",
  "data": {
    "feedbackId": "fb_1708523456789",
    "driverId": "DRV001",
    "sentimentScore": 1,
    "sentimentLabel": "Very Negative",
    "matchedWords": ["-rude", "-speeding", "-unsafe"],
    "queuePosition": 1
  },
  "timestamp": "2026-02-21T10:30:56.789Z"
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation
```bash
cd backend
npm install
```

### Running
```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

### Environment Variables
Copy `.env` and adjust values as needed:
```
MONGO_URI=mongodb://localhost:27017/driver-sentiment-engine
PORT=5000
QUEUE_POLL_INTERVAL_MS=2000
ALERT_THRESHOLD=2.5
ALERT_COOLDOWN_SECONDS=3600
```
