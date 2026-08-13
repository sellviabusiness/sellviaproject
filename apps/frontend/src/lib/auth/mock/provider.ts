import type { AnyFlow, AuthProvider, FlowKind, UpdateFlowResult } from "../types";
import type { Identity, Session, UiContainer } from "@ory/client";
import { AuthRequestError } from "../errors";
import { hiddenNode, inputNode, submitNode, uiText, withFieldError, withValues } from "./nodes";
import * as userStore from "./user-store";
import {
  clearMockSessionCookie,
  readMockSessionCookieClient,
  setMockSessionCookie,
} from "./session-cookie";

/**
 * DEV-ONLY MOCK PROVIDER — no network, no real backend. Simulates Ory Kratos's self-service
 * flow contract closely enough (same node/state shapes) that AuthFlowForm, which was written
 * against that contract, renders and submits against this identically to the real thing. See
 * Docs/Frontend/Playbooks/01-authentication.md and the chat response accompanying this build
 * for what is/isn't simulated.
 *
 * Demo credentials (seeded, always available): demo@sellvia.test / password123
 * Recovery/verification code (fixed, always accepted): 123456
 */

const RECOVERY_VERIFICATION_CODE = "123456";
const MIN_PASSWORD_LENGTH = 8; // mock-only rule — the real policy lives in Kratos, not here

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function newId(): string {
  return `mock-flow-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface FlowRecord {
  kind: FlowKind;
  flow: AnyFlow;
  email?: string;
}

const flows = new Map<string, FlowRecord>();

function baseFields(id: string, state: string) {
  const now = new Date().toISOString();
  return {
    id,
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    issued_at: now,
    request_url: "",
    state,
    type: "browser",
  };
}

function container(nodes: UiContainer["nodes"], messages: UiContainer["messages"] = []): UiContainer {
  return { action: "#", method: "POST", nodes, messages };
}

function fakeIdentity(email: string, roles: string[], verified: boolean): Identity {
  return {
    id: `mock-identity-${email}`,
    schema_id: "default",
    schema_url: "",
    traits: { email, roles },
    verifiable_addresses: [
      { value: email, verified, via: "email", status: verified ? "completed" : "sent" } as never,
    ],
  };
}

function fakeSession(email: string, roles: string[], verified: boolean): Session {
  return { id: `mock-session-${email}`, identity: fakeIdentity(email, roles, verified) };
}

// ---- node builders per kind/step -------------------------------------------------------

function loginNodes(): UiContainer["nodes"] {
  return [
    hiddenNode("csrf_token", "mock-csrf-token"),
    inputNode({ name: "identifier", type: "email", label: "Email", required: true, autoComplete: "email" }),
    inputNode({
      name: "password",
      type: "password",
      group: "password",
      label: "Password",
      required: true,
      autoComplete: "current-password",
    }),
    submitNode({ value: "password", label: "Log in", group: "password" }),
  ];
}

function registrationNodes(): UiContainer["nodes"] {
  return [
    hiddenNode("csrf_token", "mock-csrf-token"),
    inputNode({
      name: "traits.email",
      type: "email",
      label: "Email",
      required: true,
      autoComplete: "email",
    }),
    inputNode({
      name: "password",
      type: "password",
      group: "password",
      label: "Password",
      required: true,
      autoComplete: "new-password",
    }),
    submitNode({ value: "password", label: "Create account", group: "password" }),
  ];
}

function emailStepNodes(submitLabel: string): UiContainer["nodes"] {
  return [
    hiddenNode("csrf_token", "mock-csrf-token"),
    inputNode({ name: "email", type: "email", label: "Email", required: true, autoComplete: "email" }),
    submitNode({ value: "code", label: submitLabel, group: "code" }),
  ];
}

function codeStepNodes(): UiContainer["nodes"] {
  return [
    hiddenNode("csrf_token", "mock-csrf-token"),
    inputNode({
      name: "code",
      type: "text",
      label: "Verification code",
      required: true,
      autoComplete: "one-time-code",
    }),
    submitNode({ value: "code", label: "Verify code", group: "code" }),
    submitNode({ value: "resend", label: "Resend email", group: "code" }),
  ];
}

function settingsNodes(): UiContainer["nodes"] {
  return [
    hiddenNode("csrf_token", "mock-csrf-token"),
    inputNode({
      name: "password",
      type: "password",
      group: "password",
      label: "New password",
      required: true,
      autoComplete: "new-password",
    }),
    submitNode({ value: "password", label: "Reset password", group: "password" }),
  ];
}

// ---- create / get -----------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for interface parity with the real provider
async function createFlow(kind: FlowKind, returnTo?: string): Promise<AnyFlow> {
  await delay();

  if (kind === "settings") {
    throw new Error("settings flows cannot be created directly (mock mirrors real Kratos here)");
  }

  const id = newId();
  const nodes =
    kind === "login"
      ? loginNodes()
      : kind === "registration"
        ? registrationNodes()
        : kind === "recovery"
          ? emailStepNodes("Send reset link")
          : emailStepNodes("Send verification link");

  const flow = { ...baseFields(id, "choose_method"), ui: container(nodes) } as AnyFlow;
  flows.set(id, { kind, flow });
  return flow;
}

async function getFlow(kind: FlowKind, id: string): Promise<AnyFlow> {
  await delay(200);
  const record = flows.get(id);
  if (!record || record.kind !== kind) {
    throw new AuthRequestError(410, undefined);
  }
  return record.flow;
}

// ---- update per kind --------------------------------------------------------------------

async function updateFlow(
  kind: FlowKind,
  flowId: string,
  body: Record<string, unknown>,
): Promise<UpdateFlowResult> {
  await delay();

  const record = flows.get(flowId);
  if (!record || record.kind !== kind) {
    throw new AuthRequestError(410, undefined);
  }

  switch (kind) {
    case "login":
      return updateLogin(record, body);
    case "registration":
      return updateRegistration(record, body);
    case "recovery":
      return updateRecoveryOrVerification(record, body, "recovery");
    case "verification":
      return updateRecoveryOrVerification(record, body, "verification");
    case "settings":
      return updateSettings(record, body);
  }
}

function updateLogin(record: FlowRecord, body: Record<string, unknown>): UpdateFlowResult {
  const identifier = typeof body.identifier === "string" ? body.identifier : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || !password) {
    let nodes = withValues(loginNodes(), body);
    if (!identifier) nodes = withFieldError(nodes, "identifier", "This field is required.");
    if (!password) nodes = withFieldError(nodes, "password", "This field is required.");
    const flow = { ...record.flow, ui: container(nodes) };
    throw new AuthRequestError(400, flow);
  }

  const user = userStore.findUser(identifier);
  if (!user || user.password !== password) {
    const nodes = withValues(loginNodes(), body);
    const flow = {
      ...record.flow,
      ui: container(nodes, [uiText("The email or password you entered is incorrect.", "error")]),
    };
    throw new AuthRequestError(400, flow);
  }

  flows.delete(record.flow.id);
  return { session: fakeSession(user.email, user.roles, user.verified), continue_with: [] };
}

function updateRegistration(record: FlowRecord, body: Record<string, unknown>): UpdateFlowResult {
  const traits = (body.traits ?? {}) as Record<string, unknown>;
  const email = typeof traits.email === "string" ? traits.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const rolesRaw = traits.roles;
  const roles = Array.isArray(rolesRaw) ? rolesRaw.map(String) : rolesRaw ? [String(rolesRaw)] : [];

  const fail = (fieldName: string, message: string): never => {
    const nodes = withFieldError(withValues(registrationNodes(), { "traits.email": email }), fieldName, message);
    throw new AuthRequestError(400, { ...record.flow, ui: container(nodes) });
  };

  if (!email) fail("traits.email", "This field is required.");
  if (!password) fail("password", "This field is required.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail("password", `Password must be at least ${MIN_PASSWORD_LENGTH} characters. (Mock rule — the real policy is enforced by Kratos.)`);
  }
  if (userStore.findUser(email)) {
    fail("traits.email", "An account with this email already exists.");
  }

  userStore.createUser(email, password, roles);
  flows.delete(record.flow.id);

  // Registration always routes to email verification in the mock, so that path is reachable
  // and testable every time — matches Docs/Scratch/SCREEN_INVENTORY.md's Verify Email screen.
  const verificationId = newId();
  const verificationFlow = {
    ...baseFields(verificationId, "choose_method"),
    ui: container(withValues(emailStepNodes("Send verification link"), { email })),
  } as AnyFlow;
  flows.set(verificationId, { kind: "verification", flow: verificationFlow, email });

  return { continue_with: [{ action: "show_verification_ui", flow: { id: verificationId } }] };
}

function updateRecoveryOrVerification(
  record: FlowRecord,
  body: Record<string, unknown>,
  kind: "recovery" | "verification",
): UpdateFlowResult {
  const state = record.flow.state as string;

  if (state === "choose_method") {
    const email = typeof body.email === "string" ? body.email : "";
    if (!email) {
      const nodes = withFieldError(emailStepNodes(kind === "recovery" ? "Send reset link" : "Send verification link"), "email", "This field is required.");
      throw new AuthRequestError(400, { ...record.flow, ui: container(nodes) });
    }

    record.email = email;
    const updated = {
      ...record.flow,
      state: "sent_email",
      ui: container(
        codeStepNodes(),
        [uiText(`If that address is on file, a code has been sent. (Mock: use ${RECOVERY_VERIFICATION_CODE}.)`, "info")],
      ),
    };
    record.flow = updated;
    return updated;
  }

  // state === "sent_email": either resending, or verifying the code
  const method = typeof body.method === "string" ? body.method : "code";
  if (method === "resend") {
    const updated = {
      ...record.flow,
      ui: container(
        codeStepNodes(),
        [uiText(`A new code has been sent. (Mock: use ${RECOVERY_VERIFICATION_CODE}.)`, "info")],
      ),
    };
    record.flow = updated;
    return updated;
  }

  const code = typeof body.code === "string" ? body.code : "";
  if (code !== RECOVERY_VERIFICATION_CODE) {
    const nodes = withFieldError(codeStepNodes(), "code", "That code is incorrect or has expired.");
    throw new AuthRequestError(400, { ...record.flow, ui: container(nodes) });
  }

  flows.delete(record.flow.id);

  if (kind === "verification") {
    if (record.email) userStore.markVerified(record.email);
    const passed = { ...record.flow, state: "passed_challenge", ui: container([]) };
    return passed;
  }

  // recovery success -> hand off to a privileged settings flow, same as real Kratos would.
  const settingsId = newId();
  const identity = fakeIdentity(record.email ?? "", userStore.findUser(record.email ?? "")?.roles ?? [], true);
  const settingsFlow = {
    ...baseFields(settingsId, "show_form"),
    identity,
    ui: container(settingsNodes()),
  } as AnyFlow;
  flows.set(settingsId, { kind: "settings", flow: settingsFlow, email: record.email });

  return { continue_with: [{ action: "show_settings_ui", flow: { id: settingsId } }] };
}

function updateSettings(record: FlowRecord, body: Record<string, unknown>): UpdateFlowResult {
  const password = typeof body.password === "string" ? body.password : "";

  if (!password) {
    const nodes = withFieldError(settingsNodes(), "password", "This field is required.");
    throw new AuthRequestError(400, { ...record.flow, ui: container(nodes) });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    const nodes = withFieldError(settingsNodes(), "password", `Password must be at least ${MIN_PASSWORD_LENGTH} characters. (Mock rule.)`);
    throw new AuthRequestError(400, { ...record.flow, ui: container(nodes) });
  }

  if (record.email) userStore.setPassword(record.email, password);
  const updated = { ...record.flow, state: "success", ui: container([], [uiText("Your password has been updated.", "success")]) };
  record.flow = updated;
  return updated;
}

// ---- provider -----------------------------------------------------------------------------

export const mockProvider: AuthProvider = {
  mode: "mock",
  isConfigured: () => true,
  createFlow,
  getFlow,
  updateFlow,

  async createLogoutFlow() {
    await delay(150);
    return { logout_token: "mock-logout-token" };
  },
  async submitLogout() {
    await delay(150);
  },

  async onAuthenticated(session: Session) {
    const traits = (session.identity?.traits ?? {}) as Record<string, unknown>;
    const email =
      session.identity?.verifiable_addresses?.[0]?.value ??
      (typeof traits.email === "string" ? traits.email : "");
    setMockSessionCookie({
      id: session.identity?.id ?? session.id,
      email,
      verified: session.identity?.verifiable_addresses?.[0]?.verified ?? false,
      roles: Array.isArray(traits.roles) ? (traits.roles as string[]) : [],
    });
  },
  async onVerified() {
    const current = readMockSessionCookieClient();
    if (current) setMockSessionCookie({ ...current, verified: true });
  },
  async onLoggedOut() {
    clearMockSessionCookie();
  },
};
