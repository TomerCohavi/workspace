export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};

export function apiBase(): string {
  return (
    process.env.DESIGNALIGN_API_BASE?.replace(/\/$/, "") ||
    "http://127.0.0.1:3000"
  );
}

export function apiToken(): string | undefined {
  return process.env.DESIGNALIGN_API_TOKEN || undefined;
}

export class DesignAlignApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    const message =
      body &&
      typeof body === "object" &&
      "error" in body &&
      body.error &&
      typeof body.error === "object" &&
      "message" in body.error
        ? String((body.error as { message: string }).message)
        : `API request failed (${status})`;
    super(message);
    this.name = "DesignAlignApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = apiToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = `${apiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `DesignAlign API unreachable at ${apiBase()} (${message}). Start the admin app (cd admin && npm run dev) or set DESIGNALIGN_API_BASE.`,
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new DesignAlignApiError(res.status, data);
  }
  return data as T;
}
