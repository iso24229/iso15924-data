import { rm, mkdir, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { stringify } from 'yaml';

const SOURCE_URL = 'https://www.unicode.org/iso15924/iso15924.txt';
const OUTPUT_DIR = 'codes';
const HEARTBEAT = 'last-checked-date.txt';
const MANIFEST = 'manifest.yaml';

const FIELDS = ['code', 'number', 'nameEn', 'nameFr', 'pva', 'age', 'date'];

function parseLine(line, lineNo) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const parts = trimmed.split(';');
  if (parts.length < FIELDS.length) {
    throw new Error(`line ${lineNo}: expected ${FIELDS.length} fields, got ${parts.length}`);
  }
  const [code, number, nameEn, nameFr, pva, age, date] = parts;
  const num = Number(number);
  if (!Number.isInteger(num)) {
    throw new Error(`line ${lineNo}: invalid numeric code "${number}"`);
  }
  return {
    code: code.trim(),
    number: num,
    name: { en: nameEn.trim(), fr: nameFr.trim() },
    pva: pva.trim() || null,
    age: age.trim() || null,
    dateIntroduced: date.trim() || null,
  };
}

async function main() {
  console.log(`Fetching ${SOURCE_URL}`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const text = await res.text();

  const entries = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const entry = parseLine(line, i + 1);
    if (entry) entries.push(entry);
  });

  if (entries.length === 0) throw new Error('No entries parsed');

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const entry of entries) {
    const path = join(OUTPUT_DIR, `${entry.code}.yaml`);
    await writeFile(path, stringify(entry));
  }

  const manifest = {
    source: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    codeCount: entries.length,
    codes: entries.map((e) => e.code),
  };
  await writeFile(MANIFEST, stringify(manifest));

  const now = new Date().toISOString();
  await writeFile(HEARTBEAT, `${now}\n`);
  console.log(`Wrote ${entries.length} codes to ${OUTPUT_DIR}/`);
  console.log(`Heartbeat updated: ${now}`);
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
