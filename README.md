# TUT Academic Risk Early Warning Agent

AI-powered system to identify academically at-risk students at Tshwane University of Technology.

## Project Structure
```
├── frontend/       React + Vite + Tailwind CSS
├── backend/        Node.js + Express API
└── ai-service/     Python FastAPI AI Engine
```

## Quick Start

### 1. Supabase
- Create a project at https://supabase.com
- Copy `.env.example` files and fill in your credentials

### 2. Backend
```bash
cd backend && npm install && npm run dev
```

### 3. AI Service
```bash
cd ai-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
```

### 4. Frontend
```bash
cd frontend && npm install && npm run dev
```

## Phases
- [x] Phase 1 – Folder structure & config
- [ ] Phase 2 – Supabase schema & seed data
- [ ] Phase 3 – Node.js backend (REST API)
- [ ] Phase 4 – Python AI service
- [ ] Phase 5 – React frontend
