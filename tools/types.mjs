// Locks and unlocks the Types of Christ answers in types.html. The page holds them only encrypted
// (AES-GCM, key from PBKDF2-SHA-256 of the lower-cased password), so this public repo never shows
// them. The readable copy, types.src.html, is gitignored.
//   TYPES_PASSWORD=… node tools/types.mjs decrypt   types.html → types.src.html, to edit
//   TYPES_PASSWORD=… node tools/types.mjs encrypt   types.src.html → types.html, to commit
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const PAGE = join(ROOT, 'types.html')
const SOURCE = join(ROOT, 'types.src.html')
const ITERATIONS = 250_000
const BLOB = /(<script type="application\/json" id="locked">\n)([\s\S]*?)(\n<\/script>)/

const password = (process.env.TYPES_PASSWORD ?? '').trim().toLowerCase()
if (!password) throw new Error('Set TYPES_PASSWORD (ask Sam).')
const b64 = bytes => Buffer.from(bytes).toString('base64')
const unb64 = s => new Uint8Array(Buffer.from(s, 'base64'))

async function keyFor(salt, usage) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, [usage])
}

const page = readFileSync(PAGE, 'utf8')
if (!BLOB.test(page)) throw new Error('No locked block in types.html')

if (process.argv[2] === 'encrypt') {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFor(salt, 'encrypt'), new TextEncoder().encode(readFileSync(SOURCE, 'utf8')))
  const blob = JSON.stringify({ v: 1, iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(new Uint8Array(data)) })
  writeFileSync(PAGE, page.replace(BLOB, `$1${blob}$3`))
  console.log('types.html locked')
}
else if (process.argv[2] === 'decrypt') {
  const locked = JSON.parse(page.match(BLOB)[2])
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(locked.iv) }, await keyFor(unb64(locked.salt), 'decrypt'), unb64(locked.data))
  writeFileSync(SOURCE, new TextDecoder().decode(plain))
  console.log('types.src.html written')
}
else {
  console.log('Usage: TYPES_PASSWORD=… node tools/types.mjs encrypt|decrypt')
}
