import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Mail,
  Calendar,
  RefreshCw,
  MessageSquarePlus,
  AlertCircle,
  Send,
  Clock,
} from "lucide-react";
import { api } from "../lib/api";
import StatusBadge from "../components/StatusBadge";

const STATUS_OPTIONS = ["Open", "In Progress", "Closed"];

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketDetail({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("Open");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState(null);

  async function loadTicket() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTicket(ticketId);
      setTicket(data);
      setSelectedStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function handleStatusUpdate() {
    if (!ticket || selectedStatus === ticket.status) return;
    setStatusSaving(true);
    setStatusMsg(null);
    try {
      await api.updateTicket(ticketId, { status: selectedStatus });
      setTicket((prev) => (prev ? { ...prev, status: selectedStatus } : prev));
      setStatusMsg("Status updated");
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Update failed");
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteSaving(true);
    setNoteError(null);
    try {
      await api.updateTicket(ticketId, { note_text: noteText.trim() });
      setNoteText("");
      await loadTicket();
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setNoteSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="h-4 w-24 bg-gray-100 rounded mb-6 animate-pulse" />
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 animate-pulse">
          <div className="h-5 w-1/3 bg-gray-100 rounded" />
          <div className="h-4 w-1/2 bg-gray-100 rounded" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-4">{error || "Ticket not found"}</p>
        <button
          onClick={onBack}
          className="text-sm text-teal-600 hover:text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to tickets
      </button>

      {/* Ticket header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                {ticket.ticket_id}
              </span>
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-base font-semibold text-gray-900">{ticket.subject}</h1>
          </div>
        </div>

        {/* Customer info */}
        <div className="flex flex-wrap gap-4 py-3 border-t border-b border-gray-100 mb-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Customer</p>
            <p className="text-sm font-medium text-gray-700">{ticket.customer_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Email</p>
            <a
              href={`mailto:${ticket.customer_email}`}
              className="text-sm text-teal-600 hover:underline flex items-center gap-1"
            >
              <Mail size={12} />
              {ticket.customer_email}
            </a>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Opened</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar size={12} />
              {formatDateTime(ticket.created_at)}
            </p>
          </div>
          {ticket.updated_at && ticket.updated_at !== ticket.created_at && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Last updated</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <RefreshCw size={12} />
                {formatDateTime(ticket.updated_at)}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-1.5">Description</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Update Status</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={statusSaving || selectedStatus === ticket.status}
            className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {statusSaving ? "Saving..." : "Update"}
          </button>
          {statusMsg && (
            <span className="text-xs text-teal-600 font-medium">{statusMsg}</span>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquarePlus size={15} className="text-teal-600" />
          Notes &amp; Comments
          {ticket.notes && ticket.notes.length > 0 && (
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
              {ticket.notes.length}
            </span>
          )}
        </h2>

        {ticket.notes && ticket.notes.length > 0 ? (
          <div className="space-y-3 mb-5">
            {ticket.notes.map((note) => (
              <div key={note.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">{note.note_text}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Clock size={11} />
                  {formatDateTime(note.created_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4 italic">No notes yet.</p>
        )}

        <form onSubmit={handleAddNote} className="flex flex-col gap-2">
          <textarea
            value={noteText}
            onChange={(e) => {
              setNoteText(e.target.value);
              setNoteError(null);
            }}
            rows={3}
            placeholder="Add a note or internal comment..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          {noteError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />
              {noteError}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={noteSaving || !noteText.trim()}
              className="flex items-center gap-1.5 text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={13} />
              {noteSaving ? "Posting..." : "Post Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
