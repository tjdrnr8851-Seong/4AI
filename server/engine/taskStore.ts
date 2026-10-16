/**
 * Task Store & Lifecycle Management
 * Handles run persistence, expiration (24h), cancellation, and retrieval
 */

import { RunData, RunStatus } from '../../src/types/quick4ai';

class TaskStore {
  private runs: Map<string, RunData> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic cleanup of expired runs every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.purgeExpiredRuns();
    }, 10 * 60 * 1000);
  }

  public createRun(
    runId: string,
    initialData: Omit<RunData, 'runId' | 'createdAt' | 'updatedAt' | 'expiresAt'>
  ): RunData {
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const run: RunData = {
      ...initialData,
      runId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };

    this.runs.set(runId, run);
    this.abortControllers.set(runId, new AbortController());
    return run;
  }

  public getRun(runId: string): RunData | undefined {
    return this.runs.get(runId);
  }

  public updateRun(runId: string, updater: (run: RunData) => void): RunData | undefined {
    const run = this.runs.get(runId);
    if (!run) return undefined;

    updater(run);
    run.updatedAt = new Date().toISOString();
    return run;
  }

  public getAbortSignal(runId: string): AbortSignal | undefined {
    return this.abortControllers.get(runId)?.signal;
  }

  public cancelRun(runId: string): boolean {
    const controller = this.abortControllers.get(runId);
    if (controller) {
      controller.abort();
    }
    const run = this.runs.get(runId);
    if (run) {
      run.status = 'cancelled';
      run.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public deleteRun(runId: string): boolean {
    this.abortControllers.get(runId)?.abort();
    this.abortControllers.delete(runId);
    return this.runs.delete(runId);
  }

  public listRecentRuns(): RunData[] {
    return Array.from(this.runs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 15);
  }

  public purgeExpiredRuns(): number {
    const now = new Date().getTime();
    let purged = 0;
    for (const [runId, run] of this.runs.entries()) {
      if (new Date(run.expiresAt).getTime() < now) {
        this.abortControllers.delete(runId);
        this.runs.delete(runId);
        purged++;
      }
    }
    return purged;
  }

  public getMemoryUsageEstimate(): {
    activeRunsCount: number;
    approxBytes: number;
  } {
    let bytes = 0;
    for (const run of this.runs.values()) {
      bytes += JSON.stringify(run).length * 2; // UTF-16 approximate
    }
    return {
      activeRunsCount: this.runs.size,
      approxBytes: bytes,
    };
  }
}

export const taskStore = new TaskStore();
