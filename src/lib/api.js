// Set VITE_API_URL in your .env file to point to your FastAPI backend.
// Example: VITE_API_URL=http://localhost:8000

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Get all tickets, optionally filtered by status or search query
  getTickets(params) {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "All") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request(`/api/tickets${qs ? `?${qs}` : ""}`);
  },

  // Get a single ticket with its notes
  getTicket(ticketId) {
    return request(`/api/tickets/${ticketId}`);
  },

  // Create a new ticket
  createTicket(payload) {
    return request("/api/tickets", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Update ticket status and/or add a note
  updateTicket(ticketId, payload) {
    return request(`/api/tickets/${ticketId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
