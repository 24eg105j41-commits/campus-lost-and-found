# 🎓 Campus Lost & Found

A modern, responsive full-stack web application designed for universities and colleges to streamline reporting, discovering, claiming, and safely recovering lost belongings across campus facilities.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | Modular component architecture, Lucide icons, responsive layout |
| **Backend** | Node.js, Express.js | RESTful JSON API, MVC architecture, centralized error handling |
| **Database** | MongoDB & Mongoose | Schemas for Users, Items, Claims, and Notifications |
| **Authentication** | JWT (JSON Web Tokens) & bcryptjs | Stateless authorization with role-based access control |
| **File Storage** | Multer | Multipart upload middleware for item photos and proof attachments |
| **AI Matching** | Extensible Architecture | Clean baseline heuristics prepared for Stage 2 vector embeddings |

---

## 📂 Project Structure Overview

```
campus-lost-and-found/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Resilient MongoDB Mongoose connection manager
│   │   ├── controllers/
│   │   │   ├── adminController.js    # System-wide metrics, stats, and audit controls
│   │   │   ├── authController.js     # User registration, JWT login, and profile updates
│   │   │   ├── claimController.js    # Claim submissions, proof review, and status tracking
│   │   │   ├── itemController.js     # CRUD for lost/found items, filtering, and searches
│   │   │   └── notificationController.js # Inbox notifications and read state management
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification and role-based route guard
│   │   │   ├── errorMiddleware.js    # 404 handler and global error interceptor
│   │   │   └── uploadMiddleware.js   # Multer storage configuration for item photos
│   │   ├── models/
│   │   │   ├── Claim.js              # Ownership claim schema with proof and review states
│   │   │   ├── Item.js               # Lost & found item schema with AI vector placeholders
│   │   │   ├── Notification.js       # System and user notification schema
│   │   │   └── User.js               # Campus user schema with bcrypt hashing & roles
│   │   ├── routes/
│   │   │   ├── adminRoutes.js        # Protected routes for administrative oversight
│   │   │   ├── authRoutes.js         # Authentication endpoints
│   │   │   ├── claimRoutes.js        # Item claim submission and management routes
│   │   │   ├── healthRoutes.js       # Backend uptime and database connectivity probe
│   │   │   ├── itemRoutes.js         # Item discovery, creation, and match routes
│   │   │   └── notificationRoutes.js # User notification alert routes
│   │   └── services/
│   │       └── aiService.js          # Heuristic matching engine & Stage 2 AI hooks
│   ├── uploads/                      # Local storage directory for item photos
│   ├── .env.example                  # Template for backend environment variables
│   ├── package.json                  # Backend dependencies and scripts
│   └── server.js                     # Express app initialization and server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BackendStatusBadge.jsx# Live visual indicator of backend & DB health
│   │   │   ├── Footer.jsx            # Campus footer branding and links
│   │   │   └── Navbar.jsx            # Responsive navigation bar with mobile drawer
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global authentication state and JWT session manager
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx         # Administrative audit dashboard
│   │   │   ├── DashboardPage.jsx     # User dashboard for reports, claims, and alerts
│   │   │   ├── HomePage.jsx          # Landing page with hero search and campus categories
│   │   │   ├── ItemDetailPage.jsx    # Item view, match suggestions, and claim modal
│   │   │   ├── ItemsPage.jsx         # Browse lost & found directory with real-time filters
│   │   │   ├── LoginPage.jsx         # Campus member login
│   │   │   ├── RegisterPage.jsx      # New user registration with campus role selector
│   │   │   └── ReportItemPage.jsx    # Form to report lost or found belongings
│   │   ├── services/
│   │   │   └── api.js                # Axios client with auto-injected JWT auth token
│   │   ├── App.jsx                   # React Router layout and application shell
│   │   ├── index.css                 # Tailwind CSS directives
│   │   └── main.jsx                  # React application entry point
│   ├── index.html                    # Single Page Application HTML shell
│   ├── package.json                  # Frontend dependencies and scripts
│   ├── postcss.config.js             # PostCSS plugins for Tailwind
│   ├── tailwind.config.js            # Custom color palette and UI tokens
│   └── vite.config.js                # Vite build config with backend API proxy
│
└── README.md                         # Documentation and developer instructions
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB**: A running local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

---

### 2. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Check environment variables in `.env` (a pre-configured `.env` has been created for development):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/campus_lost_and_found
   JWT_SECRET=campus_lost_and_found_super_secret_jwt_key_2026
   JWT_EXPIRE=7d
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   CLIENT_URL=http://localhost:5173
   ```
3. Install backend dependencies (if not already installed):
   ```bash
   npm install
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 📡 Core API Endpoints

### 🩺 Health & Diagnostics
- `GET /api/health` - Check backend uptime, features, and MongoDB connection status.

### 🔐 Authentication
- `POST /api/auth/register` - Create account (Student, Faculty, Staff, Visitor).
- `POST /api/auth/login` - Authenticate with email/password and obtain JWT.
- `GET /api/auth/me` - Retrieve logged-in user profile (`Bearer` token required).
- `PUT /api/auth/profile` - Update profile data.

### 📦 Lost & Found Items
- `GET /api/items` - List items with query filters (`type`, `category`, `building`, `search`, `page`, `limit`).
- `GET /api/items/:id` - Fetch detailed information about a single item.
- `POST /api/items` - Report a lost or found item (supports multiple image uploads).
- `PUT /api/items/:id` - Update report details (Reporter or Admin).
- `DELETE /api/items/:id` - Remove report.
- `GET /api/items/:id/potential-matches` - Fetch suggested match candidates based on category, building, and date proximity.
- `GET /api/items/my-items` - Retrieve all reports authored by the authenticated user.

### 🤝 Claims & Verification
- `POST /api/claims` - File an ownership claim with description of proof.
- `GET /api/claims/my-claims` - List claims submitted by the current user.
- `GET /api/claims/item/:itemId` - View all claims submitted for a reported item.
- `PUT /api/claims/:id/status` - Approve, reject, or mark a claim as recovered.

### 🔔 Notifications
- `GET /api/notifications` - Retrieve alerts and status change notices.
- `PUT /api/notifications/:id/read` - Mark single notification as read.
- `PUT /api/notifications/read-all` - Mark all notifications as read.

### 🛡️ Administration
- `GET /api/admin/stats` - Overall statistics, recovery rate, and category breakdowns.
- `GET /api/admin/users` - List registered campus members.
- `GET /api/admin/claims` - System-wide audit log of claims.

---

## 🤖 Future AI Matching Architecture

To avoid superficial or misleading mock claims, **Stage 1** implements transparent heuristic scoring (matching item category, campus building proximity, and timestamp windows). 

The backend is pre-structured to integrate real multi-modal AI matching in **Stage 2**:
1. **Embedding Generation (`aiService.js`)**: Hook to generate high-dimensional text embeddings (`text-embedding-3-small` or HuggingFace transformers) from item descriptions.
2. **Visual Feature Extraction**: Vision model integration (such as CLIP or Gemini Vision) to detect item colors, brands, and categories directly from uploaded photos.
3. **Cosine Similarity**: Vector search in MongoDB (Atlas Vector Search) to discover semantic matches even when reporters describe items using different vocabulary (e.g. *"MacBook sleeve"* vs *"laptop case"*).
