import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pypdf import PdfReader

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
KB_PATH = PROJECT_ROOT / "CHATBOT_KNOWLEDGE_BASE.md"
PDF_KB_PATH = BASE_DIR / "Ride_Lanka_Chatbot_Knowledge_Base.pdf"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
MAX_HISTORY_TURNS = int(os.getenv("MAX_HISTORY_TURNS", "8"))
BACKEND_API_BASE = os.getenv("BACKEND_API_BASE", "http://localhost:5000/api").rstrip("/")
PLACES_CONTEXT_TTL_SECONDS = int(os.getenv("PLACES_CONTEXT_TTL_SECONDS", "120"))
MAX_PLACES_IN_CONTEXT = int(os.getenv("MAX_PLACES_IN_CONTEXT", "80"))
ALLOW_GENERAL_AI_FALLBACK = os.getenv("ALLOW_GENERAL_AI_FALLBACK", "false").strip().lower() in (
    "1",
    "true",
    "yes",
    "on",
)

FALLBACK_MODELS = [
    GEMINI_MODEL,
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]


def load_knowledge_base() -> str:
    if KB_PATH.exists():
        return KB_PATH.read_text(encoding="utf-8", errors="ignore")
    return "Knowledge base file not found."


def load_pdf_knowledge() -> str:
    """Read project PDF knowledge file and return extracted text."""
    if not PDF_KB_PATH.exists():
        return ""

    try:
        reader = PdfReader(str(PDF_KB_PATH))
        pages_text: List[str] = []
        for page in reader.pages:
            text = page.extract_text() or ""
            if text.strip():
                pages_text.append(text.strip())
        return "\n\n".join(pages_text)
    except Exception:
        # Keep service running even if the PDF has extraction issues.
        return ""


def build_sections(knowledge_text: str) -> List[str]:
    """Split knowledge text into retrieval-friendly chunks for local fallback."""
    raw_chunks = [chunk.strip() for chunk in re.split(r"\n{2,}", knowledge_text) if chunk.strip()]

    sections: List[str] = []
    rolling = ""
    for chunk in raw_chunks:
        if len(chunk) < 80:
            rolling = f"{rolling} {chunk}".strip()
            continue

        if rolling:
            merged = f"{rolling} {chunk}".strip()
            sections.append(merged[:1200])
            rolling = ""
        else:
            sections.append(chunk[:1200])

    if rolling:
        sections.append(rolling[:1200])

    return sections


MARKDOWN_KB_TEXT = load_knowledge_base()
PDF_KB_TEXT = load_pdf_knowledge()
KNOWLEDGE_BASE_TEXT = "\n\n".join(
    part for part in [MARKDOWN_KB_TEXT, PDF_KB_TEXT] if part and part.strip()
)
KB_SECTIONS = build_sections(KNOWLEDGE_BASE_TEXT)
_PLACES_CONTEXT_CACHE = ""
_PLACES_CONTEXT_CACHE_AT = 0.0

SYSTEM_PROMPT = (
    "You are the RideLanka assistant for this bike rental platform. "
    "Use ONLY project-relevant information from the provided knowledge context and user message, including PDF-derived content. "
    "If information is not present in the provided context, say you do not have that information in the current knowledge base. "
    "Keep answers clear and practical. If you mention routes, include exact paths. "
    "Never reveal secrets, API keys, or internal credentials."
)

GENERAL_ASSISTANT_PROMPT = (
    "You are the RideLanka assistant for this bike rental platform. "
    "First prefer project-specific context when available, but if the user asks general questions "
    "outside the project knowledge base, provide a clear and helpful general AI answer. "
    "When an answer is not project-specific, state briefly that it is a general answer. "
    "Never reveal secrets, API keys, or internal credentials."
)


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [FRONTEND_ORIGIN]}})


def to_gemini_contents(user_message: str, history: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    contents: List[Dict[str, Any]] = []

    trimmed_history = history[-MAX_HISTORY_TURNS:] if history else []
    for item in trimmed_history:
        role = item.get("role", "user")
        text = (item.get("content") or "").strip()
        if not text:
            continue
        mapped_role = "model" if role == "assistant" else "user"
        contents.append({"role": mapped_role, "parts": [{"text": text}]})

    contents.append({"role": "user", "parts": [{"text": user_message}]})
    return contents


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9]{3,}", text.lower())


