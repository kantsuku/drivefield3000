import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function PATCH(req: NextRequest) {
  try {
    const { id, field, value } = await req.json();
    if (!id || !field || value === undefined) {
      return NextResponse.json({ error: "id, field, value required" }, { status: 400 });
    }
    const file = path.resolve(process.cwd(), "src/data/l4-types.json");
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    const entry = data.find((t: any) => t.id === id);
    if (!entry) return NextResponse.json({ error: "id not found" }, { status: 404 });
    entry[field] = value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 再生成リクエスト: 対象IDを削除
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids)) return NextResponse.json({ error: "ids required" }, { status: 400 });
    const file = path.resolve(process.cwd(), "src/data/l4-types.json");
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    const removeSet = new Set(ids);
    const before = data.length;
    const cleaned = data.filter((t: any) => !removeSet.has(t.id));
    fs.writeFileSync(file, JSON.stringify(cleaned, null, 2), "utf-8");
    return NextResponse.json({ success: true, removed: before - cleaned.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
