export type Availability = 'AVAILABLE' | 'ON_LOAN_MINE' | 'ON_LOAN_EXTERNAL';

function stableHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function externallyOnLoan(bookId: string) {
  const bucket = (new Date().getDate() % 7);
  return stableHash(bookId) % 13 === bucket; 
}

export function computeAvailability(bookId: string, isMineOnLoan: boolean): Availability {
  if (isMineOnLoan) return 'ON_LOAN_MINE';
  return externallyOnLoan(bookId) ? 'ON_LOAN_EXTERNAL' : 'AVAILABLE';
}