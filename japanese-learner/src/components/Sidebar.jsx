export default function Sidebar({
  types,
  categories,
  typeFilter,
  categoryFilter,
  onTypeChange,
  onCategoryChange,
}) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">分類</h2>
      <div className="type-tabs">
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`type-tab ${typeFilter === t.id ? 'active' : ''}`}
            onClick={() => onTypeChange(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="category-list">
        <button
          type="button"
          className={`category-chip ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c.category}
            type="button"
            className={`category-chip ${categoryFilter === c.category ? 'active' : ''}`}
            onClick={() => onCategoryChange(c.category)}
          >
            {c.category}
            <span className="category-count">{c.count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
