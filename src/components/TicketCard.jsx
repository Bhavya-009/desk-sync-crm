import { User, Clock, ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TicketCard({ ticket, onClick }) {
  return (
    <div
      onClick={() => onClick(ticket.ticket_id)}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-sm cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
              {ticket.ticket_id}
            </span>
            <StatusBadge status={ticket.status} size="sm" />
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <User size={11} />
              {ticket.customer_name}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} />
              {formatDate(ticket.created_at)}
            </span>
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-gray-300 group-hover:text-teal-500 shrink-0 mt-1 transition-colors"
        />
      </div>
    </div>
  );
}
