import { neon } from 'jsr:@neon/serverless@^1';
const sql = neon(Deno.env.get('DATABASE_URL')!);
const U = 'user_TESTFAKE0001', V = 'user_TESTFAKE0002', PACK = 'zz-test-pack';
const pass = (b: boolean) => b ? 'PASS' : '*** FAIL ***';

try {
  await sql`select create_section_pack(${PACK}, 'Test Pack', 'temporary')`;

  const r0 = (await sql`select get_my_role(${U}) as d`)[0].d;
  console.log(
    'unknown user → free           :',
    pass(r0.role === 'free' && r0.pack_ids.length === 0),
  );

  const k0 = (await sql`select get_pack_key(${U}, ${PACK}) as k`)[0].k;
  console.log('non-owner gets NO key         :', pass(k0 === null));

  const code =
    (await sql`select * from mint_license_codes(1, null, ${PACK}, 365)`)[0].mint_license_codes;
  console.log(
    'code format XXXX-XXXX-XXXX-XX :',
    pass(/^[0-9A-F]{4}(-[0-9A-F]{4}){3}$/.test(code)),
    code,
  );

  const red = (await sql`select redeem_license_code(${U}, ${code}) as d`)[0].d;
  console.log('redeem succeeds               :', pass(red.success === true));

  const red2 = (await sql`select redeem_license_code(${V}, ${code}) as d`)[0].d;
  console.log('same code cannot be reused    :', pass(red2.success === false));

  const r1 = (await sql`select get_my_role(${U}) as d`)[0].d;
  console.log('owner now lists the pack      :', pass(r1.pack_ids.includes(PACK)));

  const k1 = (await sql`select get_pack_key(${U}, ${PACK}) as k`)[0].k;
  const bytes = k1 ? atob(k1).length : 0;
  console.log('owner gets 32-byte key        :', pass(bytes === 32), `(${bytes} bytes)`);

  const k1b = (await sql`select get_pack_key(${U}, ${PACK}) as k`)[0].k;
  console.log('key is deterministic          :', pass(k1 === k1b));

  const k2 = (await sql`select get_pack_key(${V}, ${PACK}) as k`)[0].k;
  console.log('different user → different key:', pass(k2 === null || k2 !== k1));

  await sql`insert into user_roles (user_id, role) values (${V}, 'super') on conflict (user_id) do update set role='super'`;
  const k3 = (await sql`select get_pack_key(${V}, ${PACK}) as k`)[0].k;
  console.log('super bypasses ownership      :', pass(k3 !== null && k3 !== k1));
} finally {
  await sql`delete from user_packs where user_id in (${U}, ${V})`;
  await sql`delete from user_roles where user_id in (${U}, ${V})`;
  await sql`delete from license_codes where grants_pack_id = ${PACK}`;
  await sql`delete from pack_secrets where pack_id = ${PACK}`;
  await sql`delete from section_packs where id = ${PACK}`;
  console.log('\ntest data removed.');
}
