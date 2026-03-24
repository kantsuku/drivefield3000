import { NextResponse } from "next/server";
import { exec } from "child_process";
import * as path from "path";

function run(cmd: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout);
    });
  });
}

export async function POST() {
  const root = process.cwd();
  const tsx = path.resolve(root, "node_modules/.bin/tsx");

  try {
    await run(`${tsx} scripts/sync-names.ts`, root);
    await run(`${tsx} scripts/sync-names-240.ts`, root);
    await run(`git add src/ scripts/ package.json`, root);

    const staged = await run(`git diff --cached --name-only`, root);
    if (!staged.trim()) {
      return NextResponse.json({ success: true, message: "変更なし（すでに最新）" });
    }

    await run(`git -c user.name="DriveField" -c user.email="deploy@drivefield3000.local" commit -m "update names"`, root);
    await run(`git push`, root);

    return NextResponse.json({ success: true, message: "Vercelにデプロイしました" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
