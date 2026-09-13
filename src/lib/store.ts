import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { applyAction } from "./engine";
import { createSeed } from "./seed";
import type { ActionResult, DemoState } from "./types";

/** Single-process demo persistence. Replace this adapter with PostgreSQL transactions in .NET. */
export function createDemoStore(
  directory: string,
  queue: { pending: Promise<unknown> } = { pending: Promise.resolve() },
) {
  const filename = path.join(
    /* turbopackIgnore: true */ directory,
    "data.json",
  );

  function serialized<T>(operation: () => Promise<T>): Promise<T> {
    const result = queue.pending.then(operation, operation);
    queue.pending = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async function save(state: DemoState): Promise<void> {
    await mkdir(directory, { recursive: true });
    const temporary = path.join(
      /* turbopackIgnore: true */ directory,
      `data.${randomUUID()}.tmp`,
    );
    try {
      await writeFile(temporary, JSON.stringify(state, null, 2), {
        encoding: "utf8",
        mode: 0o600,
      });
      await rename(temporary, filename);
    } catch (error) {
      await unlink(temporary).catch(() => undefined);
      throw error;
    }
  }

  async function load(): Promise<DemoState> {
    try {
      const data = JSON.parse(
        await readFile(/* turbopackIgnore: true */ filename, "utf8"),
      ) as DemoState;
      const collections: (keyof DemoState)[] = [
        "areas",
        "buildings",
        "properties",
        "commercialObjects",
        "users",
        "tariffs",
        "invoices",
        "payments",
        "auditEvents",
        "certificates",
        "billingPeriods",
        "reconciliationRows",
        "supportMessages",
      ];
      if (
        !data ||
        data.version !== 1 ||
        collections.some((key) => !Array.isArray(data[key]))
      )
        throw new Error(
          "Demo data file has an unsupported format. Back it up before resetting.",
        );
      return data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const state = createSeed();
      await save(state);
      return state;
    }
  }

  return {
    read: () => serialized(load),
    mutate: (action: unknown): Promise<ActionResult> =>
      serialized(async () => {
        const previous = await load();
        const result = applyAction(previous, action);
        await save(result.data);
        return result;
      }),
  };
}

type DemoStore = ReturnType<typeof createDemoStore>;
const globalStore = globalThis as typeof globalThis & {
  municipalDemoQueues?: Map<string, { pending: Promise<unknown> }>;
};

export function getDemoStore(): DemoStore {
  // Only retain coordination across hot reloads; store closures must use the current reducer and error class.
  globalStore.municipalDemoQueues ??= new Map();
  // Like Next.js's own runtime storage paths, this mutable directory must not be traced into the build.
  const directory = path.resolve(
    /* turbopackIgnore: true */ process.env.DEMO_DATA_DIR || ".demo",
  );
  let queue = globalStore.municipalDemoQueues.get(directory);
  if (!queue) {
    queue = { pending: Promise.resolve() };
    globalStore.municipalDemoQueues.set(directory, queue);
  }
  return createDemoStore(directory, queue);
}
