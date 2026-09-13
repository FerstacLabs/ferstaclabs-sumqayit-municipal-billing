import type {
  ActionResult,
  DemoAction,
  DemoState,
  PublicCertificate,
} from "./types";

// Future .NET integration: set this to its API base and retain the contracts in types.ts.
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(
  /\/$/,
  "",
);

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.message || "Serverlə əlaqə zamanı xəta baş verdi.");
  if (!body) throw new Error("Serverdən düzgün cavab alınmadı.");
  return body as T;
}

export const fetchDemo = (): Promise<DemoState> => request("/demo");
export const sendDemoAction = (action: DemoAction): Promise<ActionResult> =>
  request("/demo", { method: "POST", body: JSON.stringify(action) });
export const fetchCertificate = (id: string): Promise<PublicCertificate> =>
  request(`/certificates/${encodeURIComponent(id)}`);
