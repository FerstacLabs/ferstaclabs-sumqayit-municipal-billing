import { VerifyPage } from "@/components/public/certificate";
export const metadata = { title: "QR arayış yoxlama" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  return (
    <VerifyPage
      key={typeof params.id === "string" ? params.id : ""}
      initialId={typeof params.id === "string" ? params.id : ""}
    />
  );
}
