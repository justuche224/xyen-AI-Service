import { Context, Next } from "hono";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Invalid authorization header format" }, 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const secretKey = process.env.SECRET_KEY;

  const isCorrect = secretKey === token;

  if (!isCorrect) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
}
