import { NextResponse } from "next/server";
import { DemoError } from "@/lib/engine";
import { getDemoStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getDemoStore().read(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Demo data read failed", error);
    return NextResponse.json(
      { message: "Demo məlumatları hazırda açıla bilmir." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 64_000)
      throw new DemoError("Sorğunun ölçüsü həddi aşır.", 413);
    let action: unknown;
    try {
      action = JSON.parse(text);
    } catch {
      throw new DemoError("Sorğu düzgün JSON formatında deyil.");
    }
    return NextResponse.json(await getDemoStore().mutate(action), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof DemoError)
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    console.error("Demo mutation failed", error);
    return NextResponse.json(
      { message: "Əməliyyat saxlanılmadı. Bir qədər sonra yenidən cəhd edin." },
      { status: 500 },
    );
  }
}
