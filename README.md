# Personalized Travel Itinerary Planner

AI-powered full-stack travel planning app built with **React**, **FastAPI**, and **Supabase**.

## 🚀 Live Demo
- **Frontend:** [https://your-app.vercel.app](https://your-app.vercel.app)
- **Backend API:** [https://your-app.onrender.com/api/docs](https://your-app.onrender.com/api/docs)

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Framer Motion |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| AI Engine | Groq API (LLaMA3) |
| Auth | Supabase Auth + JWT |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 📋 Features
- ✅ AI-generated day-by-day travel itineraries (Groq/LLaMA3)
- ✅ Multi-step trip builder form
- ✅ Vibe-based personalization (Adventure, Luxury, Romantic...)
- ✅ Budget tracking & currency support
- ✅ Share & Export itineraries
- ✅ Saved Places bookmarking
- ✅ Trip History dashboard
- ✅ Secure authentication (Supabase Auth)
- ✅ Responsive SaaS-style UI

---

## 🏁 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account (free)
- Groq API key (free)

### 1. Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/personalized-travel-planner.git
cd personalized-travel-planner
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your keys:
```bash
cp ../  .env.example .env
```

Run backend:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Fill VITE_API_URL
npm run dev
```

### 4. Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste contents of `backend/app/config/schema.sql` → **Run**
3. Copy your Project URL and API keys to `.env`

---

## 🔑 Environment Variables

### Backend `.env`
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SECRET_KEY=your_jwt_secret
GROQ_API_KEY=your_groq_key
LLM_PROVIDER=groq
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Deployment

### Deploy Backend to Render
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

### Deploy Frontend to Vercel
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Env: `VITE_API_URL=https://your-backend.onrender.com/api`

---

## 📁 Project Structure
```
├── frontend/          # React + Vite
│   └── src/
│       ├── pages/     # All page components
│       ├── components/# Layout, Sidebar
│       ├── api/       # API client
│       └── context/   # Auth context
└── backend/           # FastAPI
    └── app/
        ├── routers/   # API endpoints
        ├── services/  # AI, prompt builder
        ├── models/    # Pydantic schemas
        └── config/    # Supabase, DB schema
```

---

## 👨‍💻 Skills Used
- Python, FastAPI, Generative AI (Groq/LLaMA3)
- React.js, Framer Motion, Lucide Icons
- Supabase (PostgreSQL + Auth + RLS)
- Prompt Engineering, RESTful APIs
- Vercel + Render deployment
