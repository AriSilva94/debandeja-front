import { NextResponse } from "next/server";
import { listStates } from "@/lib/server/ibge";

export async function GET() {
  try {
    return NextResponse.json(await listStates());
  } catch {
    return NextResponse.json({ message: "Lista de estados indisponível" }, { status: 502 });
  }
}
