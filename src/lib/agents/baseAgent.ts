/**
 * Base class for all AI trading agents.
 * Handles Redis pub/sub, Claude API calls, logging, and reasoning publishing.
 */
import Anthropic from '@anthropic-ai/sdk';
import { getRedisClient, getRedisPublisher } from '@/lib/forex/cache/redisClient';
import type { AgentReasoning, AgentStatus } from '@/types/agents';
import type Redis from 'ioredis';

export abstract class BaseAgent {
  protected name: string;
  protected redis: Redis;
  protected publisher: Redis;
  protected anthropic: Anthropic;
  protected model: string;
  protected isRunning = false;
  protected status: AgentStatus = 'idle';
  protected signalsToday = 0;
  private dailyResetInterval: ReturnType<typeof setInterval> | null = null;

  constructor(name: string, model = 'claude-haiku-4-5-20251001') {
    this.name = name;
    this.redis = getRedisClient();
    this.publisher = getRedisPublisher();
    this.model = model;
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'sk-placeholder',
    });
  }

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;

  getName(): string {
    return this.name;
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getInfo() {
    return {
      name: this.name,
      status: this.status,
      lastActivity: Date.now(),
      signalsToday: this.signalsToday,
    };
  }

  protected setStatus(status: AgentStatus): void {
    this.status = status;
    this.publishToChannel('channel:agent:status', {
      type: 'AGENT_STATUS',
      agentName: this.name,
      status,
    });
  }

  protected async callClaude(
    systemPrompt: string,
    userMessage: string,
    options?: { maxTokens?: number }
  ): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    return textBlock?.text ?? '';
  }

  protected publishReasoning(reasoning: Omit<AgentReasoning, 'agentName' | 'timestamp'>): void {
    const full: AgentReasoning = {
      ...reasoning,
      agentName: this.name,
      timestamp: Date.now(),
    };
    this.publishToChannel('channel:agent:reasoning', {
      type: 'AGENT_REASONING',
      data: full,
    });
  }

  protected publishToChannel(channel: string, data: unknown): void {
    this.publisher.publish(channel, JSON.stringify(data));
  }

  protected log(level: 'info' | 'warn' | 'error', message: string): void {
    const prefix = `[${this.name}]`;
    if (level === 'error') {
      console.error(prefix, message);
    } else if (level === 'warn') {
      console.warn(prefix, message);
    } else {
      console.log(prefix, message);
    }
  }

  protected startDailyReset(): void {
    // Reset signal count at midnight UTC
    this.dailyResetInterval = setInterval(() => {
      const now = new Date();
      if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
        this.signalsToday = 0;
      }
    }, 60_000);
  }

  protected stopDailyReset(): void {
    if (this.dailyResetInterval) {
      clearInterval(this.dailyResetInterval);
      this.dailyResetInterval = null;
    }
  }

  /** Sleep helper for polling loops */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
