// study-sync: loads one class's built content file from the public
// study-flashcards repo into the study_* tables.
//
//   GET /functions/v1/study-sync?course=econ380&ref=<commit sha>
//
// The GitHub Pages workflow calls it for every class after each deploy, so
// Supabase always holds what the site serves. It takes no content from the
// caller: only a class id and a commit (or "main"), and it only ever reads
// site/content/<course>.json from this one repository. So it needs no key;
// calling it again just re-syncs to what the repo already says.
import { createClient } from "npm:@supabase/supabase-js@2";

const REPO = "https://raw.githubusercontent.com/iamrichardmaier-sudo/study-flashcards";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const course = url.searchParams.get("course") ?? "";
  const ref = url.searchParams.get("ref") ?? "main";
  if (!/^[a-z]{2,8}[0-9]{2,4}$/.test(course)) return json({ error: "bad course" }, 400);
  if (!/^(main|[0-9a-f]{7,40})$/.test(ref)) return json({ error: "bad ref" }, 400);

  const res = await fetch(`${REPO}/${ref}/site/content/${course}.json`);
  if (!res.ok) return json({ error: `content file not found (${res.status})` }, 404);
  const body = await res.json();
  if (body?.course?.id !== course || !Array.isArray(body.cards)) return json({ error: "content file doesn't match" }, 422);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const c = body.course;
  const { questions = [], ...examMeta } = body.exam ?? {};

  const { data: before } = await db.from("study_courses").select("version").eq("id", course).maybeSingle();
  const same = before?.version === body.version;
  let r = await db.from("study_courses").upsert({
    id: course, code: c.code, name: c.name, color: c.color, tagline: c.tagline, units: c.units ?? [],
    exam: examMeta, version: body.version, rev: Number(body.rev) || 0, ...(same ? {} : { published_at: new Date().toISOString() }),
  });
  if (r.error) return json({ error: r.error.message }, 500);

  /** Upserts only the rows whose data changed, then removes rows no longer in the file. */
  async function sync(table: string, rows: { id: string; n: number; unit?: number; data: unknown }[]) {
    const { data: have, error } = await db.from(table).select("id,n,data").eq("course_id", course);
    if (error) throw error;
    const old = new Map((have ?? []).map((x) => [x.id, x]));
    const changed = rows.filter((x) => {
      const o = old.get(x.id);
      return !o || o.n !== x.n || JSON.stringify(o.data) !== JSON.stringify(x.data);
    }).map((x) => ({ course_id: course, ...x, updated_at: new Date().toISOString() }));
    for (let k = 0; k < changed.length; k += 200) {
      const u = await db.from(table).upsert(changed.slice(k, k + 200));
      if (u.error) throw u.error;
    }
    const keep = new Set(rows.map((x) => x.id));
    const gone = [...old.keys()].filter((id) => !keep.has(id));
    if (gone.length) {
      const d = await db.from(table).delete().eq("course_id", course).in("id", gone);
      if (d.error) throw d.error;
    }
    return { total: rows.length, changed: changed.length, removed: gone.length };
  }

  try {
    const cards = await sync("study_cards", body.cards.map((x: any) => ({ id: x.id, n: x.n, unit: x.week ?? 1, data: x })));
    const qs = await sync("study_questions", questions.map((x: any, k: number) => ({ id: x.id, n: k + 1, data: x })));
    return json({ course, ref, version: body.version, cards, questions: qs });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
