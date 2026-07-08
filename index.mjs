// Entry point for @iso24229/iso15924-data.
//
// Loads every script entry from codes/ into memory on first access.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const scripts = {};
for (const name of readdirSync(join(__dirname, 'codes'))) {
  if (!name.endsWith('.yaml')) continue;
  const code = name.slice(0, -'.yaml'.length);
  scripts[code] = parse(readFileSync(join(__dirname, 'codes', name), 'utf8'));
}

export const codes = scripts;
export const manifest = parse(readFileSync(join(__dirname, 'manifest.yaml'), 'utf8'));
export const version = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8')).version;
