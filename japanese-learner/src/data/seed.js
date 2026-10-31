import { createItem } from '../types';

export const ITEMS_STORAGE_KEY = 'japanese-learner:items';

export const seedItems = [
  createItem({
    type: 'grammar',
    category: '文法：時制',
    front: '〜た/ない形',
    meaning: '表示過去式（〜た）或否定（〜ない）',
    examples: [
      { id: 'ex-1a', japanese: '食べた。', manual: '我吃過了。', auto: '' },
      { id: 'ex-1b', japanese: '食べない。', manual: '我不吃。', auto: '' },
    ],
  }),
  createItem({
    type: 'grammar',
    category: '文法：句型',
    front: '〜てから',
    meaning: '表示「…之後」',
    examples: [
      {
        id: 'ex-2a',
        japanese: '朝ごはんを食べてから、学校へ行きます。',
        manual: '吃完早餐之後，我去學校。',
        auto: '',
      },
    ],
  }),
  createItem({
    type: 'grammar',
    category: '文法：敬語',
    front: 'お + 動詞',
    meaning: '尊敬語，用來稱呼對方',
    examples: [
      { id: 'ex-3a', japanese: 'お越しください。', manual: '請您來。', auto: '' },
    ],
  }),
  createItem({
    type: 'vocab',
    category: '單字：常用詞彙',
    front: '食べる',
    reading: 'たべる',
    meaning: '吃',
    examples: [
      {
        id: 'ex-4a',
        japanese: '毎朝、コーヒーを飲んでから、ご飯を食べます。',
        manual: '每天早上，先喝咖啡再吃早餐。',
        auto: '',
      },
    ],
  }),
  createItem({
    type: 'vocab',
    category: '單字：常用詞彙',
    front: '飲む',
    reading: 'のむ',
    meaning: '喝、飲用',
    examples: [
      { id: 'ex-5a', japanese: '水を飲みます。', manual: '我喝水。', auto: '' },
    ],
  }),
];
