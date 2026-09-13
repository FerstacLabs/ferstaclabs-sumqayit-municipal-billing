import { randomUUID } from "node:crypto";
import { maskPropertyCode, monthlyCharge } from "./format";
import type {
  ActionResult,
  Building,
  Certificate,
  DemoState,
  Invoice,
  Payment,
  PublicCertificate,
  ReconciliationRow,
} from "./types";

export class DemoError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "DemoError";
  }
}

function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new DemoError("Sorğunun formatı yanlışdır.");
  return value as Record<string, unknown>;
}

function string(value: unknown, field: string, min = 1, max = 250): string {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    throw new DemoError(`${field}: düzgün dəyər daxil edin.`);
  return value.trim();
}

function integer(
  value: unknown,
  field: string,
  min: number,
  max: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  )
    throw new DemoError(
      `${field}: ${min}–${max} aralığında tam ədəd olmalıdır.`,
    );
  return value;
}

function calendarDate(value: unknown, field: string): string {
  const day = string(value, field, 10, 10);
  if (
    !/^(20\d{2}|2100)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(day) ||
    new Date(`${day}T00:00:00.000Z`).toISOString().slice(0, 10) !== day
  )
    throw new DemoError(`${field}: düzgün təqvim tarixi daxil edin.`);
  return day;
}

function addCents(left: number, right: number): number {
  const total = left + right;
  if (
    ![left, right, total].every(
      (value) => Number.isSafeInteger(value) && value >= 0,
    )
  )
    throw new DemoError("Məbləğ icazə verilən həddi aşır.");
  return total;
}

function propertyFor(state: DemoState, code: unknown) {
  const paymentCode = string(code, "Ödəniş kodu", 12, 12);
  if (!/^\d{12}$/.test(paymentCode))
    throw new DemoError("Ödəniş kodu 12 rəqəmdən ibarət olmalıdır.");
  const property = state.properties.find(
    (item) => item.paymentCode === paymentCode,
  );
  if (!property)
    throw new DemoError("Bu ödəniş kodu üzrə mənzil tapılmadı.", 404);
  return property;
}

function audit(
  state: DemoState,
  now: string,
  module: string,
  action: string,
  oldValue: string,
  newValue: string,
  reason = "Demo əməliyyatı",
  actor = "Demo administrator",
) {
  state.auditEvents.unshift({
    id: `audit-${randomUUID()}`,
    actor,
    module,
    action,
    oldValue,
    newValue,
    reason,
    ip: "192.0.2.1",
    createdAt: now,
  });
}

