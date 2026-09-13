import { NextResponse } from "next/server";
import { publicCertificate } from "@/lib/engine";
import { getDemoStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (id.length > 100)
      return NextResponse.json(
        { message: "Arayış tapılmadı." },
        { status: 404 },
      );
    const state = await getDemoStore().read();
    const certificate = state.certificates.find(
      (item) => item.id === id || item.documentNumber === id,
    );
    if (!certificate)
      return NextResponse.json(
        { message: "Arayış tapılmadı və ya yoxlama kodu düzgün deyil." },
        { status: 404 },
      );
    return NextResponse.json(publicCertificate(certificate), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Certificate verification failed", error);
    return NextResponse.json(
      { message: "Arayış yoxlanarkən xəta baş verdi." },
      { status: 500 },
    );
  }
}
