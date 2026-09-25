import { forwardSessionRequest } from "@/lib/server/resolve-destination";

export function POST(req: Request) {
  return forwardSessionRequest(req, "/auth/verify-email");
}
