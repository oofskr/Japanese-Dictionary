import { useState } from 'react';

export default function TranslationSection({
  japanese,
  manual,
  auto = '',
  context = '',
  onChange,
  onAuto,
  onCommit,
  visible: visibleProp,
  onVisibleChange,
}) {
  const [internalVisible, setInternalVisible] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const visible = visibleProp ?? internalVisible;
  const setVisible = (v) => {
    setInternalVisible(v);
    onVisibleChange?.(v);
  };
  const text = manual || auto;

  const handleAuto = async () => {
    if (!japanese || generating) return;
    setGenerating(true);
    setError('');
    try {
      const translated = await onAuto(japanese, context);
      onChange({ manual: '', auto: translated });
      setVisible(true);
      onCommit?.(translated);
    } catch (err) {
      setError(err?.message || '自動生成翻譯失敗，請稍後再試。');
    } finally {
      setGenerating(false);
    }
  };

  const handleManualKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onCommit?.();
    }
  };

  return (
    <div className="translation-section">
      <div className="translation-toolbar">
        <button type="button" className="btn" onClick={handleAuto} disabled={generating || !japanese}>
          {generating ? '生成中…' : '自動生成翻譯'}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => setVisible((v) => !v)}>
          {visible ? '隱藏翻譯' : '顯示翻譯'}
        </button>
      </div>

      {error && <div className="error-text">{error}</div>}

      {visible && (
        <div className="translation-body">
          <input
            type="text"
            className="translation-manual-input"
            value={manual}
            placeholder="手動輸入翻譯，按 Enter 完成…"
            onChange={(e) => onChange({ manual: e.target.value, auto })}
            onKeyDown={handleManualKeyDown}
          />
          <div className="translation-text">{text || '尚無翻譯'}</div>
        </div>
      )}
    </div>
  );
}
