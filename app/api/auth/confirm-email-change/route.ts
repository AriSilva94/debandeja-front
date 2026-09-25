import { passthroughJson } from "@/lib/server/passthrough";

export async function POST(req: Request) {
  return passthroughJson("/auth/confirm-email-change", req);
}
