/** Canonical site origin — always HTTPS in production (never http on live domains). */
export function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return normalizeSiteUrl(fromEnv);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;
  }

  return "http://localhost:3000";
}

function normalizeSiteUrl(url: string): string {
  const withProtocol = url.startsWith("http") ? url : `https://${url}`;

  try {
    const parsed = new URL(withProtocol);

    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return parsed.origin;
    }

    parsed.protocol = "https:";
    return parsed.origin;
  } catch {
    return "http://localhost:3000";
  }
}
