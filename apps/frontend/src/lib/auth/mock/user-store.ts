/**
 * DEV-ONLY MOCK "backend". A tiny fake user directory kept in localStorage, purely so
 * register → verify → log out → log in round-trips actually work while building against no
 * real Kratos environment. None of this exists once NEXT_PUBLIC_AUTH_PROVIDER=kratos is set.
 */

export interface MockUser {
  id: string;
  email: string;
  password: string;
  roles: string[];
  verified: boolean;
}

const KEY = "sellvia_mock_users";

/** Seeded so login is testable without registering first. */
const DEMO_USER: MockUser = {
  id: "demo-user",
  email: "demo@sellvia.test",
  password: "password123",
  roles: ["merchant"],
  verified: true,
};

function readAll(): MockUser[] {
  if (typeof localStorage === "undefined") return [DEMO_USER];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify([DEMO_USER]));
      return [DEMO_USER];
    }
    return JSON.parse(raw) as MockUser[];
  } catch {
    return [DEMO_USER];
  }
}

function writeAll(users: MockUser[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(users));
}

export function findUser(email: string): MockUser | undefined {
  return readAll().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(email: string, password: string, roles: string[]): MockUser {
  const user: MockUser = {
    id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    password,
    roles,
    verified: false,
  };
  writeAll([...readAll(), user]);
  return user;
}

export function markVerified(email: string) {
  writeAll(readAll().map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, verified: true } : u)));
}

export function setPassword(email: string, password: string) {
  writeAll(readAll().map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, password } : u)));
}
