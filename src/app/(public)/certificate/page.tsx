import { CertificatePage } from "@/components/public/certificate";
export const metadata = { title: "Elektron arayış" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  return (
    <CertificatePage
      key={typeof params.code === "string" ? params.code : ""}
      initialCode={typeof params.code === "string" ? params.code : ""}
    />
  );
}
