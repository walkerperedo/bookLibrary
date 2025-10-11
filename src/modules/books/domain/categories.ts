export const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Fiction', value: 'fiction' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Science', value: 'science' },
  { label: 'History', value: 'history' },
  { label: 'Crime', value: 'crime' },
  { label: 'Young Adult', value: '"young adult"' },
  { label: 'Horror', value: 'horror' },
  { label: 'Romance', value: 'romance' },
  { label: 'Biography', value: 'biography' },
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];
