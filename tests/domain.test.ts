import assert from "node:assert/strict";
import test from "node:test";
import { applyAction, DemoError, publicCertificate } from "../src/lib/engine";
import { monthlyCharge } from "../src/lib/format";
import { createSeed } from "../src/lib/seed";

const now = new Date("2026-09-12T09:00:00.000Z");
const paymentCode = "527418936204";

test("seed meets presentation record counts and correct qəpik rounding", () => {
  const state = createSeed();
  assert.deepEqual(
    [
      state.areas.length,
      state.buildings.length,
      state.properties.length,
      state.commercialObjects.length,
      state.users.length,
      state.invoices.length,
      state.payments.length,
      state.auditEvents.length,
    ],
    [10, 30, 100, 15, 12, 50, 60, 20],
  );
  const property = state.properties.find(
    (item) => item.paymentCode === paymentCode,
  )!;
  assert.equal(property.balanceCents, 4104);
  assert.deepEqual(monthlyCharge(property), {
    wasteCents: 280,
    housingCents: 1088,
    totalCents: 1368,
  });
  assert.equal(
    new Set(state.properties.map((item) => item.paymentCode)).size,
    100,
  );
  assert.equal(
    new Set(state.payments.map((item) => item.transactionId)).size,
    60,
  );
  for (const item of state.properties)
    assert.equal(
      item.balanceCents,
      state.invoices
        .filter((invoice) => invoice.propertyId === item.id)
        .reduce(
          (sum, invoice) => sum + invoice.totalCents - invoice.paidCents,
          0,
        ),
    );
});

test("payment and repeated callback apply money once and preserve the original snapshot", () => {
  const original = createSeed();
  const action = {
    type: "pay",
    transactionId: "TEST-PAY-000001",
    propertyCode: paymentCode,
    amountCents: 2000,
  };
  const first = applyAction(original, action, now);
  assert.equal(original.properties[0].balanceCents, 4104);
  assert.equal(first.data.properties[0].balanceCents, 2104);
  assert.equal(first.data.payments.length, 61);
  assert.equal(first.data.invoices[0].status, "paid");
  assert.equal(first.data.invoices[1].paidCents, 632);
  assert.equal(first.data.invoices[1].status, "partial");
  const second = applyAction(
    first.data,
    { ...action, type: "provider_callback" },
    now,
  );
  assert.equal(second.duplicate, true);
  assert.equal(second.payment?.receiptNumber, first.payment?.receiptNumber);
  assert.equal(second.data.properties[0].balanceCents, 2104);
  assert.equal(second.data.payments.length, 61);
  assert.equal(second.data.auditEvents.length, 22);
});

test("conflicting idempotency payload and invalid amounts fail without applying money", () => {
  const action = {
    type: "pay",
    transactionId: "TEST-PAY-000002",
    propertyCode: paymentCode,
    amountCents: 1000,
  };
  const { data } = applyAction(createSeed(), action, now);
  assert.throws(
    () => applyAction(data, { ...action, amountCents: 2000 }, now),
    (error: unknown) => error instanceof DemoError && error.status === 409,
  );
  assert.throws(
    () =>
      applyAction(
        data,
        { ...action, propertyCode: data.properties[1].paymentCode },
        now,
      ),
    (error: unknown) => error instanceof DemoError && error.status === 409,
  );
  for (const amountCents of [0, -1, 12.5, Infinity, 99999999999, 4000])
    assert.throws(
      () =>
        applyAction(
          data,
          { ...action, transactionId: "TEST-NEW-000003", amountCents },
          now,
        ),
      DemoError,
    );
  assert.equal(data.properties[0].balanceCents, 3104);
  assert.equal(data.payments.length, 61);
});

