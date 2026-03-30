import { NextRequest, NextResponse } from 'next/server';

export function validateAdminKey(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key') || new URL(req.url).searchParams.get('key');
  return key === process.env.ADMIN_API_KEY;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
