import { notFound } from "next/navigation";
import { AdminPageContent } from "@/components/admin/admin-pages";

const sections = [
  "dashboard",
  "buildings",
  "properties",
  "residents",
  "commercial-objects",
  "tariffs",
  "billing",
  "invoices",
  "payments",
  "reconciliation",
  "certificates",
  "reports",
  "users-roles",
  "audit-log",
  "settings",
  "system-architecture",
];

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <AdminPageContent key={section} section={section} />;
}