test("monthly generation freezes resident, area and tariff snapshots and avoids double billing", () => {
  const first = applyAction(
    createSeed(),
    { type: "generate_billing", period: "2026-10" },
    now,
  );
  const invoice = first.data.invoices.find(
    (item) => item.propertyCode === paymentCode && item.period === "2026-10",
  )!;
  assert.equal(invoice.totalCents, 1368);
  assert.equal(first.data.properties[0].balanceCents, 5472);
  assert.deepEqual(invoice.snapshot, {
    residents: 4,
    areaSqm: 72.5,
    wasteUnitCents: 70,
    housingUnitCents: 15,
  });
  const edited = structuredClone(first.data);
  edited.properties[0].residents = 8;
  edited.properties[0].areaSqm = 90;
  edited.tariffs[0].amountCents = 100;
  const repeated = applyAction(
    edited,
    { type: "generate_billing", period: "2026-10" },
    now,
  );
  assert.equal(repeated.duplicate, true);
  assert.equal(repeated.data.properties[0].balanceCents, 5472);
  assert.deepEqual(
    repeated.data.invoices.find((item) => item.id === invoice.id),
    invoice,
  );
  const next = applyAction(
    edited,
    { type: "generate_billing", period: "2026-11" },
    now,
  );
  assert.equal(
    next.data.invoices.find(
      (item) => item.propertyCode === paymentCode && item.period === "2026-11",
    )?.totalCents,
    2150,
  );
  assert.equal(
    new Set(
      next.data.invoices.map((item) => `${item.propertyId}/${item.period}`),
    ).size,
    next.data.invoices.length,
  );
});

test("closed/invalid periods and unsupported server actions are rejected", () => {
  const data = createSeed();
  assert.throws(
    () => applyAction(data, { type: "generate_billing", period: "2026-07" }),
    DemoError,
  );
  assert.throws(
    () => applyAction(data, { type: "generate_billing", period: "2026-13" }),
    DemoError,
  );
  assert.throws(
    () => applyAction(data, { type: "generate_billing", period: "2025-12" }),
    DemoError,
  );
  assert.throws(() => applyAction(data, { type: "delete_all" }), DemoError);
  assert.throws(() => applyAction(data, null), DemoError);
  assert.throws(
    () =>
      applyAction(data, {
        type: "support",
        name: "Demo",
        email: "bad-email",
        subject: "Yoxlama",
        message: "Bu demo müraciətdir.",
      }),
    DemoError,
  );
});

test("SMS demo validates OTP; public certificate response omits full code/address and enforces expiry", () => {
  const data = createSeed();
  const action = {
    type: "issue_certificate",
    propertyCode: paymentCode,
    method: "sms",
    otp: "000000",
  };
  assert.throws(() => applyAction(data, action, now), DemoError);
  assert.throws(
    () => applyAction(data, { ...action, method: "anything" }, now),
    DemoError,
  );
  const result = applyAction(data, { ...action, otp: "123456" }, now);
  const certificate = result.certificate!;
  const publicData = publicCertificate(certificate, now);
  assert.equal(publicData.valid, true);
  assert.equal(publicData.propertyCodeMasked, "527••••••204");
  assert.equal("address" in publicData, false);
  assert.equal("propertyCode" in publicData, false);
  assert.equal("debtCents" in publicData, false);
  assert.equal(JSON.stringify(publicData).includes(paymentCode), false);
  const expired = publicCertificate(
    certificate,
    new Date("2026-10-13T00:00:00.000Z"),
  );
  assert.equal(expired.status, "expired");
  assert.equal(expired.valid, false);
});

test("reconciliation provides four outcomes; manual review records a reason without changing ledger money", () => {
  const imported = applyAction(
    createSeed(),
    { type: "import_reconciliation" },
    now,
  );
  assert.deepEqual(
    new Set(imported.data.reconciliationRows.map((row) => row.status)),
    new Set(["matched", "mismatch", "missing", "duplicate"]),
  );
  const row = imported.data.reconciliationRows.find(
    (item) => item.status === "mismatch",
  )!;
  const reviewed = applyAction(
    imported.data,
    {
      type: "review_reconciliation",
      rowId: row.id,
      resolution: "Provayderdən dəqiqləşdirmə gözlənilir.",
    },
    now,
  );
  assert.equal(
    reviewed.data.reconciliationRows.find((item) => item.id === row.id)
      ?.reviewed,
    true,
  );
  assert.deepEqual(reviewed.data.payments, imported.data.payments);
  assert.equal(
    reviewed.data.auditEvents.length,
    imported.data.auditEvents.length + 1,
  );
});

