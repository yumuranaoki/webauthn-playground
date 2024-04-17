import { startRegistration } from "@simplewebauthn/browser";

export default function RegisterPage() {
  const handleClick = async () => {
    const resp = await fetch("http://localhost:8000/webauthn/generate-options", {
      credentials: "include",
    });
    const options = await resp.json();
    const attResp = await startRegistration({
      ...options,
      authenticatorSelection: { ...options.authenticatorSelection, authenticatorAttachment: "cross-platform" },
    });

    await fetch("http://localhost:8000/webauthn/register", {
      method: "POST",
      body: JSON.stringify(attResp),
      credentials: "include",
    });
  };

  return (
    <div>
      <h1>パスキーを登録する</h1>
      <button onClick={handleClick}>登録する</button>
    </div>
  );
}
