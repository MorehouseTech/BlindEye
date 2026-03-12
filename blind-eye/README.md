# Blind Eye

A social commerce platform that gives businesses visibility into how AI recommends their products, and gives users transparent, interest-based product discovery.

---

## Table of Contents
1. [How to Run the App](#getting-started)
2. [Branch Strategy](#branch-strategy)
3. [Repo Structure Explained](#repo-structure-explained)
4. [Team Instructions](#team-instructions)
   - [Feature 3 — Credit Score](#feature-3-team-credit-score)
   - [Feature 4 — AI Visibility Test](#feature-4-team-ai-visibility-test)
5. [Ngrok Setup](#ngrok-temporary-public-endpoints)
6. [Rules](#rules)

---

## Getting Started

### Requirements
- Docker + Docker Compose
- Node 18+
- Python 3.11+

### Running with Docker (recommended)
This spins up the frontend, backend, and MySQL database all at once.
```bash
cp .env.example .env
# open .env and fill in your API keys and secrets
docker-compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

### Running without Docker
If you don't want to deal with Docker during development, you can run each piece separately.

```bash
# Terminal 1 — Frontend
cd frontend
npm install
npm run dev

# Terminal 2 — Backend
cd backend
pip install -r requirements.txt
python run.py
```

You'll need MySQL running locally and your DATABASE_URL set correctly in `.env`.

---

## Branch Strategy

We have 4 branches. Here's what each one is for and the rule around them.

- `main` — this is the demo branch. Only merge here when something is fully working and ready to show judges. Do not develop directly on this branch.
- `dev` — this is the shared integration branch. When your feature is working, you merge into dev first. This is how we catch conflicts before they hit main.
- `feature/credit-score` — this is where the Feature 3 team works. Frontend and backend for the credit score both live here.
- `feature/ai-visibility-test` — this is where the Feature 4 team works. Frontend and backend for the AI visibility test both live here.
- `feature/social-feed` — stretch goal, Feature 1
- `feature/blind-spot` — stretch goal, Feature 2

**The flow is always:** your feature branch → dev → main. Never push directly to dev or main.

---

## Repo Structure Explained

```
blind-eye/
├── frontend/        # Everything the user sees
├── backend/         # The API — receives requests, checks auth, sends responses
└── services/        # The actual logic — credit scoring, AI queries, hallucination detection
```

### Why three separate folders?

Each folder has one job and one job only. This matters because we have 4 engineers working at the same time, and if everything lived in one place people would constantly be stepping on each other's code.

**`frontend/`** is the React app. It talks to the backend through HTTP requests and never touches the database or AI APIs directly. If you're a frontend engineer, you almost never need to leave this folder.

**`backend/`** is the Flask API. Its only job is to sit between the frontend and the services. It receives a request, checks that the user is authenticated, calls the right service function, and sends the result back. There is no heavy logic here on purpose. Think of it as a traffic controller.

**`services/`** is where the real work happens. The credit score algorithm lives here. The code that calls OpenAI and Gemini lives here. The hallucination detection logic lives here. We split this out from the backend so that when we move to Cloud Run, each service can become its own container without touching the Flask layer. For now they're just Python files being imported by the backend.

---

### Inside `backend/app/`

```
app/
├── __init__.py       # Wires everything together. You rarely touch this.
├── config.py         # Reads environment variables. You rarely touch this.
├── extensions.py     # Sets up the database and JWT. You never touch this.
├── models.py         # Database tables. Add new models here when needed.
├── auth/             # Login and registration logic
├── credit/           # Feature 3 — credit score endpoint
└── visibility/       # Feature 4 — AI visibility test endpoint
```

Each folder inside `app/` is a Flask Blueprint. A Blueprint is just Flask's way of letting you define routes in a separate file so two engineers aren't editing the same thing. `auth/` handles login and register. `credit/` handles the credit score endpoint. `visibility/` handles the visibility test endpoint. They all get registered in `__init__.py` and that's the only place they connect to each other.

The routes in `credit/routes.py` and `visibility/routes.py` are intentionally thin stubs right now. They exist to give you a working endpoint skeleton. Your job as a backend engineer is to fill in the TODO inside each route by calling your service function and returning the result.

---

### Inside `services/`

```
services/
├── credit_engine/
│   └── engine.py       # Credit score computation logic
└── visibility_engine/
    └── engine.py       # AI query logic + hallucination detection
```

This is where backend engineers write their actual feature logic. The Flask route calls a function from here, which keeps the route clean and makes it easy to test the logic independently. If you need to add helper files, utility functions, or extra modules for your feature, add them inside your engine folder.

---

### Inside `frontend/src/`

```
src/
├── api/
│   └── client.ts         # Central axios instance. All API calls go through here.
├── context/
│   └── AuthContext.tsx   # Stores the JWT token and exposes login/logout to the whole app.
├── components/
│   └── Navbar.tsx        # Shared nav bar. Add shared components here.
└── pages/
    ├── Login.tsx
    ├── Register.tsx
    ├── Dashboard.tsx
    ├── CreditScore.tsx         # Feature 3 frontend — build here
    └── AIVisibilityTest.tsx    # Feature 4 frontend — build here
```

Pages are where each frontend engineer builds their feature UI. Components are shared pieces used across multiple pages. The `api/client.ts` file is a pre-configured axios instance that automatically attaches the JWT token to every request — always use this instead of calling axios directly.

---

## Team Instructions

### Feature 3 Team — Credit Score

**What you're building:** A weekly credit score for businesses based on engagement signals and AI visibility. Businesses see their score and a breakdown of what's driving it.

**Backend engineer — start here:**
1. Open `services/credit_engine/engine.py`
2. Build out the `compute_credit_score(business_id)` function. It should pull engagement data (likes, comments, conversions) from the database and combine them into a score with a breakdown
3. Once the function returns real data, go to `backend/app/credit/routes.py` and replace the TODO with a call to your function
4. Test your endpoint with: `curl -H "Authorization: Bearer <token>" http://localhost:5000/credit/score`

**Frontend engineer — start here:**
1. Open `frontend/src/pages/CreditScore.tsx`
2. Use `client.get('/credit/score')` from `../api/client` to fetch the score on page load
3. Display the score and the breakdown — a score card and a breakdown chart work well here
4. MUI components you'll probably want: `Card`, `LinearProgress`, `Typography`, `CircularProgress`

---

### Feature 4 Team — AI Visibility Test

**What you're building:** A tool where businesses enter a shopping query and see how ChatGPT and Gemini respond — whether their brand is mentioned, how they compare to competitors, and whether any product details are wrong.

**Backend engineer — start here:**
1. Open `services/visibility_engine/engine.py`
2. Build out `run_visibility_test(query, brand_name)`. It should call the OpenAI API and Gemini API with the query, parse both responses for brand mentions, compare product details against known data, and flag hallucinations with a severity score
3. Add your API keys to `.env` (OPENAI_API_KEY, GEMINI_API_KEY)
4. Once working, go to `backend/app/visibility/routes.py` and replace the TODO with a call to your function, passing in the query and brand from the request body
5. Test with: `curl -X POST -H "Authorization: Bearer <token>" -d '{"query": "best project management tools", "brand": "Blind Eye"}' http://localhost:5000/visibility/run`

**Frontend engineer — start here:**
1. Open `frontend/src/pages/AIVisibilityTest.tsx`
2. Build a form where the business enters a query and their brand name
3. On submit, call `client.post('/visibility/run', { query, brand_name })` and display the results
4. You want to show: which AI platforms mentioned the brand, competitor mentions, and any flagged hallucinations with their severity
5. MUI components you'll probably want: `TextField`, `Button`, `Chip`, `Alert`, `Table`

---

## Ngrok (temporary public endpoints)

While developing locally, use ngrok to get a public URL for the backend so the frontend can hit it from anywhere.

```bash
ngrok http 5000
```

Copy the https URL ngrok gives you and paste it as `VITE_API_URL` in your `.env` file. Restart the frontend after changing this.

---

## Rules

- Never commit your `.env` file. It's in `.gitignore` for a reason.
- Always branch off `dev`, not `main`
- Always merge into `dev` first, never directly into `main`
- If you need a new database model, add it to `backend/app/models.py` and tell the team so nobody's migrations conflict
- If you need a new shared frontend component, add it to `frontend/src/components/` and tell the team
