import type { Property } from "./types";

export function formatMoney(cents: number): string {
  if (!Number.isSafeInteger(cents))
    throw new RangeError(
      "Money must be expressed as a safe integer number of qəpik.",
    );
  // Keep presentation stable even in browsers without Azerbaijani ICU locale data.
  const amount = BigInt(cents < 0 ? -cents : cents);
  const whole = (amount / 100n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const fraction = (amount % 100n).toString().padStart(2, "0");
  return `${cents < 0 ? "−" : ""}${whole},${fraction} ₼`;
}

export function formatDate(value: string): string {
  const parts = new Intl.DateTimeFormat("en-GB-u-ca-gregory-nu-latn", {
    timeZone: "Asia/Baku",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(value));
  const part = (type: "day" | "month" | "year") =>
    parts.find((item) => item.type === type)!.value;
  return `${part("day")}.${part("month")}.${part("year")}`;
}

function safeAmount(value: bigint): number {
  if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER))
    throw new RangeError("Məbləğ icazə verilən həddi aşır.");
  return Number(value);
}

function decimalHundredths(value: string): bigint {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized))
    throw new RangeError("Dəyəri ən çox iki onluq rəqəmlə daxil edin.");
  const [whole, fraction = ""] = normalized.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

/** Parse AZN form input before any binary floating-point conversion. */
export function parseMoneyInput(value: string): number {
  return safeAmount(decimalHundredths(value));
}

export function monthlyCharge(
  property: Pick<Property, "residents" | "areaSqm">,
  wasteUnitCents = 70,
  housingUnitCents = 15,
) {
  if (!Number.isSafeInteger(property.residents) || property.residents < 0)
    throw new RangeError("Sakin sayı mənfi olmayan tam ədəd olmalıdır.");
  if (
    ![wasteUnitCents, housingUnitCents].every(
      (rate) => Number.isSafeInteger(rate) && rate > 0,
    )
  )
    throw new RangeError("Tarif müsbət tam qəpiklə göstərilməlidir.");
  if (!Number.isFinite(property.areaSqm) || property.areaSqm <= 0)
    throw new RangeError("Sahə müsbət ədəd olmalıdır.");
  const areaHundredths = decimalHundredths(String(property.areaSqm));
  const waste = BigInt(property.residents) * BigInt(wasteUnitCents);
  // Integer rational arithmetic; each line rounds half up to one qəpik.
  const housing = (areaHundredths * BigInt(housingUnitCents) + 50n) / 100n;
  return {
    wasteCents: safeAmount(waste),
    housingCents: safeAmount(housing),
    totalCents: safeAmount(waste + housing),
  };
}

export function maskPropertyCode(code: string): string {
  return `${code.slice(0, 3)}••••••${code.slice(-3)}`;
}

export const roleLabels = {
  super_admin: "Baş administrator",
  finance_admin: "Maliyyə administratoru",
  area_manager: "Ərazi rəisi",
  operator: "Operator",
  document_officer: "Sənədlər üzrə mütəxəssis",
  auditor: "Auditor",
} as const;
