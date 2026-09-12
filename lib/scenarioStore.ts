import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/slug";
import type { ScenarioInput, StoredScenario } from "@/lib/types";

const localStoreFile = process.env.LOCAL_SCENARIO_STORE_FILE || "scenarios.json";
const localStorePath = path.join(process.cwd(), ".data", path.basename(localStoreFile));

type LocalStore = Record<string, StoredScenario>;

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

async function readLocalStore(): Promise<LocalStore> {
  try {
    const raw = await fs.readFile(localStorePath, "utf8");
    return JSON.parse(raw) as LocalStore;
  } catch {
    return {};
  }
}

async function writeLocalStore(store: LocalStore) {
  await fs.mkdir(path.dirname(localStorePath), { recursive: true });
  await fs.writeFile(localStorePath, JSON.stringify(store, null, 2));
}

export async function saveScenario(input: ScenarioInput) {
  const slug = makeSlug();

  if (hasDatabase()) {
    await prisma.scenario.create({
      data: {
        slug,
        contract_mix: input.contractMix,
        panel_size: input.panelSize,
        diagnosis_distribution: input.diagnoses
      }
    });
    return slug;
  }

  const store = await readLocalStore();
  store[slug] = {
    slug,
    contractMix: input.contractMix,
    panelSize: input.panelSize,
    diagnoses: input.diagnoses,
    createdAt: new Date().toISOString()
  };
  await writeLocalStore(store);
  return slug;
}

export async function getScenario(slug: string): Promise<StoredScenario | null> {
  if (hasDatabase()) {
    const record = await prisma.scenario.update({
      where: { slug },
      data: { view_count: { increment: 1 } }
    }).catch(() => null);

    if (!record) {
      return null;
    }

    return {
      slug: record.slug,
      contractMix: record.contract_mix as StoredScenario["contractMix"],
      panelSize: record.panel_size,
      diagnoses: record.diagnosis_distribution as StoredScenario["diagnoses"],
      createdAt: record.created_at.toISOString()
    };
  }

  const store = await readLocalStore();
  return store[slug] ?? null;
}
