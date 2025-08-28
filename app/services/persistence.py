import json
import os
import glob
from typing import Any, Dict, List
from datetime import datetime


RUNS_DIR = os.path.join("runs")


def _ensure_dir():
    os.makedirs(RUNS_DIR, exist_ok=True)


def _path(run_id: str) -> str:
    return os.path.join(RUNS_DIR, f"{run_id}.state.json")


def save_state(run_id: str, state: Dict[str, Any]) -> str:
    _ensure_dir()
    path = _path(run_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)
    return path


def load_state(run_id: str) -> Dict[str, Any]:
    path = _path(run_id)
    if not os.path.exists(path):
        raise FileNotFoundError(f"No state found for run_id={run_id}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_all_email_history() -> List[Dict[str, Any]]:
    """Get all processed email history from state files"""
    _ensure_dir()
    history = []
    
    # Find all state files in the runs directory
    pattern = os.path.join(RUNS_DIR, "*.state.json")
    state_files = glob.glob(pattern)
    
    for file_path in state_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                state = json.load(f)
                
            # Extract relevant info for history view
            history_item = {
                "run_id": state.get("run_id", "unknown"),
                "email_id": state.get("email_id", "unknown"),
                "email_content": state.get("email_content", ""),
                "status": state.get("status", "unknown"),
                "final_reply": state.get("final_reply", ""),
                "timestamp": _get_latest_timestamp(state.get("log", [])),
                "rewrite_count": state.get("rewrite_count", 0),
                "validation_result": state.get("validation_result", {})
            }
            history.append(history_item)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            # Skip corrupted or missing files
            continue
    
    # Sort by timestamp, newest first
    history.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    return history


def get_escalated_emails() -> List[Dict[str, Any]]:
    """Get all escalated emails from state files"""
    _ensure_dir()
    escalations = []
    
    # Find all state files in the runs directory
    pattern = os.path.join(RUNS_DIR, "*.state.json")
    state_files = glob.glob(pattern)
    
    for file_path in state_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                state = json.load(f)
                
            # Only include escalated emails
            if state.get("status") == "escalated":
                escalation_item = {
                    "run_id": state.get("run_id", "unknown"),
                    "email_id": state.get("email_id", "unknown"),
                    "email_content": state.get("email_content", ""),
                    "status": state.get("status", "escalated"),
                    "draft_reply": state.get("draft_reply", ""),
                    "timestamp": _get_latest_timestamp(state.get("log", [])),
                    "validation_result": state.get("validation_result", {}),
                    "escalation_reason": state.get("validation_result", {}).get("reason", "Unknown reason")
                }
                escalations.append(escalation_item)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            # Skip corrupted or missing files
            continue
    
    # Sort by timestamp, newest first
    escalations.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    return escalations


def _get_latest_timestamp(log: List[Dict[str, Any]]) -> float:
    """Extract the latest timestamp from the log entries"""
    if not log:
        return 0
    
    timestamps = [entry.get("timestamp", 0) for entry in log]
    return max(timestamps) if timestamps else 0


