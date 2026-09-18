import { theThucRules } from './theThucRules';
import { chinhTaRules } from './chinhTaRules';
import { phapLyRules, extractLegalCitations } from './phapLyRules';
import { AuditRule } from './ruleTypes';
import { DocumentErrorItem, LegalCitation } from '../../types/nd30';

export * from './ruleTypes';
export * from './theThucRules';
export * from './chinhTaRules';
export * from './phapLyRules';

export const ALL_AUDIT_RULES: AuditRule[] = [
  ...theThucRules,
  ...chinhTaRules,
  ...phapLyRules,
];

export interface AuditRulesExecutionResult {
  errors: DocumentErrorItem[];
  citations: LegalCitation[];
  theThucCount: number;
  chinhTaCount: number;
  phapLyCount: number;
  score: number;
}

export function executeAuditRules(text: string): AuditRulesExecutionResult {
  const errors: DocumentErrorItem[] = [];

  for (const rule of ALL_AUDIT_RULES) {
    try {
      const issues = rule.check(text);
      if (issues && issues.length > 0) {
        errors.push(...issues);
      }
    } catch (e) {
      console.error(`Error executing rule ${rule.id}:`, e);
    }
  }

  const citations = extractLegalCitations(text);

  const theThucCount = errors.filter((e) => e.type === 'the_thuc').length;
  const chinhTaCount = errors.filter((e) => e.type === 'chinh_ta').length;
  const phapLyCount = errors.filter((e) => e.type === 'phap_ly').length;

  // Calculate score (100 base, deduction based on severity)
  let scoreDeduction = 0;
  for (const err of errors) {
    if (err.severity === 'critical' || err.severity === 'error') {
      scoreDeduction += 8;
    } else if (err.severity === 'warning') {
      scoreDeduction += 4;
    } else {
      scoreDeduction += 2;
    }
  }

  const finalScore = Math.max(30, Math.min(100, 100 - scoreDeduction));

  return {
    errors,
    citations,
    theThucCount,
    chinhTaCount,
    phapLyCount,
    score: finalScore,
  };
}
