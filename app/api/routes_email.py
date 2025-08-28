from fastapi import APIRouter
from typing import Any, Dict, List
from app.services.email_service import fetch_and_reply_emails, send_manual_email
from app.services.persistence import get_all_email_history, get_escalated_emails

router = APIRouter()

@router.post("/fetch")
def fetch_and_reply(max_results: int = 5):
    """Fetch unread emails and auto-reply using RAG"""
    result = fetch_and_reply_emails(max_results)
    return {"status": "success", "details": result}

@router.post("/send")
def send_custom_email(to: str, subject: str, body: str):
    """Send a manual email"""
    response = send_manual_email(to, subject, body)
    return {"status": "sent", "details": response}

@router.get("/history")
def get_email_history() -> Dict[str, Any]:
    """Get all processed email history"""
    try:
        history = get_all_email_history()
        return {
            "status": "success",
            "history": history,
            "total": len(history)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "history": [],
            "total": 0
        }

@router.get("/escalations")
def get_email_escalations() -> Dict[str, Any]:
    """Get all escalated emails"""
    try:
        escalations = get_escalated_emails()
        return {
            "status": "success",
            "escalations": escalations,
            "total": len(escalations)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "escalations": [],
            "total": 0
        }
