# SkillSwap – Peer-to-Peer Skill Exchange Platform

SkillSwap is a full-stack MERN web application designed to democratize learning through direct, non-monetary skill exchange. Grounded in reciprocal learning principles, SkillSwap allows users to teach skills they master in exchange for learning skills offered by other community members.

---

## 🌟 Key Features

- **Reciprocal Skill Matching**: Algorithm matching complementary skills (User A offers what User B wants and vice versa) with compatibility percentages.
- **Role-Based Access Control**: Separate user and administrative role workflows.
- **Real-Time Communication**: Socket.io bidirectional 1-on-1 chat and instant notification system.
- **Exchange & Session Booking Manager**: Complete lifecycle tracking (Pending -> Accepted -> In Progress -> Completed) with session scheduling.
- **Ratings & Review System**: Peer feedback and trust mechanism with star ratings and reviews.
- **Interactive Admin Dashboard**: Platform analytics, user moderation, and category management.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router v6, Axios, Lucide Icons, Context API
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB, Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), bcrypt.js
- **Environment & Utilities**: dotenv, cors, concurrently

---

## 📁 Repository Structure & Team Ownership

```
SkillSwap/
├── client/                 # Frontend React (Vite) Application
│   ├── src/
│   │   ├── assets/         # Static assets and images
│   │   ├── components/     # Reusable UI components (Navbar, Footer, Modals, Cards)
│   │   ├── context/        # Auth, Socket, Notification Context Providers
│   │   ├── hooks/          # Custom React hooks (useAuth, useSocket, useNotification)
│   │   ├── layouts/        # Main, Auth, and Admin Layout wrappers
│   │   ├── pages/          # Application views (Landing, Dashboard, Skills, Chat, Admin)
│   │   ├── services/       # Axios API client modules
│   │   └── utils/          # Helpers and constants
│   ├── index.html
│   └── package.json
│
├── server/                 # Backend Node.js / Express API Server
│   ├── config/             # DB & server configuration
│   ├── controllers/        # Express route controllers
│   ├── middleware/         # Auth, Admin, and Error handling middleware
│   ├── models/             # Mongoose schemas (User, Skill, ExchangeRequest, Session, Message, Review, Notification)
│   ├── routes/             # RESTful API route definitions
│   ├── services/           # Skill matching logic & Socket initialization
│   ├── sockets/            # Socket.io event handlers
│   ├── utils/              # JWT & API response utilities
│   ├── seed.js             # Seed database script with demo data
│   ├── server.js           # Server entry point
│   └── package.json
│
├── README.md               # Complete Project Documentation
├── .env.example            # Environment variables template
└── package.json            # Root workspace orchestrator
```

### 👥 Team Contribution & Modular Work Breakdown

| Developer | Area of Responsibility | Key Modules |
| :--- | :--- | :--- |
| **Developer 1** | Authentication & User Management | Auth Controllers/Routes, JWT Middleware, User Models & Profiles |
| **Developer 2** | Frontend UI & Discovery | Landing Page, Skill Directory, Dashboard UI, Responsive Layouts |
| **Developer 3** | Backend Core & Matching | Skill & Match Services, Exchange Request & Session Booking APIs |
| **Developer 4** | Real-Time Systems & Admin | Socket.io Chat, In-App Notifications, Review System & Admin Portal |

---

## 🚀 Getting Started & Installation

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI.

### Step 1: Install Dependencies

Run the following command from the root directory to install dependencies for root, client, and server:

```bash
# Install root dependencies
npm install

# Install client & server dependencies
npm run install:all
```

### Step 2: Environment Configuration

Create a `.env` file inside the `server/` directory (or copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/skillswap
JWT_SECRET=skillswap_super_secret_jwt_key_2026_academic_project
JWT_EXPIRE=30d
```

### Step 3: Seed Database with Demo Data (Optional)

To populate sample users, skill categories, exchange requests, and reviews for demonstration:

```bash
# From root directory:
npm run seed

# Or from server directory:
cd server
node seed.js
```

#### Demo Accounts (Ready to Test):
| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@skillswap.com` | `admin123` | Full access to Administrative Portal & moderation |
| **User (Dev)** | `alex@example.com` | `password123` | Full-stack developer (React, Node, TypeScript) |
| **User (AI)** | `priya@example.com` | `password123` | AI Researcher (Python, ML) - 100% reciprocal match with Alex |
| **User (Design)** | `marcus@example.com` | `password123` | UI/UX Designer (Figma, Wireframing) |
| **User (Languages)** | `elena@example.com` | `password123` | Language tutor (Spanish, French) |
| **User (Media)** | `david@example.com` | `password123` | Photographer & Videographer - 100% reciprocal match with Elena |

### Step 4: Run the Application

Start both client and server concurrently from the root directory:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 📡 API Overview

### Core & Users
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user & get JWT
- `GET /api/auth/me` - Get current authenticated user profile
- `GET /api/users` - Fetch & search user profiles
- `PUT /api/users/profile` - Update profile & skill preferences

### Skills & Matching
- `GET /api/skills` - Search skills catalog
- `POST /api/skills` - Create new skill
- `GET /api/skills/categories` - Fetch skill categories with counts
- `GET /api/matches` - Get recommended skill matches with compatibility scores

### Exchanges & Scheduling
- `POST /api/exchanges` - Initiate exchange request
- `GET /api/exchanges` - List exchange requests (Pending, Accepted, Completed)
- `PUT /api/exchanges/:id/status` - Accept, reject, or complete an exchange
- `POST /api/sessions` - Schedule an exchange session
- `GET /api/sessions` - List user scheduled sessions
- `PUT /api/sessions/:id/status` - Accept, reject, or complete session

### Communication & Reviews
- `GET /api/messages/:exchangeId` - Fetch real-time chat history
- `POST /api/messages` - Send chat message (also backed by Socket.io)
- `POST /api/reviews` - Post rating and feedback after completed exchange
- `GET /api/reviews/user/:userId` - Fetch user ratings & reviews
- `GET /api/notifications` - Get user notifications

### Administrative Portal (Private/Admin)
- `GET /api/admin/stats` - Fetch platform administration metrics
- `GET /api/admin/users` - User moderation & directory search
- `PUT /api/admin/users/:id/status` - Suspend or activate user account
- `DELETE /api/admin/users/:id` - Delete user account
- `GET /api/admin/skills` - Administrative skills catalog audit
- `DELETE /api/admin/skills/:id` - Remove platform skill
- `GET /api/admin/exchanges` - Complete platform exchanges audit trail

---

## 🔮 Future Scope

- **AI-Powered Matching**: Semantic NLP matching using embedding models.
- **WebRTC Video Conferencing**: Directly hosted live video classroom sessions.
- **Gamification & Time-Credits**: Badging systems and credit token economy for non-direct multi-user exchanges.
- **Mobile Application**: Native iOS & Android version built with React Native.
