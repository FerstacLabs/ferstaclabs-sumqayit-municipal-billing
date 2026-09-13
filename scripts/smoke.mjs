import assert from "node:assert/strict";

const base = process.argv[2] || "http://127.0.0.1:3000";
const publicRoutes = [
  "/",
  "/services",
  "/tariffs",
  "/payment",
  "/certificate",
  "/verify",
  "/news",
  "/contact",
];
const adminSections = [
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
const routes = [
  ...publicRoutes,
  ...adminSections.map((section) => `/admin/${section}`),
];

for (const route of routes) {
  const response = await fetch(`${base}${route}`);
  assert.equal(response.status, 200, `${route} must load`);
  const html = await response.text();
  assert.ok(html.includes('lang="az"'), `${route} must use Azerbaijani`);
}

const redirect = await fetch(`${base}/admin`, { redirect: "manual" });
assert.ok([307, 308].includes(redirect.status));
assert.ok(redirect.headers.get("location")?.endsWith("/admin/dashboard"));
for (const route of [
  "/unknown-demo-page",
  "/admin/unknown-section",
  "/api/certificates/unknown-certificate",
]) {
  assert.equal(
    (await fetch(`${base}${route}`)).status,
    404,
    `${route} must return 404`,
  );
}

const stateResponse = await fetch(`${base}/api/demo`);
assert.equal(stateResponse.status, 200);
const state = await stateResponse.json();
assert.equal(state.properties.length, 100);
const certificate = state.certificates.find((item) => item.status === "issued");
assert.ok(certificate);
const verificationResponse = await fetch(
  `${base}/api/certificates/${certificate.id}`,
);
assert.equal(verificationResponse.status, 200);
const verification = await verificationResponse.json();
assert.ok(verification.propertyCodeMasked.includes("••••••"));
for (const privateKey of [
  "propertyCode",
  "address",
  "ownerMasked",
  "debtCents",
])
  assert.equal(privateKey in verification, false);
console.log(
  `PASS: ${routes.length} pages, admin redirect, 3 not-found responses, demo API and masked certificate verification.`,
);
