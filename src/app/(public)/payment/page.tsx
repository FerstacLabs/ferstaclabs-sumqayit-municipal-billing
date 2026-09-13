import { PaymentPage } from "@/components/public/payment";
export const metadata = { title: "Borcu yoxla və ödə" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  return (
    <PaymentPage
      key={typeof params.code === "string" ? params.code : ""}
      initialCode={typeof params.code === "string" ? params.code : ""}
    />
  );
}
