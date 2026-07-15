
<div align="center">

# 🎯 Interview AI

**AI-powered interview preparation — from job description to ready-for-battle candidate.**

Upload a resume (or describe yourself), paste a job description, and get a personalized interview strategy: match score, ATS feedback, tailored questions with model answers, skill gaps, a day-by-day prep roadmap, and a downloadable ATS-friendly resume PDF.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

[Live Demo](#) 
</div>

---

## 📖 Overview

Most interview prep tools give generic advice. **Interview AI** grounds its output in *your* actual background and the *specific* job you're targeting — parsing your resume (or self-description) alongside a job description to generate a structured, personalized prep report using Google Gemini.

Every user gets an account, so reports are saved and can be revisited before the interview.

## ✨ Features

- 🔐 **Authentication** — JWT-based signup/login/logout with cookie sessions and protected routes
- 📄 **Resume parsing** — upload a PDF resume, or provide a free-text self-description instead
- 🤖 **AI-generated reports** — structured JSON output from Gemini, covering:
  - Match score against the target role
  - ATS score with actionable feedback
  - Technical & behavioral interview questions with model answers
  - Skill gaps to close before the interview
  - A day-by-day preparation roadmap
- 💾 **Persistence** — every report is saved to MongoDB and tied to the user's account
- 📑 **Tailored resume export** — generates an ATS-friendly resume PDF for the specific role, via Puppeteer
- 🖥️ **Interactive report UI** — browse questions, gaps, and roadmap in a dedicated report view

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, SCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT, cookie-based sessions |
| File handling | Multer (uploads), PDF parsing |
| PDF generation | Puppeteer |
| AI | Google GenAI (Gemini), structured JSON responses |

## 🧩 Architecture

```
┌────────────┐        REST + cookies         ┌──────────────┐
│  React SPA │  ───────────────────────────▶ │ Express API  │
│ (Vite, 5173)│ ◀─────────────────────────── │ (Node, 3000) │
└────────────┘                                └──────┬───────┘
                                                       │
                                      ┌────────────────┼─────────────────┐
                                      ▼                ▼                 ▼
                               ┌────────────┐   ┌─────────────┐   ┌────────────┐
                               │  MongoDB   │   │ Google Gemini│   │ Puppeteer  │
                               │ (Mongoose) │   │  (GenAI SDK) │   │ (PDF gen)  │
                               └────────────┘   └─────────────┘   └────────────┘
```

**Flow:** user submits a job description + resume/self-description → backend parses the resume (if provided) → structured prompt sent to Gemini → AI returns structured JSON (score, questions, roadmap, etc.) → report saved to MongoDB → rendered in the interview report UI → user can generate a tailored resume PDF for the same role.

## 📂 Project Structure

```
Interview-AI/
├── Backend/
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/          # DB connection, env setup
│       ├── controllers/     # route handlers
│       ├── middlewares/     # auth guards, error handling
│       ├── models/          # Mongoose schemas
│       ├── routes/          # API route definitions
│       └── services/        # Gemini integration, PDF generation
└── Frontend/
    └── src/
        └── features/
            ├── auth/         # login, signup, profile
            └── interview/    # report generation & display
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB connection string (local or Atlas)
- A Google Gemini API key

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/interview-ai.git
cd interview-ai
```

### 2. Configure environment variables

Create a `.env` file inside `Backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
```

### 3. Install dependencies

```bash
cd Backend && npm install
cd ../Frontend && npm install
```

### 4. Run the app

```bash
# Terminal 1 — backend (http://localhost:3000)
cd Backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd Frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

> Resume uploads are size-limited for a smooth local experience, and CORS is configured with credentials enabled for local dev.

## 🗺️ Roadmap

- [ ] Deploy live demo
- [ ] Add mock interview mode with voice input
- [ ] Support multiple resume versions per user
- [ ] Export prep roadmap as a calendar (.ics)

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change, or submit a PR directly for small fixes.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Open a pull request

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

## 👤 Author

**Your Name**
[GitHub](#) · [LinkedIn](#) · [Portfolio](#)

</div>
