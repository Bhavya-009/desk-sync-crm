import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


from database import client, tickets_collection, notes_collection
from models import (
    CreateTicketRequest,
    UpdateTicketRequest,
    TicketListItem,
    TicketDetailResponse,
    NoteResponse,
)

# App setup
app = FastAPI(title="Support CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://desk-sync-crm.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper utilities

def utc_now() -> str:
    """Return the current UTC time as an ISO string."""
    return datetime.now(timezone.utc).isoformat()


async def next_ticket_id() -> str:
    count = await tickets_collection.count_documents({})
    return f"TKT-{count + 1:03d}"


# Convert a raw MongoDB document into a TicketListItem response.
def doc_to_ticket_list_item(doc: dict) -> TicketListItem:
    return TicketListItem(
        id=str(doc["_id"]),
        ticket_id=doc["ticket_id"],
        customer_name=doc["customer_name"],
        customer_email=doc["customer_email"],
        subject=doc["subject"],
        status=doc["status"],
        created_at=doc["created_at"],
    )


def doc_to_note(doc: dict) -> NoteResponse:
    return NoteResponse(
        id=str(doc["_id"]),
        ticket_id=doc["ticket_id"],
        note_text=doc["note_text"],
        created_at=doc["created_at"],
    )

# Endpoints

@app.post("/api/tickets", status_code=201)
async def create_ticket(body: CreateTicketRequest):
    """
    Create a new support ticket.
    Generates a unique ticket_id (TKT-001) and timestamps automatically.
    """
    ticket_id  = await next_ticket_id()
    now        = utc_now()

    new_ticket = {
        "_id":            str(uuid.uuid4()),   # use uuid as string _id
        "ticket_id":      ticket_id,
        "customer_name":  body.customer_name,
        "customer_email": body.customer_email,
        "subject":        body.subject,
        "description":    body.description,
        "status":         "Open",              # every new ticket starts as Open
        "created_at":     now,
        "updated_at":     now,
    }

    await tickets_collection.insert_one(new_ticket)

    return {"ticket_id": ticket_id, "created_at": now}


@app.get("/api/tickets", response_model=List[TicketListItem])
async def list_tickets(
    status: Optional[str] = Query(default=None, description="Filter by status: Open, In Progress, Closed"),
    search: Optional[str] = Query(default=None, description="Search in name, email, ticket_id, description"),
):
    """
    Return all tickets.  Supports optional status filter and text search.
    MongoDB's $regex operator lets us do case-insensitive partial matching.
    """
    query = {}

    # Status filter
    if status:
        query["status"] = status

    # Search filter: match any of the key fields
    if search:
        pattern = {"$regex": re.escape(search), "$options": "i"}
        query["$or"] = [
            {"customer_name":  pattern},
            {"customer_email": pattern},
            {"ticket_id":      pattern},
            {"subject":        pattern},
            {"description":    pattern},
        ]

    cursor = tickets_collection.find(query).sort("created_at", -1)  # newest first
    docs   = await cursor.to_list(length=500)

    return [doc_to_ticket_list_item(d) for d in docs]


@app.get("/api/tickets/{ticket_id}", response_model=TicketDetailResponse)
async def get_ticket(ticket_id: str):
    """
    Return a single ticket plus all of its notes.
    ticket_id here is like "TKT-001", not the MongoDB _id.
    """
    doc = await tickets_collection.find_one({"ticket_id": ticket_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Fetch notes for this ticket, sorted oldest → newest
    note_cursor = notes_collection.find({"ticket_id": ticket_id}).sort("created_at", 1)
    note_docs   = await note_cursor.to_list(length=200)
    notes       = [doc_to_note(n) for n in note_docs]

    return TicketDetailResponse(
        id=str(doc["_id"]),
        ticket_id=doc["ticket_id"],
        customer_name=doc["customer_name"],
        customer_email=doc["customer_email"],
        subject=doc["subject"],
        description=doc["description"],
        status=doc["status"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        notes=notes,
    )


@app.put("/api/tickets/{ticket_id}")
async def update_ticket(ticket_id: str, body: UpdateTicketRequest):
    """
    Update a ticket's status and/or add a new note.
    Both fields are optional — send just the one you want to change.
    """
    doc = await tickets_collection.find_one({"ticket_id": ticket_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Ticket not found")

    now         = utc_now()
    update_data = {"updated_at": now}

    if body.status:
        update_data["status"] = body.status

    # Apply the update to the ticket document
    await tickets_collection.update_one(
        {"ticket_id": ticket_id},
        {"$set": update_data}
    )

    # If a note was provided, insert it into the notes collection
    if body.note_text and body.note_text.strip():
        new_note = {
            "_id":       str(uuid.uuid4()),
            "ticket_id": ticket_id,
            "note_text": body.note_text.strip(),
            "created_at": now,
        }
        await notes_collection.insert_one(new_note)

    return {"success": True, "updated_at": now}


# Health check - for Railway deployment probes

@app.get("/health")
async def health():
    try:
        await client.admin.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
