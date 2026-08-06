export function formatCTAUrl(url) {
  if (!url) return '#contact';
  const trimmed = url.trim();

  if (!trimmed || trimmed === '#contact') return '#contact';

  // Egyptian mobile phone number starting with 01 (11 digits: e.g. 01012345678)
  const egPhonePattern = /^01[0125]\d{8}$/;
  if (egPhonePattern.test(trimmed)) {
    return `https://wa.me/20${trimmed.substring(1)}`;
  }

  // Egyptian mobile phone number with country code: 201... or +201... (12 digits)
  const egIntlPattern = /^(\+?20)1[0125]\d{8}$/;
  const cleanDigits = trimmed.replace(/\s+/g, '');
  if (egIntlPattern.test(cleanDigits)) {
    const digitsOnly = cleanDigits.replace(/\D/g, '');
    return `https://wa.me/${digitsOnly}`;
  }

  return trimmed;
}
