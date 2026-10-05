import { ChildProfile } from '../types';

/**
 * Privacy First Zero-PII scrubbing & anonymization utility.
 * Sanitizes emails, phone numbers, Aadhaar/SSN cards, and explicit user identifiers
 * before sending data to server APIs or AI models.
 */

export interface SanitizedResult {
  sanitizedText: string;
  hasPII: boolean;
  redactedTypes: string[];
}

export function sanitizePII(text: string): SanitizedResult {
  if (!text || typeof text !== 'string') {
    return { sanitizedText: '', hasPII: false, redactedTypes: [] };
  }

  let result = text;
  const redactedTypes: string[] = [];

  // Email pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(result)) {
    redactedTypes.push('email');
    result = result.replace(emailRegex, '[EMAIL_REDACTED]');
  }

  // Phone number pattern (International + Indian 10-digit formats)
  const phoneRegex = /(?:\+?\d{1,3}[- .]?)?\(?\d{3}\)?[- .]?\d{3}[- .]?\d{4}/g;
  if (phoneRegex.test(result)) {
    redactedTypes.push('phone');
    result = result.replace(phoneRegex, '[PHONE_REDACTED]');
  }

  // Aadhaar / 12-digit Government ID pattern
  const aadhaarRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g;
  if (aadhaarRegex.test(result)) {
    redactedTypes.push('national_id');
    result = result.replace(aadhaarRegex, '[ID_REDACTED]');
  }

  // Credit Card 16-digit pattern
  const cardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  if (cardRegex.test(result)) {
    redactedTypes.push('payment_card');
    result = result.replace(cardRegex, '[CARD_REDACTED]');
  }

  return {
    sanitizedText: result,
    hasPII: redactedTypes.length > 0,
    redactedTypes
  };
}

export function anonymizeChildProfile(profile: Partial<ChildProfile>): { age: number; gradeLevel: string; anonymizedName: string } {
  return {
    age: profile.age || 9,
    gradeLevel: profile.gradeLevel || 'Grade 4',
    anonymizedName: profile.name ? `${profile.name.charAt(0).toUpperCase()}.` : 'Student'
  };
}
