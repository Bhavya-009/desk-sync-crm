import { useState, useEffect, useCallback, useRef } from "react";
import { Search, SlidersHorizontal, Inbox, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "../lib/api";
import TicketCard from "../components/TicketCard";

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Closed"];

export default function TicketList({ onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchTimeout = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input so we don't fire an API call on every keystroke
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTickets({
        status: status,
        search: debouncedSearch || undefined,
      });
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tickets");
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = s === "All" ? tickets.length : tickets.filter((t) => t.status === s).length;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Support Tickets</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage and track all customer support requests</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, ticket ID, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${
                  status === s
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s}
                {statusCounts[s] > 0 && !loading && (
                  <span className="ml-1 text-gray-400">({statusCounts[s]})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={32} className="text-red-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">Could not connect to backend</p>
          <p className="text-xs text-gray-400 mb-4 max-w-sm">{error}</p>
          <button
            onClick={fetchTickets}
            className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="grid gap-2.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex gap-2 mb-2">
                <div className="h-5 w-16 bg-gray-100 rounded" />
                <div className="h-5 w-20 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-1/3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox size={32} className="text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No tickets found</p>
          <p className="text-xs text-gray-400 mt-1">
            {search || status !== "All"
              ? "Try adjusting your search or filter"
              : "Create your first ticket to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onClick={onSelectTicket} />
          ))}
        </div>
      )}
    </div>
  );
}
