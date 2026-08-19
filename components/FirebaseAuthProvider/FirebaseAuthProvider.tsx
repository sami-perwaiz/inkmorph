"use client";

import { useLayoutEffect, type ReactNode } from "react";

import {
  AUTH_CHANGE_EVENT,
  setAuthReadyState,
  syncAuthUserFromFirebase,
} from "@/lib/authSession";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

/** Keeps Firebase Auth state in sync with the existing authSession API. */
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, (user) => {
        syncAuthUserFromFirebase(user);
        setAuthReadyState(true);
        window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
      });
    } catch (error) {
      console.error(error);
      setAuthReadyState(true);
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    }

    return () => unsubscribe?.();
  }, []);

  return children;
}
