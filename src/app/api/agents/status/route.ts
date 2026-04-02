import { NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/agents/orchestrator';

export async function GET() {
  try {
    const orchestrator = getOrchestrator();
    const statuses = orchestrator.getAllStatus();
    return NextResponse.json({ agents: statuses });
  } catch {
    return NextResponse.json({ agents: {} }, { status: 200 });
  }
}
