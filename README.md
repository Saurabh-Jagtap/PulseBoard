# PulseBoard: Live Polls For Feedback 📊
Instant Feedback. Real-Time Clarity. Minimalist Design.

PulseBoard is a high-performance, real-time polling ecosystem built for creators who value speed and aesthetics. 
In an era of notification fatigue, PulseBoard offers a distraction-free "heartbeat" of audience sentiment, ensuring that every 
vote is captured and reflected instantly across the globe.

[Live Demo](pulse-board-j6w8hwg71-saurabhworkspace123-8359s-projects.vercel.app) | [Backend API](https://pulseboard-vvin.onrender.com)
---

<img width="500" alt="pulse1" src="https://github.com/user-attachments/assets/d13ed3f7-4960-4de4-b839-d21ee31d4a1e" /> 
<img width="500" alt="pulse7" src="https://github.com/user-attachments/assets/021a4a37-455e-44f9-bed6-fbf6c1499cdb" />

<details>
  <summary>Click to view all 10 screenshots</summary>
    <img width="500" alt="pulse2" src="https://github.com/user-attachments/assets/be91d2ce-fa58-4705-a6ac-afedd7ffe869" />

<img width="500" alt="pulse3" src="https://github.com/user-attachments/assets/a9780818-c240-4aab-a759-a2abc167b186" />
<img width="500" alt="pulse4" src="https://github.com/user-attachments/assets/d6632e0f-021b-4464-944d-bd9f8fb02b10" />

<img width="500" alt="pulse5" src="https://github.com/user-attachments/assets/b75101e5-46d4-4b86-9005-94f617d2f587" />
<img width="500" alt="pulse6" src="https://github.com/user-attachments/assets/4b7d13b8-93f0-4744-a4d1-58b03a400b49" />
<img width="500" alt="pulse8" src="https://github.com/user-attachments/assets/b12bd4ad-073f-4956-916d-ce3b7c44c18c" />
<img width="500" alt="pulse10" src="https://github.com/user-attachments/assets/e40e2e3c-e5eb-4fee-a177-ae5d9f840f23" />
<img width="400" alt="pulse9" src="https://github.com/user-attachments/assets/df538fc3-d263-40b5-8bbc-9d5300f66a7a" />
</details>


# 📖 The Project Story: The Quest for the "Live State"
The biggest challenge in building PulseBoard wasn't just collecting votes—it was the synchronization of truth.

In early iterations, we faced the "Ghost Vote" problem: users on slow connections would see outdated results, 
or worse, multiple clients would drift out of sync. We shifted our philosophy from a "Request-Response" model to a 
"Stream-First" architecture. By integrating Socket.IO deeply into the React lifecycle, we achieved a sub-100ms latency for
global state updates. Building PulseBoard taught us that in real-time apps, the UI isn't just a display—it's a living reflection of a distributed database.

# ✨ Key Features
Live Synchronization: Powered by Socket.IO, results update with smooth Framer Motion transitions the moment a vote is cast. No refreshes, no jitter.

- **Flexible Auth Modes:**

**Authenticated:** Secure, verified voting via Clerk.

**Anonymous:** Session-based voting using UUID tokens to prevent double-voting without forcing a login.

**Ghost-User Guard:** A custom logic layer that ensures data integrity when an anonymous user converts to an authenticated user, merging session history seamlessly.

**Minimalist UX:** A bespoke dark/light theme engine designed to keep the focus on the data, not the interface.

**Scalable DB Transactions:** Using Drizzle ORM to handle atomic increments, ensuring vote counts remain accurate even under high concurrency.

---
# 🛠 Tech Stack
Frontend
Backend & Database
Dev-Ops & Auth
---
## 🏗 System Architecture
```
graph TD
    A[Client - React/Vite] -- Real-time Updates --> B(Socket.IO Server)
    A -- Auth Requests --> C{Clerk Auth}
    A -- REST API --> D[Express Backend]
    D -- Query/Mutate --> E[(PostgreSQL - Neon DB)]
    E -- Drizzle ORM --> D
    B -- Broadcast --> A
    D -- Emit Event --> B
```
---
### 🚀 Key Challenges & Learnings

1. The CORS Preflight Maze
Deploying on Render (Backend) and Vercel (Frontend) presented significant CORS hurdles. Because Vercel generates unique preview URLs for every deployment, hardcoding a single Access-Control-Allow-Origin was insufficient.
- Learning: Implemented a dynamic origin-checking function in the Express middleware that validates against a regex of allowed Vercel subdomains, balancing security with developer flexibility.

2. Atomic Reliability with Drizzle
High-frequency voting can lead to race conditions.
Learning: Leveraged Drizzle ORM transactions to ensure that "Read-Modify-Write" cycles for vote counts were atomic. We moved the increment logic to the database level ($count = count + 1$) rather than calculating it in the application logic.

3. Real-time Bottlenecks
Handling hundreds of concurrent socket connections on a free-tier Render instance required aggressive resource management.
Learning: Optimized the Socket.IO payload size and implemented a "debounce" on the broadcast frequency to prevent the main thread from blocking during voting spikes.
---
# 🛠 Getting Started
**Prerequisites**
- Node.js (v18+)
- A Neon DB (PostgreSQL) account
- A Clerk project for authentication

# Installation
1. **Clone the repository:**
```
git clone https://github.com/your-username/pulseboard.git
cd pulseboard
```
2. **Backend Setup**
```
cd backend
pnpm install
# Configure your .env with DATABASE_URL and CLERK_SECRET_KEY
pnpm run dev
```
3. **Frontend Setup**
```
cd frontend
pnpm install
# Configure your .env with VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL
pnpm run dev
```
---
# 🔮 Future Scope
- **Advanced Analytics:** Export poll data to CSV/JSON for creators.
- **Scheduled Polls:** Set expiration timers and "Go-Live" windows.
- **Embeddable Widgets:** Allow creators to drop a PulseBoard poll into their own blogs or portfolios via an iframe or Web Component.

PulseBoard was built with ⚡ and ☕ for the Chaicode Cohort Hackathon.
**Build in Public:** Follow the journey on [Twitter/X] or [LinkedIn].
