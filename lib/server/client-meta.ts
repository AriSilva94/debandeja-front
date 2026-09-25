export function getClientMeta(req: Request): { ip?: string; userAgent?: string } {
  const userAgent = req.headers.get("user-agent") ?? undefined;

  if (process.env.TRUST_PROXY_HEADERS !== "true") {
    return { userAgent };
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",").pop()?.trim() || realIp || undefined;
  return { ip, userAgent };
}
