import { AuthConflictError } from "@/lib/authErrors";

interface FirebaseAuthErrorLike {
  code?: string;
  message?: string;
}

export function mapFirebaseAuthError(error: unknown): AuthConflictError {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as FirebaseAuthErrorLike).code === "string"
      ? (error as FirebaseAuthErrorLike).code
      : undefined;

  switch (code) {
    case "auth/email-already-in-use":
      return new AuthConflictError("An account with this email already exists.");
    case "auth/invalid-email":
      return new AuthConflictError("Enter a valid email address.");
    case "auth/user-disabled":
      return new AuthConflictError("This account has been disabled.");
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return new AuthConflictError("Incorrect email or password.");
    case "auth/weak-password":
      return new AuthConflictError("Choose a stronger password.");
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return new AuthConflictError("Google sign-in was cancelled.");
    case "auth/account-exists-with-different-credential":
      return new AuthConflictError(
        "An account already exists with this email using a different sign-in method."
      );
    case "auth/operation-not-allowed":
      return new AuthConflictError(
        "This sign-in method is not enabled for InkMorph yet."
      );
    default:
      break;
  }

  if (error instanceof Error && error.message) {
    return new AuthConflictError(error.message);
  }

  return new AuthConflictError("Authentication failed. Please try again.");
}
