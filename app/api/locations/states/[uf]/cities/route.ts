import { NextResponse } from "next/server";
import { UFS } from "@/lib/br-states";
import { listCities } from "@/lib/server/ibge";

type RouteContext = { params: Promise<{ uf: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
  const uf = (await ctx.params).uf.toUpperCase();
  if (!UFS.includes(uf)) {
    return NextResponse.json({ message: "UF inválida" }, { status: 400 });
  }
  try {
    return NextResponse.json(await listCities(uf));
  } catch {
    return NextResponse.json({ message: "Lista de cidades indisponível" }, { status: 502 });
  }
}
