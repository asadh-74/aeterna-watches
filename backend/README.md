# Aeterna Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your real API keys.

3. Start the server:
   ```bash
   npm run dev    # development
   npm start      # production
   ```

## API Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | `{ message, model }` | AI chat (gemini or ollama) |
| POST | `/api/recommend` | `{ style, budget, occasion }` | Watch recommendation |
| GET | `/api/health` | - | Health check |

## Security
API keys are stored only in `.env` on the server. Never expose them to the frontend.
