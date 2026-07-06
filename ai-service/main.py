# ============================================================
# main.py — AI Service Core
# FastAPI application that receives questions and returns AI answers
# ============================================================
import os
import uuid
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ai-service")

app = FastAPI(title="Enterprise AI Service", version="1.0.0")

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# In-memory conversation history (Phase 1 — Redis upgrade in Week 5)
conversation_history = {}

# ── REQUEST/RESPONSE MODELS ─────────────────────────────────
class AskRequest(BaseModel):
    question: str
    user_id: str
    conversation_id: str
    channel: str = "web"

class AskResponse(BaseModel):
    answer: str
    user_id: str
    request_id: str
    timestamp: str
    tokens_used: int
    model_used: str

# ── ENDPOINTS ───────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    request_id = str(uuid.uuid4())[:8]

    # Validation
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    logger.info(f"[{request_id}] User: {request.user_id} | Q: {request.question[:80]}")

    try:
        # Get or create conversation history
        if request.user_id not in conversation_history:
            conversation_history[request.user_id] = []

        history = conversation_history[request.user_id][-10:]  # Last 5 exchanges

        system_message = {
            "role": "system",
            "content": (
                "You are an enterprise AI assistant for a life sciences company. "
                "You help with sales data, clinical trial information, financial reports, "
                "and document analysis. Always be professional, accurate, and concise. "
                "If you don't know something, say so clearly."
            )
        }

        messages = [system_message] + history + [
            {"role": "user", "content": request.question}
        ]

        # Call OpenAI
        response = client.chat.completions.create(
            model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        answer = response.choices[0].message.content
        tokens_used = response.usage.total_tokens

        # Store in conversation history
        conversation_history[request.user_id].append(
            {"role": "user", "content": request.question}
        )
        conversation_history[request.user_id].append(
            {"role": "assistant", "content": answer}
        )

        logger.info(f"[{request_id}] Tokens used: {tokens_used}")

        return AskResponse(
            answer=answer,
            user_id=request.user_id,
            request_id=request_id,
            timestamp=datetime.utcnow().isoformat(),
            tokens_used=tokens_used,
            model_used=os.getenv("LLM_MODEL", "gpt-4o-mini")
        )

    except Exception as e:
        logger.error(f"[{request_id}] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Service error: {str(e)}")

@app.delete("/conversation/{user_id}")
async def clear_conversation(user_id: str):
    if user_id in conversation_history:
        del conversation_history[user_id]
    return {"message": f"Conversation cleared for user {user_id}"}
