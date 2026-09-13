import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createDemoStore, getDemoStore } from "../src/lib/store";
import { DemoError } from "../src/lib/engine";

async function removeTestDirectory(directory: string) {
  const target = path.resolve(directory);
  assert.equal(path.dirname(target), path.resolve(os.tmpdir()));
  assert.ok(path.basename(target).startsWith("municipal-demo-"));
  await rm(target, { recursive: true, force: true });
}

test("concurrent duplicate requests serialize and survive reopening the persistent store", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "municipal-demo-test-"),
  );
  try {
    const store = createDemoStore(directory);
    await store.read();
    const action = {
      type: "pay",
      transactionId: "TEST-CONCURRENT-001",
      propertyCode: "527418936204",
      amountCents: 1368,
    };
    const results = await Promise.all([
      store.mutate(action),
      store.mutate(action),
    ]);
    assert.equal(
      results.filter((result) => result.duplicate === false).length,
      1,
    );
    assert.equal(
      results.filter((result) => result.duplicate === true).length,
      1,
    );
    const reopened = await createDemoStore(directory).read();
    assert.equal(reopened.properties[0].balanceCents, 2736);
    assert.equal(reopened.payments.length, 61);
    assert.equal(
      reopened.payments.filter(
        (payment) => payment.transactionId === action.transactionId,
      ).length,
      1,
    );
    await assert.rejects(store.mutate({ ...action, amountCents: 1400 }));
    // A rejected operation cannot poison the write queue.
    await store.mutate({
      ...action,
      transactionId: "TEST-AFTER-FAILURE-001",
      amountCents: 100,
    });
    assert.equal((await store.read()).properties[0].balanceCents, 2636);
  } finally {
    await removeTestDirectory(directory);
  }
});

test("a corrupt data file is reported and never silently replaced with seed data", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "municipal-demo-corrupt-test-"),
  );
  try {
    const filename = path.join(directory, "data.json");
    await writeFile(filename, "{broken", "utf8");
    await assert.rejects(createDemoStore(directory).read());
    assert.equal(await readFile(filename, "utf8"), "{broken");
  } finally {
    await removeTestDirectory(directory);
  }
});

test("fresh runtime store closures share the write queue and retain current validation errors", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "municipal-demo-runtime-test-"),
  );
  const previousDirectory = process.env.DEMO_DATA_DIR;
  process.env.DEMO_DATA_DIR = directory;
  try {
    const first = getDemoStore();
    const second = getDemoStore();
    assert.notEqual(
      first,
      second,
      "Hot reload must not reuse a closure capturing the previous reducer",
    );
    const action = {
      type: "pay",
      transactionId: "TEST-RUNTIME-001",
      propertyCode: "527418936204",
      amountCents: 1368,
    };
    const results = await Promise.all([
      first.mutate(action),
      second.mutate(action),
    ]);
    assert.equal(results.filter((result) => result.duplicate).length, 1);
    await assert.rejects(
      getDemoStore().mutate({
        type: "issue_certificate",
        propertyCode: action.propertyCode,
        method: "sms",
        otp: "000000",
      }),
      (error: unknown) => error instanceof DemoError && error.status === 400,
    );
    assert.equal(
      (await getDemoStore().read()).properties[0].balanceCents,
      2736,
    );
  } finally {
    if (previousDirectory === undefined) delete process.env.DEMO_DATA_DIR;
    else process.env.DEMO_DATA_DIR = previousDirectory;
    await removeTestDirectory(directory);
  }
});

test("an incomplete version-one store is rejected without overwriting the existing file", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "municipal-demo-incomplete-test-"),
  );
  try {
    const filename = path.join(directory, "data.json");
    const content = JSON.stringify({
      version: 1,
      properties: [],
      payments: [],
      auditEvents: [],
    });
    await writeFile(filename, content, "utf8");
    await assert.rejects(
      createDemoStore(directory).mutate({
        type: "generate_billing",
        period: "2026-10",
      }),
      /unsupported format/,
    );
    assert.equal(await readFile(filename, "utf8"), content);
  } finally {
    await removeTestDirectory(directory);
  }
});
