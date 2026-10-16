/**
 * QUICK 4AI - Core Type Definitions & Data Contracts
 * Defines claims, reviews, sources, stages, and runs as specified in Section 10 & 11
 */

export type ProviderName = 'gpt' | 'gemini' | 'perplexity' | 'claude';

export type QuestionType =
  | 'general'
  | 'fact_check'
  | 'decision'
  | 'code_review'
  | 'writing';

export type VerificationMode = 'QUICK' | 'DEEP';

export type ClaimType = 'fact' | 'assumption' | 'inference' | 'opinion';

export type EvidenceStatus =
  | 'unreviewed'
  | 'supported'
  | 'partially_supported'
  | 'refuted'
  | 'unverifiable'
  | 'opinion';

export type ReviewProgressStatus =
  | 'raised'
  | 'revised'
  | 'resolved'
  | 'unresolved';

export type IssueType =
  | 'fact_error'
  | 'missing_condition'
  | 'logical_leap'
  | 'source_misinterpretation'
  | 'unjustified_certainty';

export type SourceCaptureLevel = 'full' | 'excerpt' | 'search_snippet';

export type RunStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'error'
  | 'partial_completed';

export interface ClaimItem {
  claimId: string;
  provider: ProviderName;
  content: string;
  type: ClaimType;
  sourceLocation: string; // e.g. "gemini_stage_a:paragraph_2"
  evidenceStatus: EvidenceStatus;
  linkedSourceIds: string[];
  isUnresolved: boolean;
  notes?: string;
}

export interface ReviewItem {
  reviewId: string;
  reviewer: ProviderName;
  targetArtifactId: string;
  targetVersion: number;
  targetClaimId: string;
  issueType: IssueType;
  impactOnConclusion: 'critical' | 'moderate' | 'minor';
  evidenceOrCounterexample: string;
  suggestedRevision: string;
  verificationLimits: string;
  responseStatus?: 'accepted' | 'partially_accepted' | 'refuted' | 'pending';
  responseDetails?: string;
}

export interface SourceItem {
  sourceId: string;
  url: string;
  title: string;
  publishedDate?: string;
  collectedAt: string;
  evidenceQuote: string;
  captureLevel: SourceCaptureLevel;
  linkedClaimIds: string[];
  isFailedOrMissing: boolean;
  accessStatus: 'accessible' | 'paywall' | 'login_required' | 'blocked' | 'not_found';
}

export interface ProviderOutput {
  provider: ProviderName;
  model: string;
  stageId: string;
  version: number;
  rawText: string;
  claims: ClaimItem[];
  assumptions?: string[];
  uncertainties?: string[];
  verificationNeeded?: string[];
  critiquesGiven?: ReviewItem[];
  tokensUsed?: { prompt: number; completion: number; total: number };
  durationMs: number;
  timestamp: string;
  isPartialOrSkipped?: boolean;
}

export interface StageExecutionInfo {
  stageId: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  startedAt?: string;
  finishedAt?: string;
  callsCount: number;
  targetProviders: ProviderName[];
}

export interface RunData {
  runId: string;
  mode: VerificationMode;
  questionType: QuestionType;
  query: string;
  referenceDoc?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  status: RunStatus;
  isDemo: boolean; // True if run in mock/demo mode without real API calls
  currentStageId: string;
  totalCalls: number;
  stages: Record<string, StageExecutionInfo>;
  providerOutputs: Record<string, ProviderOutput>; // key: provider_stage
  claims: Record<string, ClaimItem>;
  reviews: Record<string, ReviewItem>;
  sources: Record<string, SourceItem>;
  unresolvedIssues: Array<{
    id: string;
    description: string;
    conflictingProviders: ProviderName[];
    evidenceSummary: string;
  }>;
  finalSynthesis?: {
    answer: string;
    confidenceAssessment: string;
    synthesisModel: string;
    evidenceSummary: string;
    critiqueAndRevisionSummary: string;
    unresolvedItems: string[];
    isTruncated?: boolean;
    verificationNotice: string; // e.g. "검토 절차 완료 (무오류 보증 불가)"
  };
  transitionOffer?: {
    shouldOfferDeep: boolean;
    reasons: string[];
    deltaCallsRequired: number;
  };
  error?: {
    code: string;
    message: string;
    failedStage?: string;
    canRetry?: boolean;
  };
}

export interface ProviderKeyStatus {
  gemini: { configured: boolean; model: string; source: 'env' | 'custom' | 'none' };
  openai: { configured: boolean; model: string; source: 'env' | 'custom' | 'none' };
  perplexity: { configured: boolean; model: string; source: 'env' | 'custom' | 'none' };
  claude: { configured: boolean; model: string; source: 'env' | 'custom' | 'none' };
}

export interface BenchmarkCase {
  id: string;
  category: 'fact_check' | 'logic_math' | 'code_review';
  title: string;
  query: string;
  referenceDoc?: string;
  questionType: QuestionType;
  groundTruth: {
    correctFactOrSolution: string;
    commonTrapOrFabrication: string;
    verificationCriteria: string[];
    mustDetectErrors: string[];
  };
}
