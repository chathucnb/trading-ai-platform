import { NextResponse } from 'next/server';
import { MAJOR_PAIRS } from '@/types/forex/pairs';

export function GET() {
  return NextResponse.json(MAJOR_PAIRS);
}
