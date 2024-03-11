type RP = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  displayName: string;
};

type PublicKeyCredential = { alg: number; type: "public-key" };

type RegisterOptions = {
  challenge: string;
  rp: RP;
  user: User;
  pubKeyCredParams: PublicKeyCredential[];
  excludeCredentials: [];
  timeout: number;
  attestation: "direct";
  authenticatorSelection: {
    authenticatorAttachment: "platform";
    requireResidentKey: false;
    userVerification: "required";
  };
};

type GeneratedCredential = Credential & {
  rawId: ArrayBuffer;
  response: AuthenticatorResponse & {
    attestationObject: ArrayBuffer;
  };
};

export default function RegisterPage() {
  const handleClick = async () => {
    const response = await fetch("http://localhost:8000/webauthn/generate-options");
    const options: RegisterOptions = await response.json();

    const cred = await generateCredential(options);
    if (cred === null) throw new Error("クレデンシャルを生成できませんでした");

    const generatedCredential = {
      id: cred.id,
      type: cred.type,
      rawId: base64urlOf(cred.rawId),
      response: {
        attestationObject: base64urlOf(cred.response.attestationObject),
        clientDataJSON: base64urlOf(cred.response.clientDataJSON),
      },
    };

    await fetch("http://localhost:8000/webauthn/register", {
      method: "POST",
      body: JSON.stringify(generatedCredential),
    });
  };

  return (
    <div>
      <h1>パスキーを登録する</h1>
      <button onClick={handleClick}>登録する</button>
    </div>
  );
}

async function generateCredential(options: RegisterOptions) {
  const cred = await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: arrayBufferOf(options.challenge),
      user: {
        ...options.user,
        id: arrayBufferOf(options.user.id),
      },
    },
  });

  return cred as GeneratedCredential | null;
}

function arrayBufferOf(str: string) {
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
}

function base64urlOf(arrayBuffer: ArrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);

  let str = "";
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }

  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
