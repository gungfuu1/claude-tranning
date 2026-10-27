// BR-07: where to go after login. Only same-site paths are allowed; anything else falls back to "/".
const BASE = "http://internal.invalid";

export function safeNext(next: unknown): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return "/";
  // The URL parser treats "\" like "/", so "/\evil.com" resolves to another origin and is rejected here.
  let url: URL;
  try {
    url = new URL(next, BASE);
  } catch {
    return "/";
  }
  return url.origin === BASE ? `${url.pathname}${url.search}${url.hash}` : "/";
}

// Builds a link to /login or /register that carries `next` along (spec 003 §3.1, §3.2).
export const withNext = (path: string, next: string) =>
  next === "/" ? path : `${path}?next=${encodeURIComponent(next)}`;
