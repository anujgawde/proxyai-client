import { AuthProviderEnum } from "./auth";

export interface User {
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  photoURL: string | null;
  authProvider: AuthProviderEnum;
  emailVerified: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
