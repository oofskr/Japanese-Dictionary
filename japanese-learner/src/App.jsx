import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import WordCard from './components/WordCard';
import { ITEMS_STORAGE_KEY, seedItems } from './data/seed';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createItem, ITEM_TYPES } from './types';
import { speakJapaneseList, stopSpeaking, useSpeaking } from './utils/speech';

const CATEGORY_ORDER_STORAGE_KEY = 'japanese-learner:category-order';

function normalizeImportedItems(raw) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : null;
  if (!list) {
    throw new Error('JSON 格式不正確：找不到單字/文法陣列。');
  }

  return list
    .filter((item) => item && typeof item === 'object' && String(item.front || '').trim())
    .map((item, idx) => {
      const type = item.type === 'grammar' ? 'grammar' : 'vocab';
      const front = String(item.front).trim();
      const category =
        String(item.category || '').trim() || (type === 'grammar' ? '文法：自訂' : '單字：自訂');
      const examples = Array.isArray(item.examples)
        ? item.examples
            .filter((ex) => ex && String(ex.japanese || '').trim())
            .map((ex, exIdx) => ({
              id: String(ex.id || `ex-${Date.now().toString(36)}-${idx}-${exIdx}`),
              japanese: String(ex.japanese).trim(),
              manual: String(ex.manual || ''),
              auto: String(ex.auto || ''),
            }))
        : [];

      return {
        id: String(item.id || `${type}-${Date.now().toString(36)}-${idx}`),
        type,
        category,
        front,
        reading: String(item.reading || '').trim(),
        meaning: String(item.meaning || '').trim(),
        examples,
        manualTranslation: String(item.manualTranslation || ''),
        autoTranslation: String(item.autoTranslation || ''),
      };
    });
}