def local_kb_answer(user_message: str) -> str:
    """Fallback answer from local knowledge base when Gemini is unavailable."""
    query_tokens = set(tokenize(user_message))
    if not query_tokens:
        return (
            "I can help with RideLanka features like bookings, payments, vendor/admin flows, "
            "reviews, and routes. Please ask a specific question."
        )

    scored: List[tuple[int, str]] = []
    for section in KB_SECTIONS:
        section_tokens = set(tokenize(section))
        score = len(query_tokens.intersection(section_tokens))
        if score > 0:
            scored.append((score, section))

    if not scored:
        return (
            "I could not find that exact detail in the current RideLanka knowledge base. "
            "Try asking with words like booking, payment, vendor, admin, review, or destination."
        )

    scored.sort(key=lambda item: item[0], reverse=True)
    top_sections = [text for _, text in scored[:2]]

    snippets = []
    for section in top_sections:
        compact = " ".join(section.split())
        snippets.append(compact[:420])

    return (
        "Gemini is temporarily unavailable for quota limits, so here is the best answer from local knowledge:\n\n"
        + "\n\n".join(f"- {snippet}" for snippet in snippets)
    )


def build_place_line(place: Dict[str, Any]) -> str:
    name = (place.get("name") or "Unnamed Place").strip()
    city = (place.get("city") or "Unknown city").strip()
    district = (place.get("district") or "").strip()
    category = (place.get("category") or "").strip()
    description = " ".join(str(place.get("description") or "").split())[:220]
    fee = (place.get("entranceFee") or "").strip()
    hours = (place.get("openingHours") or "").strip()
    featured = "featured" if place.get("isFeatured") else "not featured"
    status = (place.get("status") or "active").strip()

    details = [f"{name} ({city}"]
    if district:
        details.append(f", {district}")
    details.append(")")

    suffix_parts = [part for part in [category, status, featured] if part]
    if fee:
        suffix_parts.append(f"fee: {fee}")
    if hours:
        suffix_parts.append(f"hours: {hours}")
    if description:
        suffix_parts.append(f"desc: {description}")

    return "- " + "".join(details) + " | " + " | ".join(suffix_parts)


def fetch_places_context() -> str:
    global _PLACES_CONTEXT_CACHE, _PLACES_CONTEXT_CACHE_AT

    now = time.time()
    if _PLACES_CONTEXT_CACHE and (now - _PLACES_CONTEXT_CACHE_AT) < PLACES_CONTEXT_TTL_SECONDS:
        return _PLACES_CONTEXT_CACHE

    url = f"{BACKEND_API_BASE}/places"
    try:
        response = requests.get(url, timeout=8)
        response.raise_for_status()
        places = response.json()
        if not isinstance(places, list) or not places:
            _PLACES_CONTEXT_CACHE = ""
            _PLACES_CONTEXT_CACHE_AT = now
            return ""

        lines = [build_place_line(place) for place in places[:MAX_PLACES_IN_CONTEXT]]
        _PLACES_CONTEXT_CACHE = "LIVE DESTINATIONS DATA FROM BACKEND API:\n" + "\n".join(lines)
        _PLACES_CONTEXT_CACHE_AT = now
        return _PLACES_CONTEXT_CACHE
    except Exception:
        return _PLACES_CONTEXT_CACHE


def build_runtime_context() -> str:
    parts = ["PROJECT KNOWLEDGE CONTEXT:\n\n" + KNOWLEDGE_BASE_TEXT]
    places_context = fetch_places_context()
    if places_context:
        parts.append(places_context)
    return "\n\n".join(parts)


def should_generalize_answer(answer: str) -> bool:
    text = answer.lower()
    kb_like_refusal = (
        "knowledge base" in text
        and any(
            phrase in text
            for phrase in [
                "do not have",
                "don't have",
                "could not find",
                "cannot find",
                "can't find",
                "don't know",
                "not available",
                "not present",
            ]
        )
    )
    signals = [
        "do not have that information in the current knowledge base",
        "i don't have that information in the current knowledge base",
        "i do not have information about",
        "i do not have that information",
        "not present in the provided context",
        "could not find that exact detail in the current ridelanka knowledge base",
    ]
    return kb_like_refusal or any(signal in text for signal in signals)


