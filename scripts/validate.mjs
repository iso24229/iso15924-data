#!/usr/bin/env node
/**
 * Validates every YAML entry in codes/ against schema/entry.schema.yaml.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';

const ajv = new Ajv2020({ allErrors: true, strict: false });

async function loadSchema() {
  const text = await readFile('schema/entry.schema.yaml', 'utf-8');
  return ajv.compile(parse(text));
}

async function main() {
  const validate = await loadSchema();
  const dir = 'codes';
  let failures = 0;
  let checked = 0;

  const entries = await readdir(dir);
  for (const f of entries) {
    if (!f.endsWith('.yaml') && !f.endsWith('.yml')) continue;
    const file = join(dir, f);
    const data = parse(await readFile(file, 'utf-8'));
    if (!validate(data)) {
      failures++;
      console.error(`✗ ${file}`);
      for (const err of validate.errors ?? []) {
        console.error(`    ${err.instancePath || '<root>'}: ${err.message}`);
      }
      continue;
    }
    checked++;
  }
  console.log(`Checked ${checked} entries, ${failures} failure(s).`);
  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
