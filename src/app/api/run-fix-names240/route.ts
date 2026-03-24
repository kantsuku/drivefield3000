import { NextResponse } from "next/server";
import { exec } from "child_process";
import * as path from "path";

export async function POST() {
  const root = process.cwd();
  const script = path.resolve(root, "scripts/fix-names240-missing.ts");
  const tsx = path.resolve(root, "node_modules/.bin/tsx");

  exec(`${tsx} ${script}`, { cwd: root }, (err, stdout, stderr) => {
    if (err) {
      console.error("[run-fix-names240] error:", err.message);
      console.error(stderr);
    } else {
      console.log("[run-fix-names240] done:", stdout);
    }
  });

  return NextResponse.json({ started: true });
}
