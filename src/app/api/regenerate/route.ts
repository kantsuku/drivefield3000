import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function POST(req: NextRequest) {
  if (!validateAdminKey(req)) return unauthorizedResponse();
  try {
    const { patternIds } = await req.json();
    if (!Array.isArray(patternIds) || patternIds.length === 0) {
      return NextResponse.json({ error: "patternIds must be a non-empty array" }, { status: 400 });
    }

    const namesFile = path.resolve(process.cwd(), "src/data/names-2880.json");
    const data = JSON.parse(fs.readFileSync(namesFile, "utf-8"));
    const removeSet = new Set(patternIds);
    const before = data.length;
    const cleaned = data.filter((n: any) => !removeSet.has(n.pattern_id));

    fs.writeFileSync(namesFile, JSON.stringify(cleaned, null, 2), "utf-8");

    return NextResponse.json({ success: true, removed: before - cleaned.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
