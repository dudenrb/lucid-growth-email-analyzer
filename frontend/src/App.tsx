import { useEffect, useState } from "react";
import { fetchConfig, fetchEmails, fetchLatestEmail } from "./api";

interface Email {
  _id: string;
  from: string;
  to: string;
  subject: string;
  espType: string;
  date: string;
}

function App() {
  const [config, setConfig] = useState<any>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [latest, setLatest] = useState<Email | null>(null);

  useEffect(() => {
    fetchConfig().then(setConfig).catch(console.error);
    fetchEmails().then(setEmails).catch(console.error);
    fetchLatestEmail().then(setLatest).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">📧 Email Analyzer Dashboard</h1>

      {/* Config Section */}
      {config && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Config</h2>
          <p><b>Test Address:</b> {config.testAddress}</p>
          <p><b>Subject Token:</b> {config.subjectToken}</p>
        </div>
      )}

      {/* Latest Email Section */}
      {latest && (
        <div className="bg-blue-50 p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Latest Test Email</h2>
          <p><b>From:</b> {latest.from}</p>
          <p><b>To:</b> {latest.to}</p>
          <p><b>Subject:</b> {latest.subject}</p>
          <p><b>ESP:</b> {latest.espType}</p>
          <p><b>Date:</b> {new Date(latest.date).toLocaleString()}</p>
        </div>
      )}

      {/* All Emails Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Recent Emails</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">From</th>
              <th className="text-left py-2">To</th>
              <th className="text-left py-2">Subject</th>
              <th className="text-left py-2">ESP</th>
              <th className="text-left py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email) => (
              <tr key={email._id} className="border-b">
                <td>{email.from}</td>
                <td>{email.to}</td>
                <td>{email.subject}</td>
                <td>{email.espType}</td>
                <td>{new Date(email.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
