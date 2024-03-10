import { randomBytes } from "node:crypto";
import base64url from "base64url";
import type { User } from "../model/user";

export function getRegisterOptions(user: User) {
  return {
    challenge: getChallenge(),
    rp: {
      name: "WebAuthn Playground",
      id: "localhost",
    },
    user: {
      id: user.id,
      name: user.loginId,
      displayName: user.displayName,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    excludeCredentials: [],
    timeout: 1000 * 60,
    attestation: "direct",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      requireResidentKey: false,
      userVerification: "required",
    },
  };
}

function getChallenge(length = 32) {
  let buff = randomBytes(length);
  return base64url(buff);
}
