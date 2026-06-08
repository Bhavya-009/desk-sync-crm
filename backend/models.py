from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

# Enums
class TicketStatus(str, Enum):
    open        = "Open"
    in_progress = "In Progress"
    closed      = "Closed"

# Request 
class CreateTicketRequest(BaseModel):
    customer_name:  str
    customer_email: EmailStr
    subject:        str
    description:    str


class UpdateTicketRequest(BaseModel):
    status:    Optional[TicketStatus] = None 
    note_text: Optional[str]          = None 


# Response
class NoteResponse(BaseModel):
    id:         str
    ticket_id:  str
    note_text:  str
    created_at: str


class TicketListItem(BaseModel):
    id:             str
    ticket_id:      str
    customer_name:  str
    customer_email: str
    subject:        str
    status:         str
    created_at:     str


class TicketDetailResponse(BaseModel):
    id:             str
    ticket_id:      str
    customer_name:  str
    customer_email: str
    subject:        str
    description:    str
    status:         str
    created_at:     str
    updated_at:     str
    notes:          List[NoteResponse] = []
