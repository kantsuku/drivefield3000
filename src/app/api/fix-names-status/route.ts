import { NextRequest, NextResponse } from "next/server";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";
import * as fs from "fs";
import * as path from "path";

const STATUS_FILE = path.resolve(process.cwd(), ".fix-names-status.json");

export async function GET(req: NextRequest) {
  if (!validateAdminKey(req)) return unauthorizedResponse();
  try {
    if (!fs.existsSync(STATUS_FILE)) {
      return NextResponse.json({ status: "idle" });
    }
    const data = JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "idle" });
  }
}
