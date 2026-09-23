// ---------------------------------------------------------------------------
// Block fields must round-trip through BOTH ends of persistence
// ---------------------------------------------------------------------------
// `serializeProject()` writes a block to JSON and `loadProject()` reads it back. The loader's
// block literal is an explicit allowlist: a field it does not name is dropped on load, silently,
// with the value sitting correctly in the file the whole time.
//
// That has now happened twice. `lineSpacing` was serialized from v2.3.19 and never read back, so
// block line spacing reverted on every reload (known-issues § 21). One commit after documenting
// that trap, `packAuthorId` was added to the type and to `canRearrange()` and to neither end of
// persistence — which would have made the v2.5.1 author check permanently false.
//
// Like the syncContent guard in formula_rows_test.ts, the field list is read off the interface
// rather than written out here. A hand-maintained list stops covering the newest field, which is
// the one most likely to be missed.

import { assertEquals, assertMatch } from '@std/assert';

/** Fields deliberately not persisted, each with the reason it is exempt. */
const NOT_PERSISTED: Record<string, string> = {
  // Derived on write from the presence of packId + encIv + encContent, never trusted from the
  // block itself — that is the encryption invariant. See cmem/security-model.md.
  encrypted: 'derived by the serializer; trusting the in-memory flag would leak plaintext',
};

Deno.test('every Block field round-trips through persistence', async () => {
  const typesSrc = await Deno.readTextFile(new URL('../src/types.ts', import.meta.url));
  const start = typesSrc.indexOf('export interface Block {');
  const iface = typesSrc.slice(start, typesSrc.indexOf('\n}', start));

  // Two-space indent only, so the union members of `type` are not mistaken for fields.
  const fields = [...iface.matchAll(/^ {2}(\w+)\??:/gm)].map((m) => m[1]);
  assertEquals(
    fields.length > 10,
    true,
    `Block fields were not found — has the interface changed shape? Got: ${fields.join(', ')}`,
  );

  const src = await Deno.readTextFile(new URL('../src/persistence.ts', import.meta.url));
  // Comments stripped: a comment merely naming a field must not satisfy the guard.
  const code = src.replace(/\/\/.*$/gm, '');

  const loader = code.slice(code.indexOf('const block: Block = {'));
  const loadBody = loader.slice(0, loader.indexOf('\n    };'));
  const ser = code.slice(code.indexOf('export function serializeProject()'));
  const serBody = ser.slice(0, ser.indexOf('\n  const out:'));

  for (const field of fields) {
    if (field in NOT_PERSISTED) continue;
    assertMatch(
      loadBody,
      // `field:` or the shorthand `field,` — `type` is computed above and passed shorthand.
      new RegExp(`\\b${field}\\s*[:,]`),
      `loadProject() never reads Block.${field} — it is dropped on load, silently, however ` +
        `correctly the serializer wrote it. This is known-issues § 21.`,
    );
    // Either form counts: assigned onto `out` later, or present in the initial object literal
    // (`{ id: b.id, type: b.type, … }`), which is how the always-written fields are emitted.
    assertMatch(
      serBody,
      new RegExp(`out\\.${field}\\s*=|\\b${field}:\\s*b\\.${field}\\b`),
      `serializeProject() never writes Block.${field} — it is lost on save.`,
    );
  }
});
