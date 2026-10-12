import { z } from "zod";
import { LANGUAGES } from "@/content/languages";
import { getCurrentUser } from "@/lib/auth";
import { error, json, parse } from "@/lib/http";
import { judgeSupports, runOnJudge, type JudgeResult } from "@/lib/judge";
import { rateLimit } from "@/lib/rate-limit";

const Body = z.object({
  language: z.enum(Object.keys(LANGUAGES) as [keyof typeof LANGUAGES, ...(keyof typeof LANGUAGES)[]]),
  code: z.string().max(64_000),
  inputs: z.array(z.string().max(256_000)).min(1).max(40),
});

/** Runs code on the server-side judge (compiled languages). 503 when no judge is configured. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Not signed in", 401);
  const parsed = await parse(req, Body);
  if ("response" in parsed) return parsed.response;
  const { language, code, inputs } = parsed.data;
  if (!judgeSupports(language)) return error("The code judge isn't configured for this language", 503);

  // Each input is one judge execution; budget per user.
  const limit = await rateLimit(`run:${user.id}`, 120, 60_000);
  if (!limit.ok) return error(`Too many runs — try again in ${limit.retryAfterSec}s`, 429);

  try {
    const results: JudgeResult[] = [];
    for (const input of inputs) results.push(await runOnJudge(language, code, input));
    return json({ results });
  } catch (e) {
    console.error("[api/run] judge failure", e);
    return error("The code judge is unavailable right now. Please try again.", 502);
  }
}
