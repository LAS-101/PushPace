import type {
  ActivityByType,
  ActivityInputByType,
  ActivityType,
  Profile,
  ProfileInput,
  User,
} from "./types";

/**
 * All calls go to `/api/*` on the Next.js origin, which `next.config.ts`
 * rewrites to the NestJS backend. Keeping the API same-origin means the
 * httpOnly auth cookie is sent without any CORS setup.
 */
const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  { body, ...init }: Omit<RequestInit, "body"> & { body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers:
      body === undefined ? init.headers : { "Content-Type": "application/json", ...init.headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Nest errors look like { statusCode, message: string | string[], error }
    const message: unknown = data?.message;
    const text = Array.isArray(message)
      ? message.join("\n")
      : typeof message === "string"
        ? message
        : `Request failed (${response.status})`;

    // A protected call failed because the session expired: back to login.
    if (response.status === 401 && !path.startsWith("/auth/") && typeof window !== "undefined") {
      // Not inside a component, so no router here; a full reload also drops stale state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login");
    }
    throw new ApiError(text, response.status);
  }

  return data as T;
}

export const api = {
  me: () =>
    request<{ authenticated: true; user: User } | { authenticated: false }>("/auth/me"),

  login: (username: string, password: string) =>
    request<{ message: string; user: User }>("/auth/login", {
      method: "POST",
      body: { username, password },
    }),

  register: (username: string, email: string, password: string) =>
    request<{ message: string; user: User }>("/auth/register", {
      method: "POST",
      body: { username, email, password },
    }),

  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  getProfile: () => request<Profile>("/profile"),

  updateProfile: (input: ProfileInput) =>
    request<{ message: string; profile: Profile }>("/profile", { method: "PUT", body: input }),

  listActivities: <T extends ActivityType>(type: T) =>
    request<ActivityByType[T][]>(`/activities/${type}`),

  createActivity: <T extends ActivityType>(type: T, input: ActivityInputByType[T]) =>
    request<{ message: string; id: number }>(`/activities/${type}`, {
      method: "POST",
      body: input,
    }),

  deleteActivity: (type: ActivityType, id: number) =>
    request<{ message: string }>(`/activities/${type}/${id}`, { method: "DELETE" }),
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