function pay(
  state: DemoState,
  action: Record<string, unknown>,
  now: string,
): Omit<ActionResult, "data"> {
  const transactionId = string(action.transactionId, "Tranzaksiya ID", 6, 100);
  if (!/^[A-Za-z0-9_-]+$/.test(transactionId))
    throw new DemoError(
      "Tranzaksiya ID yalnız hərf, rəqəm, tire və alt xətdən ibarət olmalıdır.",
    );
  const amountCents = integer(
    action.amountCents,
    "Məbləğ (qəpik)",
    1,
    100_000_000,
  );
  const property = propertyFor(state, action.propertyCode);
  const provider =
    action.provider === undefined
      ? "DemoPay"
      : string(action.provider, "Provayder", 2, 50);
  const existing = state.payments.find(
    (payment) => payment.transactionId === transactionId,
  );
  if (existing) {
    if (
      existing.propertyCode !== property.paymentCode ||
      existing.amountCents !== amountCents ||
      existing.status !== "success" ||
      (action.provider !== undefined && existing.provider !== provider)
    )
      throw new DemoError(
        "Tranzaksiya ID artıq fərqli məlumat və ya statusla istifadə olunub. Ödəniş tətbiq edilmədi.",
        409,
      );
    audit(
      state,
      now,
      "Ödənişlər",
      "Təkrar tranzaksiya bloklandı",
      transactionId,
      "Balans dəyişmədi",
      `${property.paymentCode} · İdempotent sorğu`,
      "DemoPay",
    );
    return {
      message:
        "Təkrar tranzaksiya aşkarlandı. Ödəniş ikinci dəfə tətbiq edilmədi.",
      payment: existing,
      duplicate: true,
    };
  }
  if (property.status !== "active")
    throw new DemoError("Bu mənzil üzrə ödəniş qəbulu aktiv deyil.");
  const ledgerBalance = state.invoices
    .filter((item) => item.propertyId === property.id)
    .reduce(
      (sum, invoice) => addCents(sum, invoice.totalCents - invoice.paidCents),
      0,
    );
  if (property.balanceCents !== ledgerBalance)
    throw new DemoError(
      "Balans və hesablar uyğun gəlmir. Üzləşdirmə tələb olunur.",
      409,
    );
  if (amountCents > property.balanceCents)
    throw new DemoError("Ödəniş məbləği cari borcdan artıq ola bilməz.");
  const previousBalance = property.balanceCents;
  property.balanceCents -= amountCents;
  let remaining = amountCents;
  for (const invoice of state.invoices
    .filter(
      (item) =>
        item.propertyId === property.id && item.paidCents < item.totalCents,
    )
    .sort((a, b) => a.period.localeCompare(b.period))) {
    const applied = Math.min(remaining, invoice.totalCents - invoice.paidCents);
    invoice.paidCents += applied;
    invoice.status =
      invoice.paidCents === invoice.totalCents
        ? "paid"
        : invoice.paidCents > 0
          ? "partial"
          : "unpaid";
    remaining -= applied;
    if (remaining === 0) break;
  }
  const payment: Payment = {
    id: `payment-${randomUUID()}`,
    transactionId,
    propertyId: property.id,
    propertyCode: property.paymentCode,
    provider,
    amountCents,
    status: "success",
    createdAt: now,
    reconciliationStatus: "unmatched",
    receiptNumber: `SMQ-Q-${now.slice(0, 10).replaceAll("-", "")}-${String(state.payments.length + 1).padStart(6, "0")}`,
  };
  state.payments.unshift(payment);
  audit(
    state,
    now,
    "Ödənişlər",
    "Simulyasiya ödənişi qəbul edildi",
    `${previousBalance} qəpik`,
    `${property.balanceCents} qəpik`,
    `${property.paymentCode} · ${transactionId}`,
    provider,
  );
  return {
    message: "Demo ödəniş uğurla tamamlandı. Heç bir real vəsait tutulmadı.",
    payment,
    duplicate: false,
  };
}

