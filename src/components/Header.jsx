import { LayoutDashboard, Plus } from "lucide-react";


export default function Header({ onNavigate, currentPage }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => onNavigate("list")}
          className="flex items-center gap-2 text-teal-600 font-semibold text-lg hover:text-teal-700 transition-colors"
        >
          <LayoutDashboard size={20} strokeWidth={2} />
          <span>DeskSync</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("list")}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
              currentPage === "list"
                ? "text-teal-600 bg-teal-50 font-medium"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => onNavigate("create")}
            className="flex items-center gap-1.5 text-sm bg-teal-600 text-white px-3 py-1.5 rounded-md hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus size={15} strokeWidth={2.5} />
            New Ticket
          </button>
        </div>
      </div>
    </header>
  );
}