test("certificate approval snapshots the balance at approval, including intervening payments", () => {
  const state = createSeed();
  const certificate = state.certificates.find(
    (item) => item.status === "pending" && item.debtCents > 0,
  )!;
  const paid = applyAction(
    state,
    {
      type: "pay",
      propertyCode: certificate.propertyCode,
      amountCents: certificate.debtCents,
      transactionId: "TEST-CERTIFICATE-DEBT-001",
    },
    now,
  );
  const issued = applyAction(
    paid.data,
    {
      type: "review_certificate",
      certificateId: certificate.id,
      status: "issued",
    },
    now,
  );
  assert.equal(issued.certificate?.debtCents, 0);
  assert.equal(
    publicCertificate(issued.certificate!, now).debtStatus,
    "Verilmə tarixində borc yoxdur",
  );
});

test("resident and area edits keep historic snapshots, balances and property codes intact", () => {
  const original = createSeed();
  const saved = applyAction(
    original,
    {
      type: "save_property",
      propertyId: original.properties[0].id,
      residents: 0,
      areaSqm: 80.15,
      reason: "Qeydiyyat və çıxarış dəqiqləşdirildi.",
    },
    now,
  );
  assert.equal(saved.data.properties[0].residents, 0);
  assert.equal(saved.data.properties[0].areaSqm, 80.15);
  assert.equal(saved.data.properties[0].balanceCents, 4104);
  assert.equal(saved.data.properties[0].paymentCode, paymentCode);
  assert.deepEqual(saved.data.invoices, original.invoices);
  assert.deepEqual(saved.data.payments, original.payments);
  assert.equal(saved.data.auditEvents.length, original.auditEvents.length + 1);
  assert.equal(original.properties[0].residents, 4);
  const billed = applyAction(
    saved.data,
    { type: "generate_billing", period: "2026-10" },
    now,
  );
  const invoice = billed.data.invoices.find(
    (item) => item.propertyCode === paymentCode && item.period === "2026-10",
  )!;
  assert.equal(invoice.totalCents, 1202);
  assert.equal(invoice.snapshot.areaSqm, 80.15);
  for (const override of [
    { residents: -1 },
    { residents: 1.5 },
    { areaSqm: 72.501 },
    { areaSqm: Infinity },
    { reason: "" },
    { propertyId: "missing" },
  ]) {
    assert.throws(
      () =>
        applyAction(
          original,
          {
            type: "save_property",
            propertyId: original.properties[0].id,
            residents: 4,
            areaSqm: 72.5,
            reason: "Yoxlama qeydi",
            ...override,
          },
          now,
        ),
      DemoError,
    );
  }
});

test("commercial tariff change requires approval and rejects invalid currency or calendar dates", () => {
  const original = createSeed();
  const commercial = original.commercialObjects[0];
  const tariffId = original.tariffs.find(
    (item) => item.commercialObjectId === commercial.id,
  )!.id;
  const action = {
    type: "save_commercial_tariff",
    commercialObjectId: commercial.id,
    amountCents: 8500,
    effectiveDate: "2026-10-01",
    reason: "Xidmət həcmi üzrə yenidən baxış.",
  };
  const submitted = applyAction(original, action, now);
  const pending = submitted.data.tariffs.find((item) => item.id === tariffId)!;
  assert.equal(pending.amountCents, 8500);
  assert.equal(pending.status, "pending");
  assert.equal(pending.approvedBy, null);
  assert.equal(
    submitted.data.commercialObjects[0].tariffCents,
    commercial.tariffCents,
  );
  const approved = applyAction(
    submitted.data,
    { type: "approve_tariff", tariffId, status: "approved" },
    now,
  );
  assert.equal(approved.data.commercialObjects[0].tariffCents, 8500);
  assert.equal(approved.data.commercialObjects[0].approvalStatus, "approved");
  assert.deepEqual(approved.data.invoices, original.invoices);
  for (const override of [
    { amountCents: 0 },
    { amountCents: 8500.1 },
    { effectiveDate: "2026-02-30" },
    { effectiveDate: "2026-13-01" },
    { effectiveDate: "2026-9-1" },
    { reason: "" },
    { commercialObjectId: "missing" },
  ])
    assert.throws(
      () => applyAction(original, { ...action, ...override }, now),
      DemoError,
    );
});

