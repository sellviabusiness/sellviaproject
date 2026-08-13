import { Configuration, FrontendApi } from "@ory/client";

/**
 * Ory Kratos public/SDK URL (Docs/Infrastructure & DevOps/Environment Setup Guide calls this
 * `ORY_KRATOS_URL`). Exposed to the browser because the frontend calls Kratos's self-service
 * flow API directly (Docs/Technical Architecture/Frontend Architecture: "Kratos SDK/components
 * for sign-in, sign-up, and session state") — there is no SellVia backend endpoint in between
 * for auth. On Ory Network this URL is safe to ship to the client; it's the same public
 * endpoint the hosted Kratos UI itself would call.
 *
 * Only read when NEXT_PUBLIC_AUTH_PROVIDER=kratos (lib/auth/config.ts) — the mock provider
 * never touches this file.
 */
export const ORY_KRATOS_URL = process.env.NEXT_PUBLIC_ORY_KRATOS_URL;

/** True once NEXT_PUBLIC_ORY_KRATOS_URL is actually configured with a real value. */
export const isOryConfigured = Boolean(ORY_KRATOS_URL);

/**
 * Browser-side Kratos client. `withCredentials: true` is required so the Kratos session/CSRF
 * cookies are sent — same reasoning as the CORS note in Docs/Security/CORS, CSP & Security
 * Headers about `allow_credentials` needing an exact origin, just on Kratos's side instead of
 * the FastAPI backend's. `Accept: application/json` makes Kratos return flow JSON directly
 * instead of doing a browser redirect (documented AJAX behavior for every self-service flow
 * endpoint), which is what lets us render our own design-system-styled forms.
 */
export const oryFrontendClient = new FrontendApi(
  new Configuration({
    basePath: ORY_KRATOS_URL ?? "",
    baseOptions: {
      withCredentials: true,
      headers: { Accept: "application/json" },
    },
  }),
);