def call_gemini_general(user_message: str, history: List[Dict[str, str]]) -> str:
    payload = {
        "system_instruction": {"parts": [{"text": GENERAL_ASSISTANT_PROMPT}]},
        "contents": to_gemini_contents(user_message, history),
        "generationConfig": {
            "temperature": 0.4,
            "topP": 0.9,
            "maxOutputTokens": 900,
        },
        "tools": [],
    }

    for model_name in dict.fromkeys(FALLBACK_MODELS):
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
            f"?key={GEMINI_API_KEY}"
        )

        response = requests.post(url, json=payload, timeout=45)
        if not response.ok:
            continue

        data = response.json()
        candidates = data.get("candidates") or []
        if not candidates:
            continue

        parts = candidates[0].get("content", {}).get("parts", [])
        text_chunks = [p.get("text", "") for p in parts if p.get("text")]
        answer = "\n".join(text_chunks).strip()
        if answer:
            return f"General AI answer (not from RideLanka knowledge base):\n\n{answer}"

    return "I could not generate a general AI answer right now. Please try again."


def call_gemini(user_message: str, history: List[Dict[str, str]]) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is missing in environment.")

    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": to_gemini_contents(user_message, history),
        "generationConfig": {
            "temperature": 0.3,
            "topP": 0.9,
            "maxOutputTokens": 900,
        },
        "tools": [],
    }

    # Inject knowledge as grounded context in the first user turn to keep request self-contained.
    payload["contents"].insert(
        0,
        {
            "role": "user",
            "parts": [
                {
                    "text": build_runtime_context()
                }
            ],
        },
    )

    last_http_error: requests.HTTPError | None = None

    def should_try_next_model(status_code: int, body_text: str) -> bool:
        body = body_text.lower()
        if status_code in (404, 429, 500, 503):
            return True
        if status_code == 403 and (
            "quota" in body
            or "resource_exhausted" in body
            or "rate" in body
            or "limit" in body
        ):
            return True
        return False

    for model_name in dict.fromkeys(FALLBACK_MODELS):
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
            f"?key={GEMINI_API_KEY}"
        )

        response = requests.post(url, json=payload, timeout=45)

        if response.ok:
            data = response.json()
            candidates = data.get("candidates") or []
            if not candidates:
                return "I could not generate a response right now. Please try again."

            parts = candidates[0].get("content", {}).get("parts", [])
            text_chunks = [p.get("text", "") for p in parts if p.get("text")]
            answer = "\n".join(text_chunks).strip()
            if not answer:
                return "I could not generate a response right now. Please try again."

            if ALLOW_GENERAL_AI_FALLBACK and should_generalize_answer(answer):
                return call_gemini_general(user_message, history)

            return answer

        if should_try_next_model(response.status_code, response.text):
            continue

        try:
            response.raise_for_status()
        except requests.HTTPError as err:
            last_http_error = err
            break

    if last_http_error is not None:
        raise last_http_error

    raise RuntimeError("No compatible Gemini model found. Update GEMINI_MODEL in chatbotbackend/.env.")


@app.get("/api/health")
def health():
    return jsonify(
        {
            "ok": True,
            "service": "ridelanka-chatbot",
            "model": GEMINI_MODEL,
            "knowledge_base_loaded": bool(KNOWLEDGE_BASE_TEXT),
            "pdf_knowledge_loaded": bool(PDF_KB_TEXT),
            "general_ai_fallback_enabled": ALLOW_GENERAL_AI_FALLBACK,
            "places_api_base": BACKEND_API_BASE,
        }
    )


@app.post("/api/chatbot/chat")
def chat():
    try:
        body = request.get_json(silent=True) or {}
        user_message = (body.get("message") or "").strip()
        history = body.get("history") or []

        if not user_message:
            return jsonify({"error": "message is required"}), 400

        # If API key is missing, still provide a useful local fallback answer.
        if not GEMINI_API_KEY:
            return jsonify({"answer": local_kb_answer(user_message), "mode": "local-fallback"})

        answer = call_gemini(user_message, history)
        return jsonify({"answer": answer, "mode": "gemini"})
    except requests.HTTPError as err:
        detail = ""
        if err.response is not None:
            detail = err.response.text[:600]

        # Auto-fallback for quota limits and provider-side availability issues.
        status_code = err.response.status_code if err.response is not None else 0
        detail_lower = detail.lower()
        api_key_issue = (
            "api key expired" in detail_lower
            or "invalid api key" in detail_lower
            or "api_key_invalid" in detail_lower
            or "invalid_argument" in detail_lower
        )

        if status_code in (429, 500, 503) or (status_code == 400 and api_key_issue):
            return jsonify(
                {
                    "answer": local_kb_answer(user_message),
                    "mode": "local-fallback",
                    "warning": "Gemini unavailable or API key invalid/expired, answered from local knowledge base",
                }
            )

        return jsonify({"error": "Gemini request failed", "detail": detail}), 502
    except Exception as err:
        return jsonify({"error": str(err)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
