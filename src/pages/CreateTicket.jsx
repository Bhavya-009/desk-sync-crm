import { useState } from "react";
import { CheckCircle2, AlertCircle, ChevronLeft, Send } from "lucide-react";
import { api } from "../lib/api";

const EMPTY_FORM = {
  customer_name: "",
  customer_email: "",
  subject: "",
  description: "",
};

export default function CreateTicket({ onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successId, setSuccessId] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.customer_email.trim() || !form.subject.trim() || !form.description.trim()) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.createTicket(form);
      setSuccessId(result.ticket_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  if (successId) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-50 rounded-full mb-4">
          <CheckCircle2 size={24} className="text-teal-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Ticket Created</h2>
        <p className="text-sm text-gray-500 mb-2">
          Your ticket has been submitted successfully.
        </p>
        <p className="text-sm font-mono text-teal-600 bg-teal-50 inline-block px-3 py-1 rounded-full mb-6">
          {successId}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => onSuccess(successId)}
            className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            View Ticket
          </button>
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
      {/* Back link */}
      <button
        onClick={onCancel}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to tickets
      </button>

      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">New Support Ticket</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill out the form to open a new support request.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
          <input
            type="text"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Customer Email</label>
          <input
            type="email"
            name="customer_email"
            value={form.customer_email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Brief summary of the issue"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the issue in detail..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 text-sm bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* <Send size={14} /> */}
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
