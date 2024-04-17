/* eslint-disable jsx-a11y/autocomplete-valid */

import { startAuthentication } from "@simplewebauthn/browser";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    const request = async () => {
      const resp = await fetch("http://localhost:8000/webauthn/generate-authentication-options", {
        credentials: "include",
      });
      const options = await resp.json();
      const asseResp = await startAuthentication(options, true);

      await fetch("http://localhost:8000/webauthn/verify-authentication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(asseResp),
      });
    };

    request();
  }, []);

  return (
    <div>
      <h1>ログインする</h1>
      <form>
        <label htmlFor="username">
          Username
          <input type="text" name="username" autoComplete="webauthn"></input>
        </label>
        <label htmlFor="password">
          Password
          <input type="password" name="password"></input>
        </label>
      </form>
    </div>
  );
}
