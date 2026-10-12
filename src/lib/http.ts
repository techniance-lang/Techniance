import "server-only";
import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parse<T>(req: Request, schema: ZodSchema<T>): Promise<{ data: T } | { response: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { response: error("Invalid JSON body") };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { response: error(issue ? `${issue.path.join(".") || "body"}: ${issue.message}` : "Invalid request") };
  }
  return { data: result.data };
}
