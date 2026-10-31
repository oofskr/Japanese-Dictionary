import { useState } from 'react';
import TranslationSection from './TranslationSection';
import { generateTranslation } from '../api/gemini';

export default function ExampleItem({ example, context, onChange, onDelete }) {
  const [collapsed, setCollapsed] = useState(true);
  const [visibility, setVisibility] = useState(true);

  const handleAuto = (japanese, ctx) => generateTranslation(japanese, ctx);

  const handleDelete = () => {
    if (window.confirm('確定要刪除這筆例句嗎？')) {
      onDelete(example.id);
    }
  };

  const handleCommit = () => {
    if ((example.japanese || '').trim()) {
      setCollapsed(true);
    }
  };

  const handleJapaneseKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleCommit();
    }
  };

  if (collapsed) {
    return (
      <li className="example-item">
        <div className="example-japanese">{example.japanese}</div>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setVisibility(true);
            setCollapsed(false);
          }}
        >
          編輯例句
        </button>
      </li>
    );
  }

  return (
    <li className="example-item">
      <div className="example-edit-row">
        <label className="example-edit-label">
          日文例句
          <input
            type="text"
            value={example.japanese}
            placeholder="輸入日語例句，按 Enter 完成編輯…"
            onChange={(e) => onChange({ japanese: e.target.value })}
            onKeyDown={handleJapaneseKeyDown}
          />
        </label>
      </div>

      <TranslationSection
        japanese={example.japanese}
        manual={example.manual || ''}
        auto={example.auto || ''}
        context={context}
        onChange={({ manual, auto }) => onChange({ manual, auto })}
        onAuto={handleAuto}
        onCommit={handleCommit}
        visible={visibility}
        onVisibleChange={setVisibility}
      />

      <div className="example-actions">
        <button type="button" className="btn btn-outline" onClick={handleCommit}>
          完成編輯
        </button>
        <button type="button" className="btn btn-danger" onClick={handleDelete}>
          刪除例句
        </button>
      </div>
    </li>
  );
}
