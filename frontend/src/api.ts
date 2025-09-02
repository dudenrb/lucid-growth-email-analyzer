const API_BASE = "http://localhost:4000/api";

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function fetchEmails() {
  const res = await fetch(`${API_BASE}/emails`);
  return res.json();
}

export async function fetchLatestEmail() {
  const res = await fetch(`${API_BASE}/emails/latest`);
  return res.json();
}
