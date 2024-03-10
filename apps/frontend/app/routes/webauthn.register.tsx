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

export default function RegisterPage() {
  const handleClick = async () => {
    const response = await fetch("http://localhost:8000/webauthn/generate-options");
    const options: RegisterOptions = await response.json();

    await navigator.credentials.create({
      publicKey: {
        ...options,
        challenge: arrayBufferOf(options.challenge),
        user: {
          ...options.user,
          id: arrayBufferOf(options.user.id),
        },
      },
    });
  };

  return (
    <div>
      <h1>パスキーを登録する</h1>
      <button onClick={handleClick}>登録する</button>
    </div>
  );
}

function arrayBufferOf(str: string) {
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
}
