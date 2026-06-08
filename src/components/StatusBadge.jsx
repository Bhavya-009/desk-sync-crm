const styles = {
  Open: "bg-blue-50 text-blue-700 border border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border border-amber-200",
  Closed: "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function StatusBadge({ status, size = "md" }) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${styles[status]}`}>
      {status}
    </span>
  );
}
