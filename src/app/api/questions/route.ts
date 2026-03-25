import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const QUESTIONS_PATH = path.join(process.cwd(), 'src/data/diagnosis-questions.json');

export async function GET() {
  const raw = await readFile(QUESTIONS_PATH, 'utf-8');
  return NextResponse.json(JSON.parse(raw));
}

export async function PUT(request: Request) {
  const questions = await request.json();
  await writeFile(QUESTIONS_PATH, JSON.stringify(questions, null, 2) + '\n', 'utf-8');
  return NextResponse.json({ ok: true, count: questions.length });
}
