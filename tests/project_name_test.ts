// ---------------------------------------------------------------------------
// What a loaded project is called
// ---------------------------------------------------------------------------
// This field has now been wrong twice, in two different ways, and both times the symptom was a
// FILENAME — the last place anyone looks for a persistence bug.
//
//  1. v2.8.11 and earlier: `serializeProject()` wrote `project_metadata.name` and `loadProject()`
//     threw it away. Nothing could set it either, so it was the placeholder forever.
//  2. v2.9.2 and earlier: reading it back was not enough. **Every file saved before the fix
//     contains the placeholder as its stored name**, because there had never been a way to put
//     anything else there — so restoring it faithfully still produced "Untitled Project"
//     (known-issues § 25, reopened 2026-10-06).
//
// The decision needs no DOM even though applying it does, so it lives in `resolveProjectName`
// and is pinned here — the same split `page_geometry_test.ts` uses.

import { assertEquals } from '@std/assert';
import { DEFAULT_PROJECT_NAME, nameFromFileName, resolveProjectName } from '../src/types.ts';

Deno.test('nameFromFileName', async (t) => {
  await t.step('drops the extension', () => {
    assertEquals(nameFromFileName('Beam_Check.leptonpad'), 'Beam_Check');
    assertEquals(nameFromFileName('Beam_Check.json'), 'Beam_Check');
  });

  await t.step('drops only the LAST extension', () => {
    // A version in the name is common and is part of the name, not a second extension.
    assertEquals(nameFromFileName('Pier.v2.leptonpad'), 'Pier.v2');
  });

  await t.step('a name with no extension is left alone', () => {
    assertEquals(nameFromFileName('Beam Check'), 'Beam Check');
  });
});

Deno.test('resolveProjectName', async (t) => {
  await t.step('a real stored name wins — it keeps spaces and capitals', () => {
    // `saveProject` strips those out of the filename (`[^\w-]` → `_`), so the stored name is the
    // better copy whenever there is one.
    assertEquals(
      resolveProjectName('W21x44 Beam Check', 'W21x44_Beam_Check.leptonpad'),
      'W21x44 Beam Check',
    );
  });

  await t.step('🔑 the PLACEHOLDER is not a name — the file wins instead', () => {
    // The whole of bug 2. Every pre-v2.9.2 file carries exactly this string.
    assertEquals(
      resolveProjectName(DEFAULT_PROJECT_NAME, 'Pier_Footing.leptonpad'),
      'Pier_Footing',
    );
  });

  await t.step('an empty or whitespace stored name also defers to the file', () => {
    assertEquals(resolveProjectName('', 'Slab.leptonpad'), 'Slab');
    assertEquals(resolveProjectName('   ', 'Slab.leptonpad'), 'Slab');
  });

  await t.step('with neither, the placeholder stands', () => {
    // The library and the autosave slot load without a filename; their metadata is authoritative.
    assertEquals(resolveProjectName('', undefined), DEFAULT_PROJECT_NAME);
    assertEquals(resolveProjectName(DEFAULT_PROJECT_NAME, undefined), DEFAULT_PROJECT_NAME);
    // A file called nothing but an extension cannot supply a name either.
    assertEquals(resolveProjectName('', '.leptonpad'), DEFAULT_PROJECT_NAME);
  });

  await t.step('a stored name is trimmed, not taken raw', () => {
    assertEquals(resolveProjectName('  Deck Design  ', 'x.leptonpad'), 'Deck Design');
  });
});
