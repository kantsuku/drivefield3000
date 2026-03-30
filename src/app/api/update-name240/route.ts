import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import * as fs from "fs";

const FILE = path.resolve(process.cwd(), "src/data/names-240.json");

function backupFile() {
  const backup = FILE.replace(".json", `-backup-${Date.now()}.json`);
  fs.copyFileSync(FILE, backup);
}

// フラグされた真名を削除
export async function POST(req: NextRequest) {
  if (!validateAdminKey(req)) return unauthorizedResponse();
  try {
    const { ids } = await req.json();
    const data: any[] = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    const before = data.length;
    const filtered = data.filter((n: any) => !ids.includes(n.id));
    backupFile();
    fs.writeFileSync(FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return NextResponse.json({ success: true, removed: before - filtered.length });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// 名前・読みを1件更新
export async function PATCH(req: NextRequest) {
  if (!validateAdminKey(req)) return unauthorizedResponse();
  try {
    const { id, field, value } = await req.json();
    const data: any[] = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    const entry = data.find((n: any) => n.id === id);
    if (!entry) return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    entry[field] = value;
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
