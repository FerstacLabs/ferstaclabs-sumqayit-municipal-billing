import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDate,
  formatMoney,
  monthlyCharge,
  parseMoneyInput,
} from "../src/lib/format";

test("AZN formatting stays Azerbaijani when the runtime cannot load Azerbaijani number locales", (context) => {
  context.mock.method(Intl, "NumberFormat", () => {
    throw new Error("Azerbaijani ICU number data unavailable");
  });
  assert.equal(formatMoney(4104), "41,04 ₼");
  assert.equal(formatMoney(70), "0,70 ₼");
  assert.equal(formatMoney(0), "0,00 ₼");
  assert.equal(formatMoney(100500000), "1 005 000,00 ₼");
  assert.equal(formatMoney(-105), "−1,05 ₼");
  assert.equal(formatMoney(Number.MAX_SAFE_INTEGER), "90 071 992 547 409,91 ₼");
  assert.throws(() => formatMoney(0.5), RangeError);
});

test("dates have deterministic Azerbaijani order and use the Baku calendar day", () => {
  assert.equal(formatDate("2026-09-12"), "12.09.2026");
  assert.equal(formatDate("2026-09-11T21:30:00.000Z"), "12.09.2026");
  assert.equal(formatDate("2026-12-31T22:00:00.000Z"), "01.01.2027");
});

test("currency input parses decimal text into exact qəpik without binary multiplication", () => {
  assert.equal(parseMoneyInput("1.15"), 115);
  assert.equal(parseMoneyInput(" 13,68 "), 1368);
  assert.equal(parseMoneyInput("0.01"), 1);
  assert.equal(parseMoneyInput("22"), 2200);
  assert.equal(parseMoneyInput("90 071 992".replaceAll(" ", "")), 9007199200);
  assert.equal(parseMoneyInput("90071992547409.91"), Number.MAX_SAFE_INTEGER);
  for (const invalid of [
    "",
    " ",
    "-1",
    "+1",
    "1.001",
    "1,2.3",
    "Infinity",
    "1e3",
    "90071992547409.92",
  ])
    assert.throws(() => parseMoneyInput(invalid), RangeError);
});

test("decimal area billing uses half-up rounding and safely sums invoice lines", () => {
  assert.deepEqual(monthlyCharge({ residents: 0, areaSqm: 1.15 }, 70, 70), {
    wasteCents: 0,
    housingCents: 81,
    totalCents: 81,
  });
  assert.deepEqual(monthlyCharge({ residents: 3, areaSqm: 10.01 }, 70, 15), {
    wasteCents: 210,
    housingCents: 150,
    totalCents: 360,
  });
  assert.equal(
    monthlyCharge({ residents: 1, areaSqm: 0.01 }, 1, 50).housingCents,
    1,
  );
  assert.equal(
    monthlyCharge({ residents: 1, areaSqm: 0.01 }, 1, 49).housingCents,
    0,
  );
  for (const areaSqm of [0, -1, NaN, Infinity, 1.001])
    assert.throws(() => monthlyCharge({ residents: 1, areaSqm }), RangeError);
  for (const residents of [-1, 0.5, NaN, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => monthlyCharge({ residents, areaSqm: 1 }), RangeError);
  for (const rate of [0, -1, 0.5, NaN, Infinity])
    assert.throws(
      () => monthlyCharge({ residents: 1, areaSqm: 1 }, rate, 15),
      RangeError,
    );
  assert.throws(
    () =>
      monthlyCharge({ residents: Number.MAX_SAFE_INTEGER, areaSqm: 1 }, 1, 1),
    RangeError,
  );
});