test("idempotency rejects failed or pending transaction reuse and conflicting provider identity", () => {
  const original = createSeed();
  for (const payment of original.payments.filter(
    (item) => item.status !== "success",
  ))
    assert.throws(
      () =>
        applyAction(
          original,
          {
            type: "provider_callback",
            transactionId: payment.transactionId,
            propertyCode: payment.propertyCode,
            amountCents: payment.amountCents,
          },
          now,
        ),
      (error: unknown) => error instanceof DemoError && error.status === 409,
    );
  const action = {
    type: "pay",
    transactionId: "TEST-PROVIDER-IDENTITY-001",
    propertyCode: paymentCode,
    amountCents: 4104,
    provider: "DemoPay",
  };
  const paid = applyAction(original, action, now);
  assert.equal(paid.data.properties[0].balanceCents, 0);
  assert.equal(applyAction(paid.data, action, now).duplicate, true);
  assert.throws(
    () => applyAction(paid.data, { ...action, provider: "Another Demo" }, now),
    (error: unknown) => error instanceof DemoError && error.status === 409,
  );
  assert.throws(
    () =>
      applyAction(
        paid.data,
        { ...action, transactionId: "TEST-EXCESS-001", amountCents: 1 },
        now,
      ),
    DemoError,
  );
  const inconsistent = structuredClone(original);
  inconsistent.properties[0].balanceCents += 1;
  assert.throws(
    () => applyAction(inconsistent, action, now),
    (error: unknown) => error instanceof DemoError && error.status === 409,
  );
});

test("certificate verification rejects pending/rejected, invalid dates and the exact expiry instant", () => {
  const issued = applyAction(
    createSeed(),
    { type: "issue_certificate", propertyCode: paymentCode, method: "sima" },
    now,
  ).certificate!;
  assert.equal(
    publicCertificate(issued, new Date(issued.expiresAt)).valid,
    false,
  );
  assert.equal(
    publicCertificate(
      issued,
      new Date(new Date(issued.expiresAt).getTime() - 1),
    ).valid,
    true,
  );
  assert.equal(
    publicCertificate({ ...issued, expiresAt: "invalid" }, now).valid,
    false,
  );
  assert.equal(
    publicCertificate({ ...issued, issuedAt: "invalid" }, now).valid,
    false,
  );
  assert.equal(
    publicCertificate({ ...issued, issuedAt: "2026-09-13T09:00:00.000Z" }, now)
      .valid,
    false,
  );
  for (const status of ["pending", "rejected", "expired"] as const)
    assert.equal(publicCertificate({ ...issued, status }, now).valid, false);
  assert.throws(
    () =>
      applyAction(
        createSeed(),
        {
          type: "review_certificate",
          certificateId: "cert-demo-001",
          status: "issued",
        },
        now,
      ),
    (error: unknown) => error instanceof DemoError && error.status === 409,
  );
});

test("billing rejects unsafe persisted calculation inputs atomically", () => {
  const original = createSeed();
  original.properties[1].areaSqm = 1.001;
  const before = structuredClone(original);
  assert.throws(
    () =>
      applyAction(
        original,
        { type: "generate_billing", period: "2026-10" },
        now,
      ),
    DemoError,
  );
  assert.deepEqual(original, before);
});
