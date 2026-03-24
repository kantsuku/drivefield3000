import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function PATCH(req: NextRequest) {
  try {
    const { pattern_id, field, value } = await req.json();
    if (!pattern_id || !field || value === undefined) {
      return NextResponse.json({ error: "pattern_id, field, value required" }, { status: 400 });
    }

    const namesFile = path.resolve(process.cwd(), "src/data/names-2880.json");
    const data = JSON.parse(fs.readFileSync(namesFile, "utf-8"));
    const entry = data.find((n: any) => n.pattern_id === pattern_id);
    if (!entry) {
      return NextResponse.json({ error: "pattern_id not found" }, { status: 404 });
    }

    entry[field] = value;
    fs.writeFileSync(namesFile, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
