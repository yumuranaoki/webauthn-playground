import type { AuthenticatorTransportFuture, CredentialDeviceType } from "@simplewebauthn/types";

export type Authenticator = {
  credentialID: Uint8Array;
  credentialPublicKey: Uint8Array;
  counter: number;
  credentialDeviceType: CredentialDeviceType;
  credentialBackedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
};
