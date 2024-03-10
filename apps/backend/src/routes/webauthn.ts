import { Hono } from "hono";
import { getCookie, getSignedCookie, setCookie, setSignedCookie, deleteCookie } from "hono/cookie";
import type { UUID } from "crypto";
import { getRegisterOptions } from "../lib/register-option";

const app = new Hono();

const cookieSecret = "secret";

app.get("/webauthn/generate-options", async (c) => {
  const user = {
    id: "5696ede2-68e5-468f-9a4e-f1eefb41e407" as UUID,
    loginId: "naoki",
    displayName: "yummy",
  };
  const options = getRegisterOptions(user);
  await setSignedCookie(c, "webauthn_challenge", options.challenge, cookieSecret, { sameSite: "Lax" });
  return c.json(options);
});

export default app;
