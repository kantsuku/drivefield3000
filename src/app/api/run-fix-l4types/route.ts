import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import * as path from "path";

export async function POST(req: NextRequest) {
  if (!validateAdminKey(req)) return unauthorizedResponse();
  const root = process.cwd();
  const script = path.resolve(root, "scripts/fix-l4-missing.ts");
  const tsx = path.resolve(root, "node_modules/.bin/tsx");

  exec(`${tsx} ${script}`, { cwd: root }, (err, stdout, stderr) => {
    if (err) {
      console.error("[run-fix-l4types] error:", err.message);
      console.error(stderr);
    } else {
      console.log("[run-fix-l4types] done:", stdout);
    }
  });

  return NextResponse.json({ started: true });
}
