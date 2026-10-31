import { useEffect, useRef, useState } from 'react';
import ExampleItem from './ExampleItem';
import { generateTranslation } from '../api/gemini';
import { speakJapaneseList } from '../utils/speech';

export default function WordCard({ item, readingMode, onChange, onDelete }) {
  const [newExample, setNewExample] = useState('');
  const [itemEditing, setItemEditing] = useState(false);
  const [meaningVisible, setMeaningVisible] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [meaningError, setMeaningError] = useState('');
  const prevExamplesCount = useRef(item.examples.length);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (item.examples.length > prevExamplesCount.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        inputRef.current?.focus();
      }, 50);
    }
    prevExamplesCount.current = item.examples.length;
  }, [item.examples.length]);

  const updateItem = (patch) => onChange(item.id, patch);

  const updateExample = (exId, patch) =>
    updateItem({
      examples: item.examples.map((e) => (e.id === exId ? { ...e, ...patch } : e)),
    });

  const addExample = () => {
    const japanese = newExample.trim();
    if (!japanese) return;
    updateItem({
      examples: [
        ...item.examples,
        {
          id: `ex-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          japanese,
          manual: '',
          auto: '',
        },
      ],
    });
    setNewExample('');
  };

  const deleteExample = (exId) =>
    updateItem({ examples: item.examples.filter((e) => e.id !== exId) });

  const handleAutoMeaning = async () => {
    if (generating) return;
    setGenerating(true);
    setMeaningError('');
    try {
      const translated = await generateTranslation(item.front, item.category);
      updateItem({ meaning: translated });
      setMeaningVisible(true);
    } catch (err) {
      setMeaningError(err?.message || '自動生成翻譯失敗，請稍後再試。');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteItem = () => {
    const label = item.type === 'grammar' ? '文法' : '單字';
    if (window.confirm(`確定要刪除「${item.front}」這個${label}嗎？此動作無法復原。`)) {
      onDelete(item.id);
    }
  };

  const speakCard = () => {
    speakJapaneseList([item.front, ...item.examples.map((ex) => ex.japanese)]);
  };

  const speakLabel = item.type === 'grammar' ? '🔊 朗讀該文法' : '🔊 朗讀該單字';

  if (readingMode) {
    return (
      <div className="word-card reading-card">
        <div className="word-card-header">
          <span className={`badge badge-${item.type}`}>{item.type === 'grammar' ? '文法' : '單字'}</span>
          <span className="word-category">{item.category}</span>
          <button type="button" className="btn btn-outline header-toggle" onClick={speakCard}>
            {speakLabel}
          </button>
        </div>

        <h2 className="word-front">{item.front}</h2>
        {item.reading && <div className="word-reading">読み：{item.reading}</div>}

        {item.examples.length > 0 && (
          <div className="examples">
            <ul className="example-list">
              {item.examples.map((ex) => (
                <li key={ex.id} className="example-item reading-example">
                  {ex.japanese}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="word-card">
      <div className="word-card-header">
        <span className={`badge badge-${item.type}`}>{item.type === 'grammar' ? '文法' : '單字'}</span>
        <span className="word-category">{item.category}</span>
        <button
          type="button"
          className="btn btn-outline header-toggle"
          onClick={() => setItemEditing((v) => !v)}
        >
          {itemEditing ? '取消編輯' : '編輯'}
        </button>
      </div>

      {itemEditing ? (
        <ItemEditForm
          item={item}
          onSave={(patch) => {
            updateItem(patch);
            setItemEditing(false);
          }}
          onCancel={() => setItemEditing(false)}
        />
      ) : (
        <>
          <h2 className="word-front">{item.front}</h2>
          {item.reading && <div className="word-reading">読み：{item.reading}</div>}

          <div className="meaning-row">
            <span className="meaning-label">意味：</span>
            <span className={`meaning-text ${meaningVisible ? '' : 'hidden-meaning'}`}>
              {meaningVisible ? item.meaning || '（未填寫）' : '•••'}
            </span>
            <div className="meaning-actions">
              <button type="button" className="btn" onClick={handleAutoMeaning} disabled={generating}>
                {generating ? '生成中…' : '自動生成翻譯'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setMeaningVisible((v) => !v)}>
                {meaningVisible ? '隱藏翻譯' : '顯示翻譯'}
              </button>
            </div>
          </div>
          {meaningError && <div className="error-text">{meaningError}</div>}

          <div className="examples">
            <h3>例句</h3>
            <ul className="example-list">
              {item.examples.map((ex) => (
                <ExampleItem
                  key={ex.id}
                  example={ex}
                  context={item.front}
                  onChange={(patch) => updateExample(ex.id, patch)}
                  onDelete={deleteExample}
                />
              ))}
            </ul>
            <div className="add-example">
              <input
                ref={inputRef}
                type="text"
                value={newExample}
                placeholder="輸入新的日語例句，按 Enter 直接完成…"
                onChange={(e) => setNewExample(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    addExample();
                  }
                }}
              />
              <button type="button" className="btn" onClick={addExample} disabled={!newExample.trim()}>
                新增例句
              </button>
            </div>
          </div>

          <button type="button" className="btn btn-danger btn-delete-item" onClick={handleDeleteItem}>
            刪除此項目
          </button>
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
}

function ItemEditForm({ item, onSave, onCancel }) {
  const [category, setCategory] = useState(item.category);
  const [front, setFront] = useState(item.front);
  const [reading, setReading] = useState(item.reading || '');
  const [meaning, setMeaning] = useState(item.meaning || '');

  const submit = (e) => {
    e.preventDefault();
    if (!front.trim()) return;
    onSave({
      category: category.trim() || item.category,
      front: front.trim(),
      reading: reading.trim(),
      meaning: meaning.trim(),
    });
  };

  return (
    <form className="add-item-form" onSubmit={submit}>
      <h2>編輯{item.type === 'grammar' ? '文法' : '單字'}</h2>
      <div className="form-row">
        <label>
          分類
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="如：文法：時制" />
        </label>
        <label>
          日文內容
          <input type="text" value={front} onChange={(e) => setFront(e.target.value)} placeholder="如：食べる" />
        </label>
      </div>
      <div className="form-row">
        <label>
          假名 / 振り仮名
          <input type="text" value={reading} onChange={(e) => setReading(e.target.value)} placeholder="如：たべる" />
        </label>
        <label>
          中文意思
          <input type="text" value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="如：吃" />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn">儲存</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>取消</button>
      </div>
    </form>
  );
}
