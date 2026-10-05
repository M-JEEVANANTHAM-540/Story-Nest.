import { sanitizePII } from './privacyGuard';

export interface ModerationCheckResult {
  safe: boolean;
  reason?: string;
  flagType?: 'pii' | 'profanity' | 'violence' | 'spam';
}

// Banned keywords and inappropriate content patterns for elementary/middle school students
const PROFANITY_PATTERNS = [
  /\b(fuck|shit|bitch|bastard|asshole|cunt|dick|pussy|whore|slut)\b/i,
  /\b(porn|nude|nsfw|erotic|sex|intercourse)\b/i
];

const VIOLENCE_PATTERNS = [
  /\b(kill\s+everyone|murder|decapitate|slaughter|suicide|mutilate|bomb\s+school|shoot\s+people)\b/i,
  /\b(blood\s+guts|torture|gore|extreme\s+violence)\b/i
];

/**
 * Fast client-side regex moderation pass.
 * Validates text before calling server APIs or Gemini models.
 */
export function checkClientModeration(text: string): ModerationCheckResult {
  if (!text || text.trim().length === 0) {
    return { safe: true };
  }

  // 1. PII Check
  const piiCheck = sanitizePII(text);
  if (piiCheck.hasPII) {
    return {
      safe: false,
      flagType: 'pii',
      reason: `Personal information detected (${piiCheck.redactedTypes.join(', ')}). Please remove personal identifiers before submitting.`
    };
  }

  // 2. Profanity Check
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(text)) {
      return {
        safe: false,
        flagType: 'profanity',
        reason: 'Content contains inappropriate or adult language suitable for young readers.'
      };
    }
  }

  // 3. Violence Check
  for (const pattern of VIOLENCE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        safe: false,
        flagType: 'violence',
        reason: 'Content contains themes of extreme violence or harm that are unsafe for children.'
      };
    }
  }

  // 4. Repeated spam/garbage string check
  if (text.length > 50) {
    const uniqueChars = new Set(text.toLowerCase().replace(/\s/g, '')).size;
    if (uniqueChars < 4) {
      return {
        safe: false,
        flagType: 'spam',
        reason: 'Text appears to be repeated junk characters or spam.'
      };
    }
  }

  return { safe: true };
}
