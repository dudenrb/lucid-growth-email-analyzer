const base = import.meta.env.VITE_API_BASE as string;

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const api = {
  config: () => fetch(`${base}/email/config`).then(j),
  scan: () => fetch(`${base}/email/scan`, { method: 'POST' }).then(j),
  latest: () => fetch(`${base}/email/latest`).then(j),
  all: () => fetch(`${base}/email/all`).then(j),
  health: () => fetch(`${base}/health`).then(j),
};
