// import React from "react";

// interface EmailDoc {
//   subject: string;
//   from: string;
//   to: string;
//   createdAt: string;
// }

// interface TimelineProps {
//   emails: EmailDoc[];
// }

// export default function Timeline({ emails }: TimelineProps) {
//   return (
//     <div className="space-y-6">
//       {emails.map((email, index) => (
//         <div
//           key={index}
//           className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition"
//         >
//           <h2 className="text-lg font-semibold text-gray-800">
//             {email.subject}
//           </h2>
//           <p className="text-sm text-gray-600">From: {email.from}</p>
//           <p className="text-sm text-gray-600">To: {email.to}</p>
//           <p className="text-xs text-gray-400 mt-2">
//             Received: {new Date(email.createdAt).toLocaleString()}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }


import React from "react";
import type { EmailDoc } from "./App";

function EspBadge({ esp }: { esp: string }) {
  const cls =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700";
  return <span className={cls}>{esp || "Unknown"}</span>;
}

export default function Timeline({ emails }: { emails: EmailDoc[] }) {
  return (
    <div className="space-y-6">
      {emails.map((e) => (
        <div key={e._id} className="border rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">
                {new Date(e.createdAt).toLocaleString()}
              </div>
              <div className="text-lg font-semibold">{e.subject}</div>
              <div className="text-sm text-gray-700 mt-1">
                <span className="font-medium">From:</span> {e.from}
                <span className="mx-2">→</span>
                <span className="font-medium">To:</span> {e.to}
              </div>
            </div>
            <EspBadge esp={e.esp} />
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Receiving Chain</p>
            {e.receivingChain?.length ? (
              <ol className="relative border-s border-gray-200 ms-3">
                {e.receivingChain.map((hop, idx) => (
                  <li key={idx} className="mb-4 ms-6">
                    <span className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-blue-500"></span>
                    <div className="text-sm">{hop}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500 text-sm">No chain parsed.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
