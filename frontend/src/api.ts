const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://lucid-growth-email-analyzer.onrender.com";

export async function fetchConfig() {
  const res = await fetch(`${API_BASE_URL}/config`);
  if (!res.ok) throw new Error("Failed to fetch config");
  return res.json();
}

export async function fetchEmails() {
  const res = await fetch(`${API_BASE_URL}/emails`);
  if (!res.ok) throw new Error("Failed to fetch emails");
  return res.json();
}

export async function fetchLatestEmail() {
  const res = await fetch(`${API_BASE_URL}/emails/latest`);
  if (!res.ok) throw new Error("Failed to fetch latest email");
  return res.json();
}
