import { monthlyCharge } from "./format";
import type {
  Area,
  AuditEvent,
  BillingPeriod,
  Building,
  Certificate,
  CommercialObject,
  DemoState,
  DemoUser,
  Invoice,
  Payment,
  Property,
  Role,
  Tariff,
} from "./types";

const seedTime = "2026-09-12T08:00:00.000Z";
const pad = (value: number, length = 3) => String(value).padStart(length, "0");

/** Entirely fictional presentation records; no real resident or account data. */
export function createSeed(): DemoState {
  const areaNames = [
    "1-ci mikrorayon",
    "2-ci mikrorayon",
    "12-ci mikrorayon",
    "9-cu mikrorayon",
    "10-cu mikrorayon",
    "13-cü mikrorayon",
    "17-ci mikrorayon",
    "18-ci mikrorayon",
    "Corat qəsəbəsi",
    "Hacı Zeynalabdin qəsəbəsi",
  ];
  const areas: Area[] = areaNames.map((name, i) => ({
    id: `area-${i + 1}`,
    name,
    manager: `Ərazi rəisi ${i + 1}`,
  }));
  const streets = [
    "Sülh küçəsi",
    "Azərbaycan prospekti",
    "Heydər Əliyev prospekti",
    "Nizami küçəsi",
    "Səməd Vurğun küçəsi",
    "Üzeyir Hacıbəyli küçəsi",
  ];
  const buildings: Building[] = Array.from({ length: 30 }, (_, i) => ({
    id: `building-${i + 1}`,
    areaId: areas[(i + 2) % 10].id,
    street: streets[i % streets.length],
    number: i === 0 ? "48" : String(10 + i * 3),
    entrances: 2 + (i % 5),
    apartments: i === 0 ? 144 : 40 + (i % 9) * 12,
    status: i === 28 ? "inactive" : "active",
  }));
  const properties: Property[] = Array.from({ length: 100 }, (_, i) => {
    const building = buildings[i % buildings.length];
    const area = areas.find((a) => a.id === building.areaId)!;
    const apartment = i === 0 ? "125" : String(1 + i);
    const property: Property = {
      id: `property-${i + 1}`,
      paymentCode: i === 0 ? "527418936204" : String(527418936204 + i * 7919),
      internalCode:
        i === 0
          ? "SMQ-R-Z03-B0487-E02-F0125"
          : `SMQ-R-Z${pad(((i + 2) % 10) + 1, 2)}-B${pad((i % 30) + 1, 4)}-E${pad((i % building.entrances) + 1, 2)}-F${pad(Number(apartment), 4)}`,
      buildingId: building.id,
      areaId: area.id,
      address: `Sumqayıt şəhəri, ${area.name}, bina ${building.number}, mənzil ${apartment}`,
      apartment,
      areaSqm: i === 0 ? 72.5 : 38 + ((i * 7) % 90) + (i % 2 ? 0.5 : 0),
      residents: i === 0 ? 4 : 1 + (i % 6),
      ownerMasked: [
        "A*** M***",
        "N*** Ə***",
        "R*** H***",
        "S*** Q***",
        "L*** İ***",
      ][i % 5],
      balanceCents: 0,
      status: i === 94 ? "inactive" : "active",
      ownerHistory: [
        { ownerMasked: "E*** S***", from: "2018-03-01", to: "2023-06-15" },
        {
          ownerMasked: [
            "A*** M***",
            "N*** Ə***",
            "R*** H***",
            "S*** Q***",
            "L*** İ***",
          ][i % 5],
          from: "2023-06-16",
          to: null,
        },
      ],
    };
    property.balanceCents =
      i === 0 ? 4104 : monthlyCharge(property).totalCents * (i % 5);
    return property;
  });
  const objectTypes = ["Market", "Aptek", "Klinika", "Ofis", "Mağaza"];
  const commercialObjects: CommercialObject[] = Array.from(
    { length: 15 },
    (_, i) => ({
      id: `commercial-${i + 1}`,
      code: `SMQ-C-${pad(i + 1, 5)}`,
      name: `${objectTypes[i % 5]} ${pad(i + 1)}`,
      type: objectTypes[i % 5],
      address: `${streets[i % streets.length]}, ${21 + i}`,
      areaId: areas[i % 10].id,
      areaSqm: 45 + i * 17,
      tariffCents: 2500 + i * 500,
      manager: areas[i % 10].manager,
      approvalStatus: i > 10 ? "pending" : "approved",
    }),
  );
  const roles: Role[] = [
    "super_admin",
    "finance_admin",
    "area_manager",
    "operator",
    "document_officer",
    "auditor",
  ];
  const users: DemoUser[] = Array.from({ length: 12 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `${["Demo administrator", "Maliyyə əməkdaşı", "Ərazi rəisi", "Qəbul operatoru", "Sənəd mütəxəssisi", "Demo auditor"][i % 6]} ${i > 5 ? "2" : "1"}`,
    email: `demo${i + 1}@example.invalid`,
    role: roles[i % 6],
    areaId: i % 6 === 2 ? areas[i % 10].id : null,
    active: i !== 11,
    mfaRequired: true,
  }));
  const tariffs: Tariff[] = [
    {
      id: "tariff-waste",
      name: "Zibil pulu",
      type: "residential",
      unit: "nəfər / ay",
      amountCents: 70,
      effectiveDate: "2026-01-01",
      createdBy: "Maliyyə administratoru",
      approvedBy: "Demo administrator",
      status: "approved",
    },
    {
      id: "tariff-housing",
      name: "Ev pulu",
      type: "residential",
      unit: "kv.m / ay",
      amountCents: 15,
      effectiveDate: "2026-01-01",
      createdBy: "Maliyyə administratoru",
      approvedBy: "Demo administrator",
      status: "approved",
    },
    ...commercialObjects.map((object): Tariff => ({
      id: `tariff-${object.id}`,
      name: `${object.name} — təmizlik xidməti`,
      type: "commercial",
      unit: "obyekt / ay",
      amountCents: object.tariffCents,
      effectiveDate: "2026-09-01",
      createdBy: object.manager,
      approvedBy:
        object.approvalStatus === "approved" ? "Maliyyə administratoru" : null,
      status: object.approvalStatus,
      commercialObjectId: object.id,
    })),
  ];
  const invoices: Invoice[] = Array.from({ length: 50 }, (_, i) => {
    const property = properties[i < 3 ? 0 : i - 2];
    const period = i < 3 ? `2026-0${7 + i}` : `2026-0${7 + (i % 3)}`;
    const charge = monthlyCharge(property);
    const paidCents =
      i < 3 ? 0 : i % 3 === 0 ? charge.totalCents : i % 7 === 0 ? 300 : 0;
    return {
      id: `invoice-${i + 1}`,
      propertyId: property.id,
      propertyCode: property.paymentCode,
      period,
      createdAt: `${period}-01T06:00:00.000Z`,
      dueDate: `${period}-28`,
      lines: [
        {
          name: "Zibil pulu",
          quantity: property.residents,
          unitCents: 70,
          amountCents: charge.wasteCents,
        },
        {
          name: "Ev pulu",
          quantity: property.areaSqm,
          unitCents: 15,
          amountCents: charge.housingCents,
        },
      ],
      totalCents: charge.totalCents,
      paidCents,
      status:
        paidCents === charge.totalCents
          ? "paid"
          : paidCents > 0
            ? "partial"
            : "unpaid",
      snapshot: {
        residents: property.residents,
        areaSqm: property.areaSqm,
        wasteUnitCents: 70,
        housingUnitCents: 15,
      },
    };
  });
  // Opening demo balances exactly equal the outstanding seeded invoice lines.
  // The 60 historical provider records are a separate presentation sample, not replayed on seed.
  for (const property of properties)
    property.balanceCents = invoices
      .filter((invoice) => invoice.propertyId === property.id)
      .reduce(
        (sum, invoice) => sum + invoice.totalCents - invoice.paidCents,
        0,
      );
  const payments: Payment[] = Array.from({ length: 60 }, (_, i) => {
    const property = properties[(i + 1) % properties.length];
    return {
      id: `payment-${i + 1}`,
      transactionId: `DEMO-2026-${pad(i + 1, 6)}`,
      propertyId: property.id,
      propertyCode: property.paymentCode,
      provider: ["DemoPay", "Terminal Demo", "Bank Demo"][i % 3],
      amountCents: monthlyCharge(property).totalCents * (1 + (i % 3)),
      status: i % 17 === 0 ? "failed" : i % 13 === 0 ? "pending" : "success",
      createdAt: `2026-0${4 + (i % 6)}-${pad(1 + (i % 27), 2)}T${pad(8 + (i % 9), 2)}:24:00.000Z`,
      reconciliationStatus:
        i % 11 === 0 ? "mismatch" : i % 7 === 0 ? "unmatched" : "matched",
      receiptNumber: `SMQ-Q-${pad(i + 1, 6)}`,
    };
  });
  const modules = [
    "Ödənişlər",
    "Binalar",
    "Tariflər",
    "Arayışlar",
    "Hesablanma",
  ];
  const auditEvents: AuditEvent[] = Array.from({ length: 20 }, (_, i) => ({
    id: `audit-${i + 1}`,
    actor: users[i % users.length].name,
    module: modules[i % 5],
    action: [
      "Ödəniş qeydə alındı",
      "Bina məlumatı yeniləndi",
      "Tarif təsdiqləndi",
      "Arayış yaradıldı",
      "Aylıq hesab yaradıldı",
    ][i % 5],
    oldValue: i % 5 === 2 ? "Gözləyir" : "—",
    newValue: i % 5 === 2 ? "Təsdiqləndi" : `DEMO-${pad(i + 1, 4)}`,
    ip: `192.0.2.${10 + i}`,
    createdAt: `2026-09-${pad(1 + (i % 12), 2)}T10:${pad((i * 3) % 60, 2)}:00.000Z`,
    reason: "Təqdimat üçün sintetik nümunə",
  }));
  const certificates: Certificate[] = Array.from({ length: 6 }, (_, i) => ({
    id: `cert-demo-${pad(i + 1)}`,
    documentNumber: `SMQ-AR-2026-${pad(i + 1, 6)}`,
    propertyCode: properties[i].paymentCode,
    propertyId: properties[i].id,
    issuedAt: `2026-09-${pad(3 + i, 2)}T09:00:00.000Z`,
    expiresAt:
      i === 4 ? "2026-09-10T09:00:00.000Z" : "2026-10-10T09:00:00.000Z",
    status: (
      ["issued", "pending", "issued", "rejected", "expired", "pending"] as const
    )[i],
    method: (["sms", "sima", "asan"] as const)[i % 3],
    debtCents: properties[i].balanceCents,
    address: properties[i].address,
  }));
  const billingPeriods: BillingPeriod[] = ["2026-07", "2026-08", "2026-09"].map(
    (period, i) => ({
      id: `period-${period}`,
      period,
      status: i === 2 ? "open" : "closed",
      invoiceCount: invoices.filter((invoice) => invoice.period === period)
        .length,
      totalCents: invoices
        .filter((invoice) => invoice.period === period)
        .reduce((sum, invoice) => sum + invoice.totalCents, 0),
      generatedAt: `${period}-01T06:00:00.000Z`,
    }),
  );
  return {
    version: 1,
    updatedAt: seedTime,
    areas,
    buildings,
    properties,
    commercialObjects,
    users,
    tariffs,
    invoices,
    payments,
    auditEvents,
    certificates,
    billingPeriods,
    reconciliationRows: [],
    supportMessages: [],
  };
}
