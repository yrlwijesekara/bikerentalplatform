RideLanka Chatbot Flask Backend

What this service does
- Exposes a chatbot API for your frontend
- Uses Gemini API for responses
- Grounds answers using the project knowledge file at ../CHATBOT_KNOWLEDGE_BASE.md

API endpoints
- GET /api/health
- POST /api/chatbot/chat
  Request JSON:
  {
    "message": "How do I check my bookings?",
    "history": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ]
  }

Setup
1. Create .env from .env.example in this folder.
2. Install dependencies:
   pip install -r requirements.txt
3. Run server:
   python app.py

Environment variables
- GEMINI_API_KEY
- GEMINI_MODEL (default: gemini-2.5-flash)
  - Recommended when flash quota is exhausted: `gemini-2.5-pro` or `gemini-2.5-flash-lite`
  - The backend also auto-fallbacks across: `gemini-2.5-pro`, `gemini-2.5-flash-lite`, `gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`
- ALLOW_GENERAL_AI_FALLBACK (default: false)
  - When `true`, if a question is outside your knowledge base, the chatbot can return a general AI answer instead of only saying KB does not contain it.
- BACKEND_API_BASE (default: http://localhost:5000/api)
  - Chatbot reads live places from `${BACKEND_API_BASE}/places` and injects them into context (for newly added destinations like Yala National Park).
- PLACES_CONTEXT_TTL_SECONDS (default: 120)
  - Cache duration for places context refresh.
- MAX_PLACES_IN_CONTEXT (default: 80)
  - Limits number of places included in prompt context.
- FRONTEND_ORIGIN (default: http://localhost:5173)
- MAX_HISTORY_TURNS (default: 8)

Frontend integration
- The React app reads VITE_CHATBOT_URL.
- Recommended value:
  VITE_CHATBOT_URL=http://localhost:8000/api/chatbot/chat

Security note
- Do not commit .env files with real keys.
- If an API key was shared in chat or code, rotate it in Google AI Studio.
