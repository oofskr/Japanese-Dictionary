export const ITEM_TYPES = [
  { id: 'all', name: '全部' },
  { id: 'grammar', name: '文法' },
  { id: 'vocab', name: '單字' },
];

export function createItem({ type, category, front, reading = '', meaning = '', examples = [] }) {
  return {
    id: `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    category,
    front,
    reading,
    meaning,
    examples,
    manualTranslation: '',
    autoTranslation: '',
  };
}
