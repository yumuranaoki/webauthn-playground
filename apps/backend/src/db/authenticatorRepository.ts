import type { UUID } from "crypto";
import type { Authenticator } from "../model/authenticator";

const db = new Map<UUID, Authenticator>();

export function saveAuthenticator(userId: UUID, newAuthenticator: Authenticator) {
  db.set(userId, newAuthenticator);
}

export function listAuthenticators(userId: UUID): Authenticator[] {
  const authenticator = db.get(userId);
  return authenticator ? [authenticator] : [];
}
