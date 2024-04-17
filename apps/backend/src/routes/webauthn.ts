import { Hono } from "hono";
import { getSignedCookie, setSignedCookie, deleteCookie, setCookie, getCookie } from "hono/cookie";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type { UUID } from "crypto";
import type { Authenticator } from "../model/authenticator";
import { listAuthenticators, saveAuthenticator } from "../db/authenticatorRepository";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";

const app = new Hono();

const cookieSecret = "changeme";

const rpName = "WebAuthn Playground";
const rpID = "localhost";
const origin = `http://${rpID}:5000`;

const currentUser = {
  id: "5696ede2-68e5-468f-9a4e-f1eefb41e407" as UUID,
  loginId: "naoki",
};

app.get("/webauthn/generate-options", async (c) => {
  const userAuthenticators = listAuthenticators(currentUser.id);
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: currentUser.id,
    userName: currentUser.loginId,
    attestationType: "none",
    excludeCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credentialID,
      type: "public-key",
      transports: authenticator.transports,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
      authenticatorAttachment: "platform",
    },
  });

  await setSignedCookie(c, "webauthn_register_challenge", options.challenge, cookieSecret, { sameSite: "Lax" });
  return c.json(options);
});

app.post("/webauthn/register", async (c) => {
  const challenge = await getSignedCookie(c, cookieSecret, "webauthn_register_challenge");
  if (!challenge) return c.json({ message: "challenge not found" }, 400);

  const requestParams = await c.req.json();

  const verification = await verifyRegistrationResponse({
    response: requestParams,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  });

  if (!verification.verified || !verification.registrationInfo) return c.json({ message: "registration failed" }, 400);

  const newAuthenticator: Authenticator = {
    credentialID: verification.registrationInfo.credentialID,
    credentialPublicKey: verification.registrationInfo.credentialPublicKey,
    counter: verification.registrationInfo.counter,
    credentialDeviceType: verification.registrationInfo.credentialDeviceType,
    credentialBackedUp: verification.registrationInfo.credentialBackedUp,
    transports: requestParams.response.transports,
  };

  saveAuthenticator(currentUser.id, newAuthenticator);

  await deleteCookie(c, "webauthn_register_challenge");

  return c.json({ message: "ok" });
});

app.get("/webauthn/generate-authentication-options", async (c) => {
  const userAuthenticators: Authenticator[] = listAuthenticators(currentUser.id);

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credentialID,
      type: "public-key",
      transports: authenticator.transports,
    })),
    userVerification: "required",
  });

  await setSignedCookie(c, "webauthn_authentication_challenge", options.challenge, cookieSecret, { sameSite: "Lax" });

  return c.json(options);
});

app.post("/webauthn/verify-authentication", async (c) => {
  const challenge = await getSignedCookie(c, cookieSecret, "webauthn_authentication_challenge");
  if (!challenge) return c.json({ message: "challenge not found" }, 400);

  const requestParams = await c.req.json();
  const userAuthenticators = listAuthenticators(currentUser.id);
  const bodyCredIDBuffer = isoBase64URL.toBuffer(requestParams.rawId);
  const authenticator = userAuthenticators.find((authenticator) =>
    isoUint8Array.areEqual(authenticator.credentialID, bodyCredIDBuffer)
  );
  if (!authenticator) return c.json({ message: "authenticator not found" }, 400);

  const verification = await verifyAuthenticationResponse({
    response: requestParams,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator,
  });

  await deleteCookie(c, "webauthn_authentication_challenge");

  return c.json({ message: "ok" });
});

export default app;
