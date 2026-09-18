import { DocumentErrorItem } from '../../types/nd30';

export interface AuditRule {
  id: string;
  name: string;
  category: 'the_thuc' | 'chinh_ta' | 'phap_ly' | 'van_phong';
  severity: 'error' | 'warning' | 'suggestion' | 'critical';
  description: string;
  nd30Reference?: string;
  check: (text: string, context?: Record<string, unknown>) => DocumentErrorItem[] | null;
}

export interface LegalCitationRule {
  id: string;
  name: string;
  pattern: RegExp;
  status: 'valid' | 'warning' | 'invalid' | 'verified_source' | 'expired';
  note: string;
  replacement?: string;
}