/** Pure transactional domain boundary. The .NET API should preserve these action/result contracts. */
export function applyAction(
  previous: DemoState,
  input: unknown,
  date = new Date(),
): ActionResult {
  const action = object(input);
  const state = structuredClone(previous);
  const now = date.toISOString();
  let result: Omit<ActionResult, "data">;
  switch (action.type) {
    case "pay":
    case "provider_callback":
      result = pay(state, action, now);
      break;
    case "issue_certificate": {
      const property = propertyFor(state, action.propertyCode);
      if (property.status !== "active")
        throw new DemoError("Bu mənzil üçün arayış xidməti aktiv deyil.");
      const method = action.method;
      if (method !== "sms" && method !== "sima" && method !== "asan")
        throw new DemoError("Doğrulama üsulu düzgün seçilməyib.");
      if (method === "sms" && action.otp !== "123456")
        throw new DemoError("Demo təsdiq kodu yanlışdır. Nümunə kod: 123456.");
      const certificate: Certificate = {
        id: `cert-${randomUUID()}`,
        documentNumber: `SMQ-AR-${date.getUTCFullYear()}-${String(state.certificates.length + 1).padStart(6, "0")}`,
        propertyId: property.id,
        propertyCode: property.paymentCode,
        issuedAt: now,
        expiresAt: new Date(date.getTime() + 30 * 86_400_000).toISOString(),
        status: "issued",
        method,
        debtCents: property.balanceCents,
        address: property.address,
      };
      state.certificates.unshift(certificate);
      audit(
        state,
        now,
        "Arayışlar",
        "Demo arayış verildi",
        "—",
        certificate.documentNumber,
        `${property.paymentCode} · ${method.toUpperCase()} simulyasiyası`,
        "Vətəndaş demo",
      );
      result = {
        message: "Demo arayış hazırdır. Elektron imza və hüquqi qüvvə daşımır.",
        certificate,
      };
      break;
    }
    case "support": {
      const name = string(action.name, "Ad", 2, 80);
      const email = string(action.email, "E-poçt", 5, 120);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new DemoError("Düzgün e-poçt ünvanı daxil edin.");
      const subject = string(action.subject, "Mövzu", 3, 120);
      const message = string(action.message, "Müraciət", 10, 2000);
      const id = `support-${randomUUID()}`;
      state.supportMessages.unshift({
        id,
        name,
        email,
        subject,
        message,
        createdAt: now,
      });
      audit(
        state,
        now,
        "Müraciətlər",
        "Demo müraciət qeydə alındı",
        "—",
        id,
        "Lokal yaddaşda saxlanılıb; göndərilməyib",
        "Vətəndaş demo",
      );
      result = {
        message:
          "Müraciət demo yaddaşında qeydə alındı. Real quruma və ya e-poçta göndərilmədi.",
      };
      break;
    }
    case "save_building": {
      const raw = object(action.building);
      const areaId = string(raw.areaId, "Ərazi");
      if (!state.areas.some((area) => area.id === areaId))
        throw new DemoError("Seçilmiş ərazi mövcud deyil.");
      const status = raw.status;
      if (status !== "active" && status !== "inactive")
        throw new DemoError("Bina statusu düzgün deyil.");
      const id =
        raw.id === undefined
          ? `building-${randomUUID()}`
          : string(raw.id, "Bina ID");
      const old = state.buildings.find((building) => building.id === id);
      if (raw.id !== undefined && !old)
        throw new DemoError("Bina tapılmadı.", 404);
      const oldValue = old ? JSON.stringify(old) : "—";
      const building: Building = {
        id,
        areaId,
        street: string(raw.street, "Küçə", 2, 120),
        number: string(raw.number, "Bina nömrəsi", 1, 20),
        entrances: integer(raw.entrances, "Giriş sayı", 1, 50),
        apartments: integer(raw.apartments, "Mənzil sayı", 1, 2000),
        status,
      };
      if (old) Object.assign(old, building);
      else state.buildings.unshift(building);
      audit(
        state,
        now,
        "Binalar",
        old ? "Bina yeniləndi" : "Bina əlavə edildi",
        oldValue,
        JSON.stringify(building),
      );
      result = { message: "Bina məlumatları saxlanıldı." };
      break;
    }
    case "approve_tariff": {
      const tariffId = string(action.tariffId, "Tarif ID");
      const tariff = state.tariffs.find((item) => item.id === tariffId);
      if (!tariff) throw new DemoError("Tarif tapılmadı.", 404);
      if (tariff.type !== "commercial")
        throw new DemoError(
          "Bu demo axını yalnız qeyri-yaşayış tarifləri üçündür.",
        );
      if (action.status !== "approved" && action.status !== "rejected")
        throw new DemoError("Təsdiq statusu düzgün deyil.");
      const oldStatus = tariff.status;
      tariff.status = action.status;
      tariff.approvedBy =
        action.status === "approved" ? "Maliyyə administratoru" : null;
      const commercial = state.commercialObjects.find(
        (item) => item.id === tariff.commercialObjectId,
      );
      if (commercial) {
        commercial.approvalStatus = action.status;
        if (action.status === "approved")
          commercial.tariffCents = tariff.amountCents;
      }
      audit(
        state,
        now,
        "Tariflər",
        action.status === "approved"
          ? "Tarif təsdiqləndi"
          : "Tarif rədd edildi",
        oldStatus,
        action.status,
        action.reason
          ? string(action.reason, "Səbəb", 3, 500)
          : "Maliyyə baxışı",
      );
      result = {
        message:
          action.status === "approved"
            ? "Obyektin tarifi təsdiqləndi."
            : "Tarif müraciəti rədd edildi.",
      };
      break;
    }
    case "save_property": {
      const propertyId = string(action.propertyId, "Mənzil ID");
      const property = state.properties.find((item) => item.id === propertyId);
      if (!property) throw new DemoError("Mənzil tapılmadı.", 404);
      const residents = integer(action.residents, "Sakin sayı", 0, 50);
      const areaSqm = action.areaSqm;
      if (
        typeof areaSqm !== "number" ||
        !Number.isFinite(areaSqm) ||
        areaSqm < 0.01 ||
        areaSqm > 10_000 ||
        !/^\d+(?:\.\d{1,2})?$/.test(String(areaSqm))
      )
        throw new DemoError(
          "Sahə 0,01–10 000 kv.m aralığında, ən çox iki onluq rəqəmlə olmalıdır.",
        );
      const reason = string(action.reason, "Dəyişiklik səbəbi", 3, 500);
      const oldValue = `${property.residents} nəfər · ${property.areaSqm} kv.m`;
      property.residents = residents;
      property.areaSqm = areaSqm;
      audit(
        state,
        now,
        "Mənzillər",
        "Sakin və sahə məlumatı yeniləndi",
        oldValue,
        `${residents} nəfər · ${areaSqm} kv.m`,
        `${property.paymentCode} · ${reason}`,
      );
      result = {
        message:
          "Cari sakin sayı və sahə saxlanıldı. Əvvəlki hesabların məbləği və dondurulmuş məlumatları qorundu.",
      };
      break;
    }
    case "save_commercial_tariff": {
      const commercialObjectId = string(action.commercialObjectId, "Obyekt ID");
      const commercial = state.commercialObjects.find(
        (item) => item.id === commercialObjectId,
      );
      const tariff = state.tariffs.find(
        (item) =>
          item.type === "commercial" &&
          item.commercialObjectId === commercialObjectId,
      );
      if (!commercial || !tariff)
        throw new DemoError("Obyekt və ya onun tarifi tapılmadı.", 404);
      const amountCents = integer(
        action.amountCents,
        "Tarif (qəpik)",
        1,
        100_000_000,
      );
      const effectiveDate = calendarDate(
        action.effectiveDate,
        "Qüvvəyə minmə tarixi",
      );
      const reason = string(action.reason, "Dəyişiklik səbəbi", 3, 500);
      const oldValue = JSON.stringify(tariff);
      Object.assign(tariff, {
        amountCents,
        effectiveDate,
        status: "pending",
        approvedBy: null,
        createdBy: commercial.manager,
      });
      commercial.approvalStatus = "pending";
      audit(
        state,
        now,
        "Tariflər",
        "Fərdi tarif təsdiqə göndərildi",
        oldValue,
        JSON.stringify(tariff),
        reason,
        commercial.manager,
      );
      result = {
        message:
          "Fərdi tarif təsdiqə göndərildi. Təyin edilmiş məbləğ maliyyə təsdiqindən sonra yenilənəcək.",
      };
      break;
    }
    case "generate_billing": {
      const period = string(action.period, "Hesab dövrü", 7, 7);
      if (!/^(20\d{2}|2100)-(0[1-9]|1[0-2])$/.test(period))
        throw new DemoError("Hesab dövrünü İİİİ-AA formatında daxil edin.");
      const existingPeriod = state.billingPeriods.find(
        (item) => item.period === period,
      );
      if (existingPeriod?.status === "closed")
        throw new DemoError(
          "Bağlanmış dövr üçün yenidən hesab yaratmaq olmaz.",
          409,
        );
      const effective = `${period}-01`;
      const waste = state.tariffs.find(
        (tariff) =>
          tariff.id === "tariff-waste" &&
          tariff.status === "approved" &&
          tariff.effectiveDate <= effective,
      );
      const housing = state.tariffs.find(
        (tariff) =>
          tariff.id === "tariff-housing" &&
          tariff.status === "approved" &&
          tariff.effectiveDate <= effective,
      );
      if (!waste || !housing)
        throw new DemoError("Bu dövr üçün təsdiqlənmiş yaşayış tarifi yoxdur.");
      let created = 0;
      for (const property of state.properties.filter(
        (item) => item.status === "active",
      )) {
        if (
          state.invoices.some(
            (invoice) =>
              invoice.propertyId === property.id && invoice.period === period,
          )
        )
          continue;
        let charge: ReturnType<typeof monthlyCharge>;
        try {
          charge = monthlyCharge(
            property,
            waste.amountCents,
            housing.amountCents,
          );
        } catch (error) {
          throw new DemoError(
            error instanceof Error
              ? error.message
              : "Hesablanma məlumatları düzgün deyil.",
          );
        }
        const invoice: Invoice = {
          id: `invoice-${randomUUID()}`,
          propertyId: property.id,
          propertyCode: property.paymentCode,
          period,
          createdAt: now,
          dueDate: `${period}-28`,
          lines: [
            {
              name: "Zibil pulu",
              quantity: property.residents,
              unitCents: waste.amountCents,
              amountCents: charge.wasteCents,
            },
            {
              name: "Ev pulu",
              quantity: property.areaSqm,
              unitCents: housing.amountCents,
              amountCents: charge.housingCents,
            },
          ],
          totalCents: charge.totalCents,
          paidCents: 0,
          status: "unpaid",
          snapshot: {
            residents: property.residents,
            areaSqm: property.areaSqm,
            wasteUnitCents: waste.amountCents,
            housingUnitCents: housing.amountCents,
          },
        };
        state.invoices.unshift(invoice);
        property.balanceCents = addCents(
          property.balanceCents,
          invoice.totalCents,
        );
        created++;
      }
      const periodInvoices = state.invoices.filter(
        (invoice) => invoice.period === period,
      );
      const updatedPeriod = {
        id: existingPeriod?.id ?? `period-${period}`,
        period,
        status: "generated" as const,
        invoiceCount: periodInvoices.length,
        totalCents: periodInvoices.reduce(
          (sum, invoice) => addCents(sum, invoice.totalCents),
          0,
        ),
        generatedAt: existingPeriod?.generatedAt ?? now,
      };
      if (existingPeriod) Object.assign(existingPeriod, updatedPeriod);
      else state.billingPeriods.unshift(updatedPeriod);
      audit(
        state,
        now,
        "Hesablanma",
        "Aylıq hesablanma icra edildi",
        period,
        `${created} yeni hesab`,
        "Sakin sayı, sahə və tariflər hesab anında donduruldu",
      );
      result = {
        message: created
          ? `${period} dövrü üçün ${created} yeni hesab yaradıldı.`
          : "Bu dövrün bütün hesabları artıq mövcuddur. Təkrar hesab yaradılmadı.",
        duplicate: created === 0,
      };
      break;
    }
    case "import_reconciliation": {
      const successful = state.payments
        .filter((payment) => payment.status === "success")
        .slice(0, 8);
      const rows: ReconciliationRow[] = successful.map((payment, i) => ({
        id: `recon-${randomUUID()}`,
        transactionId: payment.transactionId,
        providerAmountCents: payment.amountCents + (i === 1 ? 100 : 0),
        ledgerAmountCents: payment.amountCents,
        status: i === 1 ? "mismatch" : "matched",
        note:
          i === 1
            ? "Provayder hesabatında 1,00 AZN fərq var"
            : "Məbləğ və tranzaksiya ID uyğundur",
      }));
      rows.push({
        id: `recon-${randomUUID()}`,
        transactionId: "DEMO-REPORT-MISSING-001",
        providerAmountCents: 2500,
        ledgerAmountCents: null,
        status: "missing",
        note: "Provayderdə var, daxili reyestrdə yoxdur",
      });
      if (successful[0])
        rows.push({
          id: `recon-${randomUUID()}`,
          transactionId: successful[0].transactionId,
          providerAmountCents: successful[0].amountCents,
          ledgerAmountCents: successful[0].amountCents,
          status: "duplicate",
          note: "Demo hesabatında eyni tranzaksiya ikinci dəfə təkrarlanıb",
        });
      for (const row of rows) {
        const payment = state.payments.find(
          (item) => item.transactionId === row.transactionId,
        );
        if (payment && row.status !== "duplicate")
          payment.reconciliationStatus =
            row.status === "matched" ? "matched" : "mismatch";
      }
      state.reconciliationRows = rows;
      audit(
        state,
        now,
        "Üzləşdirmə",
        "Demo provayder hesabatı idxal edildi",
        "—",
        `${rows.length} sətir`,
        "Uyğun, fərqli, çatışmayan və təkrar nümunələr",
      );
      result = {
        message:
          "Demo hesabatı idxal edildi. Fərqli, çatışmayan və təkrar əməliyyatlar baxış növbəsindədir.",
      };
      break;
    }
    case "review_reconciliation": {
      const rowId = string(action.rowId, "Sətir ID");
      const row = state.reconciliationRows.find((item) => item.id === rowId);
      if (!row) throw new DemoError("Üzləşdirmə sətri tapılmadı.", 404);
      const resolution = string(action.resolution, "Baxış qeydi", 3, 500);
      row.reviewed = true;
      row.resolution = resolution;
      audit(
        state,
        now,
        "Üzləşdirmə",
        "Əməliyyata əl ilə baxıldı",
        row.status,
        resolution,
        row.transactionId,
      );
      result = {
        message:
          "Baxış qeydi saxlanıldı. İlkin uyğunsuzluq və ödəniş məbləği dəyişdirilmədi.",
      };
      break;
    }
    case "review_certificate": {
      const certificateId = string(action.certificateId, "Arayış ID");
      const certificate = state.certificates.find(
        (item) => item.id === certificateId,
      );
      if (!certificate) throw new DemoError("Arayış tapılmadı.", 404);
      if (action.status !== "issued" && action.status !== "rejected")
        throw new DemoError("Arayış statusu düzgün deyil.");
      if (certificate.status !== "pending")
        throw new DemoError(
          "Yalnız gözləmədə olan müraciətə qərar vermək olar.",
          409,
        );
      const oldStatus = certificate.status;
      certificate.status = action.status;
      if (action.status === "issued") {
        const property = propertyFor(state, certificate.propertyCode);
        if (property.status !== "active")
          throw new DemoError("Bu mənzil üçün arayış xidməti aktiv deyil.");
        certificate.issuedAt = now;
        certificate.expiresAt = new Date(
          date.getTime() + 30 * 86_400_000,
        ).toISOString();
        certificate.debtCents = property.balanceCents;
        certificate.address = property.address;
      }
      audit(
        state,
        now,
        "Arayışlar",
        "Arayış müraciətinə baxıldı",
        oldStatus,
        action.status,
        `${certificate.propertyCode} · ${action.reason ? string(action.reason, "Səbəb", 3, 500) : "Sənədlər üzrə mütəxəssisin demo qərarı"}`,
      );
      result = {
        message:
          action.status === "issued"
            ? "Arayış müraciəti təsdiqləndi."
            : "Arayış müraciəti rədd edildi.",
        certificate,
      };
      break;
    }
    default:
      throw new DemoError("Bu əməliyyat dəstəklənmir.");
  }
  state.updatedAt = now;
  return { data: state, ...result };
}

/** Public verification deliberately omits address, full payment code, owner and debt amount. */
export function publicCertificate(
  certificate: Certificate,
  date = new Date(),
): PublicCertificate {
  const expiresAt = new Date(certificate.expiresAt).getTime();
  const issuedAt = new Date(certificate.issuedAt).getTime();
  const expired =
    !Number.isFinite(expiresAt) ||
    !Number.isFinite(issuedAt) ||
    expiresAt <= issuedAt ||
    expiresAt <= date.getTime();
  const status =
    certificate.status === "issued"
      ? expired
        ? "expired"
        : issuedAt > date.getTime()
          ? "pending"
          : "issued"
      : certificate.status;
  return {
    id: certificate.id,
    documentNumber: certificate.documentNumber,
    propertyCodeMasked: maskPropertyCode(certificate.propertyCode),
    issuedAt: certificate.issuedAt,
    expiresAt: certificate.expiresAt,
    status,
    valid: status === "issued",
    debtStatus:
      status === "pending" || status === "rejected"
        ? "Arayış verilməyib"
        : certificate.debtCents === 0
          ? "Verilmə tarixində borc yoxdur"
          : "Verilmə tarixində borc mövcuddur",
  };
}
