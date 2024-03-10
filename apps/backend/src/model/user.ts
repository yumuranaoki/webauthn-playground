import type { UUID } from "node:crypto";

export type User = {
  id: UUID;
  loginId: string;
  displayName: string;
};
