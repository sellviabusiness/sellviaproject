import { isAxiosError } from "axios";
import type { Session } from "@ory/client";
import { oryFrontendClient, isOryConfigured } from "./sdk";
import { AuthRequestError } from "../errors";
import type { AnyFlow, AuthProvider, FlowKind, UpdateFlowResult } from "../types";

/** Runs an SDK call and normalizes a failure into AuthRequestError — see lib/auth/errors.ts. */
async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    return (await promise).data;
  } catch (err) {
    if (isAxiosError(err) && err.response) {
      throw new AuthRequestError(err.response.status, err.response.data);
    }
    // No response at all — Kratos unreachable, DNS/CORS failure, etc.
    throw new AuthRequestError(0, undefined);
  }
}

async function createFlow(kind: FlowKind, returnTo?: string): Promise<AnyFlow> {
  switch (kind) {
    case "login":
      return unwrap(oryFrontendClient.createBrowserLoginFlow({ returnTo }));
    case "registration":
      return unwrap(oryFrontendClient.createBrowserRegistrationFlow({ returnTo }));
    case "recovery":
      return unwrap(oryFrontendClient.createBrowserRecoveryFlow({ returnTo }));
    case "verification":
      return unwrap(oryFrontendClient.createBrowserVerificationFlow({ returnTo }));
    case "settings":
      // Settings flows are only ever reached here via a Kratos-issued redirect that already
      // carries ?flow=<id> (after a recovery link/code succeeds) — see getFlow below. There is
      // deliberately no "create a fresh one" path: a settings flow needs an active privileged
      // session, which we don't have outside that redirect.
      throw new Error("settings flows cannot be created directly");
  }
}

async function getFlow(kind: FlowKind, id: string): Promise<AnyFlow> {
  switch (kind) {
    case "login":
      return unwrap(oryFrontendClient.getLoginFlow({ id }));
    case "registration":
      return unwrap(oryFrontendClient.getRegistrationFlow({ id }));
    case "recovery":
      return unwrap(oryFrontendClient.getRecoveryFlow({ id }));
    case "verification":
      return unwrap(oryFrontendClient.getVerificationFlow({ id }));
    case "settings":
      return unwrap(oryFrontendClient.getSettingsFlow({ id }));
  }
}

async function updateFlow(
  kind: FlowKind,
  flowId: string,
  body: Record<string, unknown>,
): Promise<UpdateFlowResult> {
  switch (kind) {
    case "login":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic, node-driven body
      return unwrap(oryFrontendClient.updateLoginFlow({ flow: flowId, updateLoginFlowBody: body as any }));
    case "registration":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return unwrap(oryFrontendClient.updateRegistrationFlow({ flow: flowId, updateRegistrationFlowBody: body as any }));
    case "recovery":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return unwrap(oryFrontendClient.updateRecoveryFlow({ flow: flowId, updateRecoveryFlowBody: body as any }));
    case "verification":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return unwrap(oryFrontendClient.updateVerificationFlow({ flow: flowId, updateVerificationFlowBody: body as any }));
    case "settings":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return unwrap(oryFrontendClient.updateSettingsFlow({ flow: flowId, updateSettingsFlowBody: body as any }));
  }
}

/**
 * Real Ory Kratos, called directly from the browser. Session persistence/logout is entirely
 * Kratos's own cookie (Set-Cookie on the XHR response) — the three hooks below are deliberate
 * no-ops here; only the mock provider needs them.
 */
export const kratosProvider: AuthProvider = {
  mode: "kratos",
  isConfigured: () => isOryConfigured,
  createFlow,
  getFlow,
  updateFlow,
  async createLogoutFlow() {
    return unwrap(oryFrontendClient.createBrowserLogoutFlow());
  },
  async submitLogout(token: string) {
    await unwrap(oryFrontendClient.updateLogoutFlow({ token }));
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- interface-mandated param, unused here
  async onAuthenticated(session: Session) {},
  async onVerified() {},
  async onLoggedOut() {},
};
