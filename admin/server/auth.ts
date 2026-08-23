import type { Context, Next } from "hono";

/**
 * Reserved for SaaS: when DESIGNALIGN_API_TOKEN is set, require Bearer match.
 * Locally the token is unset and this is a no-op.
 */
export async function optionalBearerAuth(c: Context, next: Next) {
  const expected = process.env.DESIGNALIGN_API_TOKEN;
  if (!expected) {
    await next();
    return;
  }
  const header = c.req.header("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || match[1] !== expected) {
    return c.json(
      {
        error: {
          code: "unauthorized",
          message: "Missing or invalid Authorization Bearer token",
        },
      },
      401,
    );
  }
  await next();
}
