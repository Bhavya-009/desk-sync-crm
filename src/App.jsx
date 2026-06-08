import { useState } from "react";
import Header from "./components/Header";
import TicketList from "./pages/TicketList";
import CreateTicket from "./pages/CreateTicket";
import TicketDetail from "./pages/TicketDetail";

export default function App() {
  const [page, setPage] = useState({ name: "list" });

  function goTo(p) {
    setPage(p);
    window.scrollTo(0, 0);
  }

  function handleHeaderNav(dest) {
    goTo({ name: dest });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={handleHeaderNav} currentPage={page.name} />

      <main>
        {page.name === "list" && (
          <TicketList
            onSelectTicket={(ticketId) => goTo({ name: "detail", ticketId })}
          />
        )}

        {page.name === "create" && (
          <CreateTicket
            onSuccess={(ticketId) => goTo({ name: "detail", ticketId })}
            onCancel={() => goTo({ name: "list" })}
          />
        )}

        {page.name === "detail" && (
          <TicketDetail
            ticketId={page.ticketId}
            onBack={() => goTo({ name: "list" })}
          />
        )}
      </main>
    </div>
  );
}