export default function App() {
  const [items, setItems] = useLocalStorage(ITEMS_STORAGE_KEY, seedItems);
  const [categoryOrder, setCategoryOrder] = useLocalStorage(CATEGORY_ORDER_STORAGE_KEY, []);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBottomAddForm, setShowBottomAddForm] = useState(false);
  const [readingMode, setReadingMode] = useState(true);
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);
  const bottomAddRef = useRef(null);
  const isSpeaking = useSpeaking();

  useEffect(() => {
    const existingCategories = [...new Set(items.map((i) => i.category).filter(Boolean))];
    setCategoryOrder((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) {
        return [...existingCategories].sort((a, b) =>
          a.localeCompare(b, 'zh-Hant', { numeric: true })
        );
      }
      const kept = prev.filter((c) => existingCategories.includes(c));
      const added = existingCategories.filter((c) => !kept.includes(c));
      const next = [...kept, ...added];
      if (next.length === prev.length && next.every((c, idx) => c === prev[idx])) {
        return prev;
      }
      return next;
    });
  }, [items]);

  const categories = useMemo(() => {
    const map = new Map();
    items
      .filter((i) => typeFilter === 'all' || i.type === typeFilter)
      .forEach((i) => {
        const existing = map.get(i.category);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(i.category, { category: i.category, type: i.type, count: 1 });
        }
      });

    const list = [...map.values()];
    const orderIndex = new Map(categoryOrder.map((c, idx) => [c, idx]));
    list.sort((a, b) => {
      const idxA = orderIndex.has(a.category) ? orderIndex.get(a.category) : Number.MAX_SAFE_INTEGER;
      const idxB = orderIndex.has(b.category) ? orderIndex.get(b.category) : Number.MAX_SAFE_INTEGER;
      return idxA - idxB;
    });
    return list;
  }, [items, typeFilter, categoryOrder]);

  const allCategoryNames = useMemo(
    () => categories.map((c) => c.category),
    [categories]
  );

  const filteredItems = useMemo(() => {
    const orderIndex = new Map(categoryOrder.map((c, idx) => [c, idx]));
    return items
      .filter(
        (i) =>
          (typeFilter === 'all' || i.type === typeFilter) &&
          (categoryFilter === 'all' || i.category === categoryFilter)
      )
      .sort((a, b) => {
        const idxA = orderIndex.has(a.category) ? orderIndex.get(a.category) : Number.MAX_SAFE_INTEGER;
        const idxB = orderIndex.has(b.category) ? orderIndex.get(b.category) : Number.MAX_SAFE_INTEGER;
        return idxA - idxB;
      });
  }, [items, typeFilter, categoryFilter, categoryOrder]);

  const defaultAddType = useMemo(() => {
    if (typeFilter !== 'all') return typeFilter;
    if (categoryFilter !== 'all') {
      const matched = items.find((i) => i.category === categoryFilter);
      if (matched) return matched.type;
    }
    return 'vocab';
  }, [typeFilter, categoryFilter, items]);

  const defaultAddCategory = categoryFilter !== 'all' ? categoryFilter : '';

  const handleTypeChange = (nextType) => {
    setTypeFilter(nextType);
    if (
      nextType !== 'all' &&
      categoryFilter !== 'all' &&
      !items.some((i) => i.type === nextType && i.category === categoryFilter)
    ) {
      setCategoryFilter('all');
    }
  };

  const handleChange = (id, patch) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    if (patch.category) {
      setCategoryOrder((prev) =>
        prev.includes(patch.category) ? prev : [...prev, patch.category]
      );
    }
  };

  const handleDelete = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const handleAdd = (data) => {
    const item = createItem(data);
    setItems((prev) => [...prev, item]);
    setCategoryOrder((prev) =>
      prev.includes(item.category) ? prev : [...prev, item.category]
    );
    setShowAddForm(false);
  };

  const handleToggleSpeakAll = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const texts = filteredItems.flatMap((item) => [
      item.front,
      ...item.examples.map((ex) => ex.japanese),
    ]);
    speakJapaneseList(texts);
  };

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const payload = JSON.stringify(items, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `japanese-learner-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportError('');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const normalized = normalizeImportedItems(parsed);
      if (normalized.length === 0) {
        throw new Error('檔案中沒有有效的單字或文法資料。');
      }
      setPendingImport({ fileName: file.name, items: normalized });
    } catch (err) {
      setPendingImport(null);
      setImportError(err?.message || '讀取匯入檔案失敗，請確認檔案為有效的 JSON。');
    }
  };

  const applyImportMerge = () => {
    if (!pendingImport) return;
    const importedCategories = [...new Set(pendingImport.items.map((it) => it.category))];
    setItems((prev) => {
      const incomingById = new Map(pendingImport.items.map((it) => [it.id, it]));
      const updated = prev.map((it) => (incomingById.has(it.id) ? incomingById.get(it.id) : it));
      const existingIds = new Set(prev.map((it) => it.id));
      const added = pendingImport.items.filter((it) => !existingIds.has(it.id));
      return [...updated, ...added];
    });
    setCategoryOrder((prev) => {
      const extra = importedCategories.filter((c) => !prev.includes(c));
      return [...prev, ...extra];
    });
    setPendingImport(null);
  };

  const applyImportReplace = () => {
    if (!pendingImport) return;
    if (window.confirm(`確定要用「${pendingImport.fileName}」覆蓋目前的全部資料嗎？`)) {
      const importedCategories = [...new Set(pendingImport.items.map((it) => it.category))];
      setItems(pendingImport.items);
      setCategoryOrder(importedCategories);
      setCategoryFilter('all');
      setPendingImport(null);
    }
  };

  return (
    <div className="app">
      <Sidebar
        types={ITEM_TYPES}
        categories={categories}
        typeFilter={typeFilter}
        categoryFilter={categoryFilter}
        onTypeChange={handleTypeChange}
        onCategoryChange={setCategoryFilter}
      />

      <main className="content">
        <header className="content-header">
          <h1>日語學習</h1>
          <div className="header-actions">
            <button
              type="button"
              className={`btn ${isSpeaking ? 'btn-stop' : ''}`}
              onClick={handleToggleSpeakAll}
              disabled={!isSpeaking && filteredItems.length === 0}
            >
              {isSpeaking ? '⏹️ 停止朗讀' : '🔊 朗讀全部'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setReadingMode((v) => !v)}
            >
              {readingMode ? '編輯模式' : '閱讀模式'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleExport}>
              📤 匯出單字庫
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => fileInputRef.current?.click()}
            >
              📥 匯入單字庫
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button type="button" className="btn" onClick={() => setShowAddForm((v) => !v)}>
              {showAddForm ? '關閉新增表單' : '＋ 新增文法 / 單字'}
            </button>
          </div>
        </header>

        {importError && <div className="import-banner import-banner-error">{importError}</div>}

        {pendingImport && (
          <div className="import-banner">
            <span>
              已讀取「<strong>{pendingImport.fileName}</strong>」（共 {pendingImport.items.length}{' '}
              筆），請選擇匯入方式：
            </span>
            <div className="import-banner-actions">
              <button type="button" className="btn" onClick={applyImportMerge}>
                合併至現有單字庫
              </button>
              <button type="button" className="btn btn-danger" onClick={applyImportReplace}>
                覆蓋現有單字庫
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPendingImport(null)}
              >
                取消
              </button>
            </div>
          </div>
        )}

        {showAddForm && (
          <AddItemForm
            defaultType={defaultAddType}
            defaultCategory={defaultAddCategory}
            categoryOptions={allCategoryNames}
            onCancel={() => setShowAddForm(false)}
            onAdd={handleAdd}
          />
        )}

        {filteredItems.length === 0 ? (
          <p className="empty">沒有符合條件的項目，請調整分類或新增內容。</p>
        ) : (
          filteredItems.map((item) => (
            <WordCard
              key={item.id}
              item={item}
              readingMode={readingMode}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          ))
        )}

        {!readingMode && (
          <div className="bottom-add-section" ref={bottomAddRef}>
            {showBottomAddForm ? (
              <AddItemForm
                defaultType={defaultAddType}
                defaultCategory={defaultAddCategory}
                categoryOptions={allCategoryNames}
                onCancel={() => setShowBottomAddForm(false)}
                onAdd={(data) => {
                  handleAdd(data);
                  setShowBottomAddForm(false);
                }}
              />
            ) : (
              <button
                type="button"
                className="bottom-add-btn"
                onClick={() => {
                  setShowBottomAddForm(true);
                  setTimeout(() => {
                    bottomAddRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 50);
                }}
              >
                ＋ 新增文法 / 單字
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function AddItemForm({ defaultType, defaultCategory, categoryOptions, onAdd, onCancel }) {
  const [type, setType] = useState(defaultType);
  const [category, setCategory] = useState(defaultCategory);
  const [front, setFront] = useState('');
  const [reading, setReading] = useState('');
  const [meaning, setMeaning] = useState('');

  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  const submit = (e) => {
    e.preventDefault();
    if (!front.trim()) return;
    onAdd({
      type,
      category: category.trim() || (type === 'grammar' ? '文法：自訂' : '單字：自訂'),
      front: front.trim(),
      reading: reading.trim(),
      meaning: meaning.trim(),
    });
    setFront('');
    setReading('');
    setMeaning('');
  };

  return (
    <form className="add-item-form" onSubmit={submit}>
      <h2>新增文法 / 單字</h2>
      <div className="form-row">
        <label>
          類型
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="grammar">文法</option>
            <option value="vocab">單字</option>
          </select>
        </label>
        <label>
          分類
          <input
            type="text"
            list="category-options"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="如：TryN2 - 1"
          />
          <datalist id="category-options">
            {categoryOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
      </div>
      <div className="form-row">
        <label>
          日文內容
          <input type="text" value={front} onChange={(e) => setFront(e.target.value)} placeholder="如：食べる" />
        </label>
        <label>
          假名 / 振り仮名
          <input type="text" value={reading} onChange={(e) => setReading(e.target.value)} placeholder="如：たべる" />
        </label>
      </div>
      <label>
        中文意思
        <input type="text" value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="如：吃" />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn">儲存</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>取消</button>
      </div>
    </form>
  );
}
