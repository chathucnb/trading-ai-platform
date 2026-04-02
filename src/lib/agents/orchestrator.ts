/**
 * Agent Orchestrator — manages lifecycle of all trading agents.
 * Starts, stops, monitors, and restarts agents on failure.
 */
import { BaseAgent } from './baseAgent';
import { NewsAgent } from './newsAgent';
import { ChartAgent } from './chartAgent';
import { CrossVerifyAgent } from './crossVerifyAgent';
import type { AgentInfo, AgentStatus } from '@/types/agents';

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.agents.set('NewsAgent', new NewsAgent());
    this.agents.set('ChartAgent', new ChartAgent());
    this.agents.set('CrossVerifyAgent', new CrossVerifyAgent());
  }

  async startAll(): Promise<void> {
    console.log('[Orchestrator] Starting all agents...');

    for (const [name, agent] of this.agents) {
      try {
        await agent.start();
        console.log(`[Orchestrator] ${name} started`);
      } catch (err) {
        console.error(`[Orchestrator] Failed to start ${name}:`, err);
      }
    }

    // Health check every 60 seconds
    this.healthCheckInterval = setInterval(() => this.healthCheck(), 60_000);

    console.log('[Orchestrator] All agents started');
  }

  async stopAll(): Promise<void> {
    console.log('[Orchestrator] Stopping all agents...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    for (const [name, agent] of this.agents) {
      try {
        await agent.stop();
        console.log(`[Orchestrator] ${name} stopped`);
      } catch (err) {
        console.error(`[Orchestrator] Failed to stop ${name}:`, err);
      }
    }

    console.log('[Orchestrator] All agents stopped');
  }

  async restartAgent(name: string): Promise<void> {
    const agent = this.agents.get(name);
    if (!agent) {
      console.warn(`[Orchestrator] Agent ${name} not found`);
      return;
    }

    console.log(`[Orchestrator] Restarting ${name}...`);
    await agent.stop();
    await agent.start();
    console.log(`[Orchestrator] ${name} restarted`);
  }

  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  getAllStatus(): Record<string, AgentInfo> {
    const statuses: Record<string, AgentInfo> = {};
    for (const [name, agent] of this.agents) {
      statuses[name] = agent.getInfo();
    }
    return statuses;
  }

  private async healthCheck(): Promise<void> {
    for (const [name, agent] of this.agents) {
      const status = agent.getStatus();
      if (status === 'error') {
        console.warn(`[Orchestrator] ${name} is in error state, restarting...`);
        try {
          await this.restartAgent(name);
        } catch (err) {
          console.error(`[Orchestrator] Failed to restart ${name}:`, err);
        }
      }
    }
  }
}

// Singleton orchestrator
let _orchestrator: AgentOrchestrator | null = null;
export function getOrchestrator(): AgentOrchestrator {
  if (!_orchestrator) {
    _orchestrator = new AgentOrchestrator();
  }
  return _orchestrator;
}
