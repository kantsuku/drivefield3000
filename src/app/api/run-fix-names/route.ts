import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

const STATUS_FILE = path.resolve(process.cwd(), ".fix-names-status.json");

export async function POST(req: NextRequest) {
  if (!validateAdminKey(req)) return unauthorizedResponse();
  const root = process.cwd();
  const script = path.resolve(root, "scripts/fix-names.ts");
  const tsx = path.resolve(root, "node_modules/.bin/tsx");

  fs.writeFileSync(
    STATUS_FILE,
    JSON.stringify({ status: "running", startedAt: new Date().toISOString() }),
    "utf-8"
  );

  exec(`${tsx} ${script}`, { cwd: root }, (err, stdout, stderr) => {
    if (err) {
      console.error("[run-fix-names] error:", err.message, stderr);
      fs.writeFileSync(
        STATUS_FILE,
        JSON.stringify({
          status: "error",
          finishedAt: new Date().toISOString(),
          message: err.message,
        }),
        "utf-8"
      );
    } else {
      console.log("[run-fix-names] done:", stdout);
      fs.writeFileSync(
        STATUS_FILE,
        JSON.stringify({
          status: "done",
          finishedAt: new Date().toISOString(),
        }),
        "utf-8"
      );
    }
  });

  return NextResponse.json({ started: true });
}
