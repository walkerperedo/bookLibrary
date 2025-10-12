const OL = 'https://openlibrary.org';

export async function getWork(workId: string) {
  const res = await fetch(`${OL}/works/${workId}.json`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('OpenLibrary work failed');
  return res.json();
}

export async function getAuthorName(authorKey: string) {
  const res = await fetch(`${OL}${authorKey}.json`, { next: { revalidate: 24 * 3600 } });
  if (!res.ok) return 'Unknown';
  const j = await res.json();
  return j?.name ?? 'Unknown';
}

export function normalizeDescription(desc: any): string | undefined {
  if (!desc) return undefined;
  if (typeof desc === 'string') return desc;
  if (typeof desc === 'object' && typeof desc.value === 'string') return desc.value;
  return undefined;
}

export function coverFromIds(ids?: number[], size: 'S'|'M'|'L' = 'L') {
  if (!ids?.length) return undefined;
  return `https://covers.openlibrary.org/b/id/${ids[0]}-${size}.jpg`;
}
