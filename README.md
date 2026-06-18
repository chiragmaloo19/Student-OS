# Student OS 🎓

> An all-in-one productivity and placement tracking dashboard for college students — with a dedicated TPO admin panel.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS v3      |
| Backend     | Node.js + Express.js                   |
| Database    | PostgreSQL via Supabase                 |
| Auth        | Supabase Auth *(Day 2)*                |
| File Storage| Cloudinary *(Day 5)*                   |
| AI          | OpenAI gpt-4o-mini *(Day 6)*           |
| Email       | Resend API *(Day 6)*                   |

---

## Roles

| Role    | Description                                             |
|---------|---------------------------------------------------------|
| Student | Tracks DSA, tasks, placements, CGPA, habits, study plans|
| Admin   | Views placement stats, posts announcements, exports data |

---

## Project Structure

```
student-os/
├── client/          # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/ui/   # Button, Input, Card, Badge, Spinner, PageLayout
│   │   ├── pages/
│   │   │   ├── auth/        # Login, Signup
│   │   │   ├── student/     # Dashboard, Tasks, DSA, Placement...
│   │   │   └── admin/       # AdminDashboard
│   │   ├── hooks/           # useApi
│   │   ├── context/         # AuthContext
│   │   ├── lib/             # supabase.js, api.js
│   │   └── utils/           # helpers.js
└── server/          # Node.js + Express backend
    ├── routes/      # health.js (more on Day 2+)
    ├── middleware/  # logger.js, errorHandler.js
    └── lib/         # supabaseAdmin.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & install

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Set up environment variables

**client/.env.local**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000
```

**server/.env**
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_URL=http://localhost:5173
```

### 3. Run locally

Open **two terminals**:

```bash
# Terminal 1 — Frontend
cd client
npm run dev
# → http://localhost:5173

# Terminal 2 — Backend
cd server
node index.js
# → http://localhost:5000
```

### 4. Verify

- Frontend: visit `http://localhost:5173`
- Backend health check: `GET http://localhost:5000/api/health`

---

## Day-by-Day Build Log

| Day | Focus                                      | Status  |
|-----|--------------------------------------------|---------|
| 1   | Project scaffold, UI components, page stubs | ✅ Done |
| 2   | Supabase Auth (login, signup, roles)        | 🔜 Next |
| 3   | Student modules — Tasks, DSA, Habits        | 🔜      |
| 4   | Placement Hub + Admin Panel                 | 🔜      |
| 5   | Resume upload (Cloudinary)                  | 🔜      |
| 6   | AI Study Plans + Email (OpenAI + Resend)    | 🔜      |
| 7   | Polish, testing, deployment                 | 🔜      |

---

## License
MIT
