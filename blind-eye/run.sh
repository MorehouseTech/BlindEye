#!/usr/bin/env bash
# BlindEye - Local Development Setup
# HBCU Battle of the Brains 2026 | Morehouse College
#
# This script starts both the backend and frontend locally.
# Prerequisites: Python 3.11+, Node.js 18+

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

cleanup() {
    echo ""
    echo "Shutting down..."
    kill "$BACKEND_PID" 2>/dev/null || true
    kill "$FRONTEND_PID" 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

echo "============================================"
echo "  BlindEye - Local Setup"
echo "============================================"
echo ""

# ---- Backend ----
echo "[1/4] Setting up Python virtual environment..."
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    python3 -m venv "$BACKEND_DIR/.venv"
fi

echo "[2/4] Installing backend dependencies..."
"$BACKEND_DIR/.venv/bin/pip" install -q -r "$BACKEND_DIR/requirements.txt"

echo "[3/4] Starting backend on port 5002..."
(
    cd "$BACKEND_DIR"
    .venv/bin/python run.py &
)
BACKEND_PID=$!

# Give the backend a moment to start
sleep 2

# ---- Frontend ----
echo "[4/4] Installing frontend dependencies and starting dev server..."
(
    cd "$FRONTEND_DIR"
    npm install --silent 2>/dev/null
    npx vite --port 5173 &
)
FRONTEND_PID=$!

sleep 3

echo ""
echo "============================================"
echo "  BlindEye is running!"
echo "============================================"
echo ""
echo "  Frontend running at http://localhost:5173"
echo "  Backend running at  http://localhost:5002"
echo ""
echo "  Open http://localhost:5173 in your browser."
echo "  Press Ctrl+C to stop both servers."
echo ""

# Keep the script alive
wait
