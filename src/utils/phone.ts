const PHONE_FORMAT = /^[+]?(?:\d|\()[\d\s().-]*\d$/u;

const isObviousFakeMobile = (nationalNumber: string) =>
  /^(\d)\1{9}$/u.test(nationalNumber) ||
  /^(\d{2,5})\1+$/u.test(nationalNumber) ||
  /^(\d)\1{8,}$/u.test(nationalNumber.slice(1)) ||
  /(\d)\1{5,}/u.test(nationalNumber);

/**
 * Returns a Turkish mobile number in canonical 905xxxxxxxxx form.
 * Common local, +90 and 00 90 representations are accepted.
 */
export const normalizeTurkishMobilePhone = (value?: string) => {
  if (!value) return '';

  const input = value.normalize('NFKC').trim();
  if (!input || !PHONE_FORMAT.test(input) || (input.indexOf('+') > 0)) return '';

  const digits = input.replace(/\D/g, '');
  if (!digits) return '';

  let nationalNumber = digits;
  if (nationalNumber.startsWith('00')) {
    if (!nationalNumber.startsWith('0090')) return '';
    nationalNumber = nationalNumber.slice(4);
  } else if (nationalNumber.startsWith('90')) {
    nationalNumber = nationalNumber.slice(2);
  } else if (nationalNumber.startsWith('0')) {
    nationalNumber = nationalNumber.slice(1);
  }

  if (!/^5\d{9}$/u.test(nationalNumber) || isObviousFakeMobile(nationalNumber)) return '';
  return `90${nationalNumber}`;
};
