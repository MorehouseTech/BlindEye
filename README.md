# BlindEye

**HBCU Battle of the Brains 2026** | Morehouse College

BlindEye is a dual-sided platform that tackles a problem most businesses don't even know they have: AI chatbots are already recommending (or ignoring) their products to millions of consumers, and nobody is tracking what those chatbots actually say.

On the **business side**, BlindEye gives companies a dashboard showing how ChatGPT, Gemini, and Claude represent their brand. It scores their AI visibility, flags hallucinated product details, and tells them exactly where they're being left out of the conversation.

On the **consumer side**, BlindEye is a TikTok-style product discovery feed. Users scroll through real product videos, and when something catches their eye they can tap to reveal what the AI chatbots actually said about that product behind the scenes. We call this the "Blind Spot" overlay. The idea is simple: if AI is shaping what people buy, people should be able to see how.

The app is fully deployed and live. No local setup required to try it.

## Live App

**Primary URL:** [https://blindeye.app](https://blindeye.app)

**Backup (direct Cloud Run links):**
- Frontend: https://blindeye-web-266143963829.us-central1.run.app
- Backend API: https://blindeye-api-266143963829.us-central1.run.app

Both services are running on Google Cloud Run with auto-scaling. The backend connects to OpenAI, Anthropic, and Google Gemini APIs in real time. There is no mock data in production; the AI visibility tests hit real models and return real responses.

### How to tell if the app started successfully

Open [https://blindeye.app](https://blindeye.app) in your browser (works on mobile and desktop). You should see a login screen. Register a new account or log in, and you'll land on the consumer feed with product videos auto-playing. That means everything is working.

If you want to verify the backend is healthy, hit this endpoint:
```
curl https://blindeye-api-266143963829.us-central1.run.app/feed/posts
```
You should get back a JSON array of posts. If you see data, the API is up.

---

## What the App Does

### Consumer Side (the feed)
- Scroll through a vertical product discovery feed, similar to TikTok
- Each card shows a real product video with brand, price, and AI trust signals
- Tap "Blind Spot" on any card to see what ChatGPT, Gemini, and Claude actually said about that product
- Search for products by keyword and browse by category

### Business Side (the dashboard)
- **AI Credit Score**: An overall score (0-100) representing how visible and accurately represented your business is across AI platforms
- **Chatbot Visibility Cards**: See how each AI platform (ChatGPT, Gemini, Claude) describes your brand, including whether you're mentioned, your position in recommendations, sentiment, and price accuracy
- **AI Visibility Test**: Type any consumer query (like "best running shoes under $150") and see exactly how each AI chatbot responds in real time. The app shows scores per platform, flags hallucinations, and tells you your mention position
- **Insights**: Trend data over time showing engagement, AI mentions, and visibility changes
- **Test Transparency**: Every AI visibility test shows the exact prompt that was sent to each model, the model version used, and the response latency. Nothing is hidden.

### For Judges: Navigating the App

1. Open the app and register an account (any email/password works)
2. You'll land on the **consumer feed**. Scroll through products. Tap "Blind Spot" on a card to see the AI transparency overlay.
3. Tap the briefcase icon in the bottom nav to switch to the **business dashboard**
4. From the dashboard, tap "Generate AI Test" or the "AI Visibility Analytics" card
5. On the visibility test page, type a real query like "best coffee shops in Atlanta" or click one of the suggested queries
6. Watch the results come in across all three AI platforms with scores, hallucination flags, and raw responses

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Python 3.11, Flask, SQLAlchemy, JWT auth |
| AI Integration | OpenAI API (GPT-4o-mini), Anthropic API (Claude), Google Gemini API |
| Database | SQLite (with seed data for demo) |
| Deployment | Google Cloud Run (containerized with Docker), nginx |
| Domain | Custom domain via blindeye.app |

The frontend is a single-page app built with React and TypeScript, bundled by Vite, and served by nginx in a Docker container. The backend is a Flask API running behind gunicorn, also containerized. Both containers are deployed to Cloud Run in `us-central1` with auto-scaling enabled. The AI visibility test makes real-time parallel calls to all three AI providers and compares their responses against known product data to detect hallucinations.

---

## Running Locally

If the live app is down for any reason, you can run everything locally. We included a `run.sh` script that handles both the backend and frontend setup.

### Prerequisites
- Python 3.11+
- Node.js 18+
- API keys for OpenAI, Anthropic, and Gemini (optional, the app falls back to cached/demo data without them)

### Quick Start

```bash
git clone https://github.com/MorehouseTech/BlindEye.git
cd BlindEye
chmod +x run.sh
./run.sh
```

The script will:
1. Create a Python virtual environment and install backend dependencies
2. Start the Flask backend on port 5002
3. Install frontend npm packages
4. Start the Vite dev server on port 5173
5. Print the local URLs when everything is ready

Once you see `Frontend running at http://localhost:5173` in your terminal, open that URL in a browser.

### Manual Setup (if the script doesn't work on your machine)

**Terminal 1: Backend**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (optional)

If you want the AI visibility test to make real API calls locally, create a `.env` file in the root:

```
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
GEMINI_API_KEY=your-key-here
```

Without these keys, the app still works. It falls back to cached responses and demo data so you can still see every feature.

---

## Project Structure

```
BlindEye/
├── backend/                # Flask API
│   ├── app/
│   │   ├── auth/           # Login and registration
│   │   ├── credit/         # AI credit score endpoint
│   │   ├── feed/           # Product feed endpoint
│   │   ├── insights/       # Trend data endpoint
│   │   ├── visibility/     # AI visibility test endpoint
│   │   ├── ai_service.py   # Calls to OpenAI, Anthropic, Gemini
│   │   └── models.py       # Database models
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py              # Entry point
├── frontend/               # React SPA
│   ├── src/
│   │   ├── api/            # Axios client and API wrappers
│   │   ├── components/     # Shared components (CreditGauge, Navbar, etc.)
│   │   ├── context/        # Auth context (JWT token management)
│   │   └── pages/          # All app pages
│   ├── public/
│   │   ├── logos/          # BlindEye and AI platform logos
│   │   └── videos/         # Compressed product videos
│   ├── Dockerfile
│   └── nginx.conf          # Production web server config
├── run.sh                  # One-command local setup script
├── docker-compose.yml      # Docker composition (alternative local setup)
└── .env.example            # Template for environment variables
```

---

## Team

Morehouse College, HBCU Battle of the Brains 2026

- Aren Egwuekwe
- Supreme Constantine
- Marquelle Waterford
- Isaiah Johnson
- Jalen Horton
- Charles Ryans
- Omar White-Evans
- Kanayo Egwuekwe-Maxey
