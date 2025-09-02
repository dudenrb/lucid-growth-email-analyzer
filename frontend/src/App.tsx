import React, { useState } from "react";
import Timeline from "./components/Timeline";

export interface EmailDoc {
  _id: string;
  subject: string;
  from: string;
  to: string;
  createdAt: string;
}

function App() {
  const [emails, setEmails] = useState<EmailDoc[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scanEmails = async () => {
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/email/scan", {
        method: "POST", // ✅ Corrected: must be POST
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Scan failed: ${res.status}`);
      }

      const data = await res.json();
      if (data && data.data) {
        // Prepend new scanned email
        setEmails((prev) => [data.data, ...prev]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">📧 Lucid Growth Email Analyzer</h1>

      <button
        onClick={scanEmails}
        className="px-6 py-2 mb-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Scan for New Emails
      </button>

      {error && (
        <p className="text-red-500 font-semibold mb-4">Error: {error}</p>
      )}

      {emails.length === 0 ? (
        <p className="text-gray-500">No emails scanned yet.</p>
      ) : (
        <Timeline emails={emails} />
      )}
    </div>
  );
}

export default App;
