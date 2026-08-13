import type {
  LoginFlow,
  RegistrationFlow,
  RecoveryFlow,
  VerificationFlow,
  SettingsFlow,
  Session,
} from "@ory/client";

export type FlowKind = "login" | "registration" | "recovery" | "verification" | "settings";

/**
 * We reuse @ory/client's own flow types as the shared contract between providers — they're
 * plain data shapes (id + ui.nodes + state), not axios-coupled. Both the real Kratos provider
 * and the mock provider return objects shaped like this, which is what lets AuthFlowForm render
 * either one identically without knowing which is behind it.
 */
export type AnyFlow = LoginFlow | RegistrationFlow | RecoveryFlow | VerificationFlow | SettingsFlow;

/**
 * The raw result of a flow submission — deliberately `unknown` rather than a specific shape.
 * It's whichever of several real Kratos response types (SuccessfulNativeLogin,
 * SuccessfulNativeRegistration, RecoveryFlow, VerificationFlow, SettingsFlow — or the mock's
 * equivalent) came back; callers narrow it themselves (checking for `session`/`continue_with`/
 * `ui`), same as AuthFlowForm already does.
 */
export type UpdateFlowResult = unknown;

/**
 * The app-level session shape every screen actually consumes (dashboard, redirect checks).
 * Both providers normalize into this so callers never need to know which one produced it.
 */
export interface AppSession {
  id: string;
  email: string;
  verified: boolean;
  roles: string[];
}

/**
 * The seam between "how auth actually works" and every screen in this feature. Implemented by
 * lib/auth/kratos/provider.ts (real Ory Kratos) and lib/auth/mock/provider.ts (local, no
 * backend). Swapping providers is a single env var (lib/auth/config.ts) — nothing that imports
 * `authProvider` (lib/auth/provider.ts) needs to change.
 */
export interface AuthProvider {
  readonly mode: "mock" | "kratos";

  /** False only for the Kratos provider when NEXT_PUBLIC_ORY_KRATOS_URL isn't set. */
  isConfigured(): boolean;

  createFlow(kind: FlowKind, returnTo?: string): Promise<AnyFlow>;
  getFlow(kind: FlowKind, id: string): Promise<AnyFlow>;
  updateFlow(kind: FlowKind, flowId: string, body: Record<string, unknown>): Promise<UpdateFlowResult>;

  createLogoutFlow(): Promise<{ logout_token: string }>;
  submitLogout(token: string): Promise<void>;

  /**
   * Side-effect hooks so AuthFlowForm can stay provider-agnostic. The Kratos provider no-ops
   * all three (a real Kratos session cookie is already set by the browser via Set-Cookie on the
   * XHR response). The mock provider uses them to persist a plain dev cookie so server
   * components can gate routes the same way they will against a real session later.
   */
  onAuthenticated(session: Session): Promise<void>;
  onVerified(): Promise<void>;
  onLoggedOut(): Promise<void>;
}
