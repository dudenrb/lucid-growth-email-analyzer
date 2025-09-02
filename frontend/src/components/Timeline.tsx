import React from "react";

interface EmailDoc {
  subject: string;
  from: string;
  to: string;
  createdAt: string;
}

interface TimelineProps {
  emails: EmailDoc[];
}

export default function Timeline({ emails }: TimelineProps) {
  return (
    <div className="space-y-6">
      {emails.map((email, index) => (
        <div
          key={index}
          className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            {email.subject}
          </h2>
          <p className="text-sm text-gray-600">From: {email.from}</p>
          <p className="text-sm text-gray-600">To: {email.to}</p>
          <p className="text-xs text-gray-400 mt-2">
            Received: {new Date(email.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
