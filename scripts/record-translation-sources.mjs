import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { normalise } from '../src/i18n/html.mjs';

// This records a completed bilingual review, not an automatic semantic check.
// Normal maintenance must name the reviewed IDs; bulk re-approval is not offered.
function main(args) {
  let directory = path.resolve(import.meta.dirname, '../src/i18n');
  let initial = false;
  const ids = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--directory') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error('--directory requires a catalogue directory.');
      directory = path.resolve(args[++index]);
    } else if (arg === '--initial') {
      if (initial) throw new Error('Specify --initial only once.');
      initial = true;
    } else if (/^t\d+$/.test(arg)) {
      ids.push(arg);
    } else {
      throw new Error(`Unsupported argument: ${arg}. Name individual reviewed IDs; there is no --all option.`);
    }
  }
  if ((initial && ids.length) || (!initial && !ids.length)) throw new Error('Use --initial once for the complete reviewed catalogue, or name explicit reviewed IDs: node scripts/record-translation-sources.mjs tNNNN [tNNNN ...].');
  if (new Set(ids).size !== ids.length) throw new Error('Each reviewed ID must appear only once.');

  const lockPath = path.join(directory, 'source-lock.json');
  if (initial && fs.existsSync(lockPath)) throw new Error('source-lock.json already exists. --initial cannot overwrite it; review and name individual IDs instead.');
  if (!initial && !fs.existsSync(lockPath)) throw new Error('source-lock.json is missing. Restore the existing lock; use --initial only for the first complete reviewed catalogue.');
  const source = JSON.parse(fs.readFileSync(path.join(directory, 'en.json'), 'utf8'));
  const chinese = {};
  for (const file of fs.readdirSync(directory).filter(file => /^zh-.*\.json$/.test(file))) {
    for (const [id, text] of Object.entries(JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')))) {
      if (Object.hasOwn(chinese, id)) throw new Error(`Duplicate Chinese translation: ${id}`);
      if (!Object.hasOwn(source, id)) throw new Error(`Unknown translation ID: ${id}`);
      if (typeof text !== 'string' || !text.trim()) throw new Error(`Empty Chinese translation: ${id}`);
      chinese[id] = text;
    }
  }
  const lock = initial ? {} : JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  if (!lock || Array.isArray(lock) || typeof lock !== 'object') throw new Error('Invalid source-lock.json: expected an ID-to-SHA256 object.');
  for (const [id, hash] of Object.entries(lock)) {
    if (!Object.hasOwn(source, id) || typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) throw new Error(`Invalid translation source binding: ${id}`);
  }
  const selected = initial ? Object.keys(source) : ids;
  if (!selected.length) throw new Error('Cannot record an empty catalogue.');
  for (const id of selected) {
    if (!Object.hasOwn(source, id)) throw new Error(`Unknown source ID: ${id}`);
    if (typeof source[id] !== 'string' || !source[id].trim()) throw new Error(`Empty English source: ${id}`);
    if (!Object.hasOwn(chinese, id)) throw new Error(`Missing Chinese translation: ${id}`);
    lock[id] = createHash('sha256').update(normalise(source[id])).digest('hex');
  }
  // Validate the entire request before writing; never partially approve an ID list.
  const ordered = Object.fromEntries(Object.entries(lock).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })));
  fs.writeFileSync(lockPath, JSON.stringify(ordered, null, 2) + '\n', { flag: initial ? 'wx' : 'w' });
  console.log(`Recorded ${selected.length} reviewed English/Chinese source bindings in ${lockPath}.`);
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
