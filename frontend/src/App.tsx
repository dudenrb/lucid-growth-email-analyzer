// import React, { useState } from "react";
// import Timeline from "./components/Timeline";

// export interface EmailDoc {
//   _id: string;
//   subject: string;
//   from: string;
//   to: string;
//   createdAt: string;
// }

// function App() {
//   const [emails, setEmails] = useState<EmailDoc[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const scanEmails = async () => {
//     setError(null);
//     try {
//       const res = await fetch("http://localhost:4000/email/scan", {
//         method: "POST", // ✅ Corrected: must be POST
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!res.ok) {
//         throw new Error(`Scan failed: ${res.status}`);
//       }

//       const data = await res.json();
//       if (data && data.data) {
//         // Prepend new scanned email
//         setEmails((prev) => [data.data, ...prev]);
//       }
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
//       <h1 className="text-3xl font-bold mb-4">📧 Lucid Growth Email Analyzer</h1>

//       <button
//         onClick={scanEmails}
//         className="px-6 py-2 mb-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//       >
//         Scan for New Emails
//       </button>

//       {error && (
//         <p className="text-red-500 font-semibold mb-4">Error: {error}</p>
//       )}

//       {emails.length === 0 ? (
//         <p className="text-gray-500">No emails scanned yet.</p>
//       ) : (
//         <Timeline emails={emails} />
//       )}
//     </div>
//   );
// }

// export default App;



import React, { useEffect, useState } from "react";
import Timeline from "./Timeline";

export interface EmailDoc {
  _id: string;
  subject: string;
  from: string;
  to: string;
  receivingChain: string[];
  esp: string;
  createdAt: string;
  receivedAt?: string;
}

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function App() {
  const [emails, setEmails] = useState<EmailDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<{ testAddress: string; subjectToken: string } | null>(null);

  // Load config + existing emails on mount
  useEffect(() => {
    (async () => {
      try {
        const [cfgRes, allRes] = await Promise.all([
          fetch(`${API}/email/config`),
          fetch(`${API}/email/all`),
        ]);
        if (!cfgRes.ok) throw new Error(`Config failed: ${cfgRes.status}`);
        if (!allRes.ok) throw new Error(`Fetch emails failed: ${allRes.status}`);

        const cfg = await cfgRes.json();
        const all = await allRes.json();
        setConfig(cfg);
        setEmails(Array.isArray(all) ? all : []);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  const scan = async () => {
    try {
      setScanLoading(true);
      setError(null);
      const res = await fetch(`${API}/email/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Scan failed: ${res.status}`);
      const body = await res.json();

      if (body?.found && body?.data) {
        setEmails((prev) => {
          if (prev.some((p) => p._id === body.data._id)) return prev; // no duplicate in UI
          return [body.data, ...prev];
        });
      } else if (body?.found && body?.duplicate && body?.data) {
        // It was already stored; still surface it at the top without duping
        setEmails((prev) => {
          const filtered = prev.filter((p) => p._id !== body.data._id);
          return [body.data, ...filtered];
        });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">📧 Lucid Growth Email Analyzer</h1>
          <button
            onClick={scan}
            disabled={scanLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {scanLoading ? "Scanning…" : "Scan New Emails"}
          </button>
        </header>

        {config && (
          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-lg font-semibold mb-2">Send a test email</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-gray-500">Send To</p>
                <p className="font-mono">{config.testAddress}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Subject Must Contain</p>
                <p className="font-mono">{config.subjectToken}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              The scanner will look for the latest email whose subject includes the token above. It extracts the
              Receiving Chain and the sender’s ESP (Gmail, SES, etc.) and stores it in MongoDB without duplicates.
            </p>
          </div>
        )}

        {error && <div className="text-red-600 font-medium">Error: {error}</div>}

        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-4">Results</h2>
          {loading ? (
            <p>Loading…</p>
          ) : emails.length === 0 ? (
            <p className="text-gray-500">No results yet. Send a test email and click “Scan New Emails”.</p>
          ) : (
            <Timeline emails={emails} />
          )}
        </div>
      </div>
    </div>
  );
}
