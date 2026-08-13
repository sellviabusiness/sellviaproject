import "server-only";
import { cookies } from "next/headers";
import type { Session } from "@ory/client";
import { ORY_KRATOS_URL } from "./sdk";
import type { AppSession } from "../types";

/**
 * Server-side session check — forwards the browser's cookies to Kratos's `/sessions/whoami`
 * (Docs/Security/Session Management: Kratos sessions are server-validated on each request, not
 * a cached JWT). Never cached (`cache: "no-store"`) — a session's validity must always reflect
 * Kratos's current answer, matching the "sensitive checks verify live" principle in that doc.
 */
export async function getKratosServerSession(): Promise<AppSession | null> {
  if (!ORY_KRATOS_URL) return null;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${ORY_KRATOS_URL}/sessions/whoami`, {
      headers: { Accept: "application/json", Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return normalizeSession((await res.json()) as Session);
  } catch {
    // Kratos unreachable — treat as "no session" rather than throwing. The page itself is
    // still reachable; any Kratos-dependent action on it will surface its own clear error.
    return null;
  }
}

function normalizeSession(session: Session): AppSession | null {
  if (!session.identity) return null;
  const traits = (session.identity.traits ?? {}) as Record<string, unknown>;
  const email =
    session.identity.verifiable_addresses?.[0]?.value ??
    (typeof traits.email === "string" ? traits.email : undefined);
  if (!email) return null;

  return {
    id: session.identity.id,
    email,
    verified: session.identity.verifiable_addresses?.[0]?.verified ?? false,
    roles: Array.isArray(traits.roles) ? (traits.roles as string[]) : [],
  };
}
