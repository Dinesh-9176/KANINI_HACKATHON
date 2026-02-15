"""Lightweight Supabase REST client using httpx."""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_client: httpx.Client | None = None


def get_client() -> httpx.Client:
    """Return a reusable httpx client with Supabase headers."""
    global _client
    if _client is None:
        _client = httpx.Client(
            base_url=f"{SUPABASE_URL}/rest/v1",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            timeout=10.0,
        )
    return _client


def table_insert(table: str, data: dict) -> dict:
    """INSERT a row into a table. Returns the inserted row."""
    client = get_client()
    resp = client.post(f"/{table}", json=data)
    resp.raise_for_status()
    rows = resp.json()
    return rows[0] if isinstance(rows, list) and rows else rows


def table_select(table: str, params: dict | None = None) -> list:
    """SELECT rows from a table/view with optional query params."""
    client = get_client()
    resp = client.get(f"/{table}", params=params or {})
    resp.raise_for_status()
    return resp.json()


def table_select_one(table: str, params: dict | None = None) -> dict | None:
    """SELECT a single row."""
    rows = table_select(table, params)
    return rows[0] if rows else None


def table_update(table: str, match_params: dict, data: dict) -> list:
    """UPDATE rows matching params."""
    client = get_client()
    resp = client.patch(f"/{table}", params=match_params, json=data)
    if resp.status_code >= 400:
        print(f"[Supabase ERROR] {resp.status_code} on PATCH /{table}: {resp.text}")
    resp.raise_for_status()
    return resp.json()
