import { UserMetadata } from "firebase/auth";

export enum AuthProviderEnum {
  EMAIL = "email",
  GOOGLE = "google",
}

export interface SignUpDto {
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string | null;
  metadata: UserMetadata;
  firebaseUid: string;
  emailVerified: boolean;
  authProvider: string;
}
