/** Google Identity Services + userinfo helpers (client-only). */

export interface GoogleUserProfile {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

type TokenClient = {
  requestAccessToken: (override?: { prompt?: string }) => void;
};

type GoogleAccounts = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: {
        access_token?: string;
        error?: string;
        error_description?: string;
      }) => void;
      error_callback?: (error: { type?: string; message?: string }) => void;
    }) => TokenClient;
    revoke: (token: string, done?: () => void) => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const OAUTH_SCOPES = "openid email profile";
const TOKEN_STORAGE_KEY = "inkmorph-google-access-token";

let scriptPromise: Promise<void> | null = null;

function getClientId(): string {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    // Public OAuth Web Client ID (restricted by Authorized JavaScript origins).
    "754893298494-5svfh6fhlm9619a6fn2qhvljse8n4ee2.apps.googleusercontent.com";

  if (!clientId) {
    throw new Error(
      "Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID. Add your Google OAuth Client ID to .env.local."
    );
  }
  return clientId;
}

function loadGisScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."));
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services.")),
        { once: true }
      );
      if (window.google?.accounts?.oauth2) {
        resolve();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Google Identity Services."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function storeAccessToken(token: string): void {
  try {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage failures — session still works via localStorage auth flag.
  }
}

function readAccessToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearAccessToken(): void {
  try {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

async function fetchUserInfo(accessToken: string): Promise<GoogleUserProfile> {
  const response = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Unable to load Google account details.");
  }

  const data = (await response.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  if (!data.sub || !data.email) {
    throw new Error("Google account is missing required profile fields.");
  }

  return {
    sub: data.sub,
    email: data.email,
    name: typeof data.name === "string" ? data.name : data.email,
    picture: typeof data.picture === "string" ? data.picture : "",
  };
}

function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) {
      reject(new Error("Google Identity Services is not ready."));
      return;
    }

    const client = oauth2.initTokenClient({
      client_id: getClientId(),
      scope: OAUTH_SCOPES,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                "Google sign-in was cancelled."
            )
          );
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(
          new Error(error.message || error.type || "Google sign-in failed.")
        );
      },
    });

    client.requestAccessToken({ prompt: "select_account" });
  });
}

/**
 * Opens Google account picker, then returns the authenticated Google profile.
 */
export async function signInWithGoogle(): Promise<GoogleUserProfile> {
  await loadGisScript();
  const accessToken = await requestAccessToken();
  storeAccessToken(accessToken);
  return fetchUserInfo(accessToken);
}

/** Best-effort revoke of the Google access token (used on sign-out). */
export function revokeGoogleAccess(): void {
  if (typeof window === "undefined") {
    return;
  }

  const token = readAccessToken();
  clearAccessToken();

  if (!token || !window.google?.accounts?.oauth2) {
    return;
  }

  try {
    window.google.accounts.oauth2.revoke(token);
  } catch {
    // ignore revoke failures
  }
}
