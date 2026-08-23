import type { DesignTokens } from "@/server/tokens";

export type SystemSummary = {
  slug: string;
  name: string;
  version?: string;
  source?: string;
  colors: Record<string, string>;
};

export type SystemDetail = {
  slug: string;
  tokens: DesignTokens;
  designLanguageMd: string;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_DESIGNALIGN_API_TOKEN : undefined;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...init, headers, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.error?.message || `Request failed (${res.status}) for ${path}`;
    throw new Error(message);
  }
  return data as T;
}

export const client = {
  listSystems: () => api<{ systems: SystemSummary[] }>("/api/v1/systems"),
  getSystem: (slug: string) => api<SystemDetail>(`/api/v1/systems/${slug}`),
  createSystem: (body: {
    name: string;
    slug?: string;
    preset?: "aurora" | "slate";
  }) =>
    api<SystemDetail>("/api/v1/systems", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateSystem: (
    slug: string,
    body: { tokens: DesignTokens; designLanguageMd?: string },
  ) =>
    api<SystemDetail>(`/api/v1/systems/${slug}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteSystem: (slug: string) =>
    api<{ ok: boolean }>(`/api/v1/systems/${slug}`, { method: "DELETE" }),
  exportSystem: (slug: string, projectRoot: string) =>
    api<{ path: string }>(`/api/v1/systems/${slug}/export`, {
      method: "POST",
      body: JSON.stringify({ projectRoot }),
    }),
};
