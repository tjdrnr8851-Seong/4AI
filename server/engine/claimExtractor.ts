/**
 * Claim Extractor & Normalizer
 * Extracts discrete claims from model responses, categorizing them into:
 * fact, assumption, inference, or opinion.
 */

import { ClaimItem, ProviderName } from '../../src/types/quick4ai';

export function extractClaimsFromText(
  text: string,
  provider: ProviderName,
  stageId: string,
  existingCount: number = 0
): ClaimItem[] {
  const claims: ClaimItem[] = [];
  const lines = text.split('\n');

  let currentSection = 'general';
  let counter = existingCount + 1;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Detect section headers
    if (rawLine.includes('사실') || rawLine.toLowerCase().includes('fact')) {
      currentSection = 'fact';
    } else if (rawLine.includes('가정') || rawLine.toLowerCase().includes('assumption')) {
      currentSection = 'assumption';
    } else if (rawLine.includes('추론') || rawLine.toLowerCase().includes('inference')) {
      currentSection = 'inference';
    } else if (rawLine.includes('의견') || rawLine.toLowerCase().includes('opinion')) {
      currentSection = 'opinion';
    }

    // Match bullet items or numbered claims
    const bulletMatch = rawLine.match(/^[-*•\d+.]\s*(.+)$/);
    if (bulletMatch && bulletMatch[1].length > 15) {
      const claimText = bulletMatch[1].trim();

      // Skip generic summary headlines
      if (claimText.startsWith('#') || claimText.endsWith(':')) continue;

      let type: 'fact' | 'assumption' | 'inference' | 'opinion' = 'fact';
      if (currentSection === 'assumption' || claimText.includes('가정')) type = 'assumption';
      else if (currentSection === 'inference' || claimText.includes('추론') || claimText.includes('판단')) type = 'inference';
      else if (currentSection === 'opinion' || claimText.includes('권고') || claimText.includes('생각')) type = 'opinion';

      claims.push({
        claimId: `CLM_${provider.toUpperCase()}_${counter++}`,
        provider,
        content: claimText.slice(0, 300),
        type,
        sourceLocation: `${provider}_${stageId}:line_${i + 1}`,
        evidenceStatus: type === 'opinion' ? 'opinion' : 'unreviewed',
        linkedSourceIds: [],
        isUnresolved: false,
      });

      // Limit to 5 per provider in QUICK mode
      if (claims.length >= 5) break;
    }
  }

  // Fallback if no bullet points were found
  if (claims.length === 0 && text.trim().length > 30) {
    claims.push({
      claimId: `CLM_${provider.toUpperCase()}_${counter}`,
      provider,
      content: text.slice(0, 200).replace(/\n/g, ' '),
      type: 'inference',
      sourceLocation: `${provider}_${stageId}:fallback`,
      evidenceStatus: 'unreviewed',
      linkedSourceIds: [],
      isUnresolved: false,
    });
  }

  return claims;
}
