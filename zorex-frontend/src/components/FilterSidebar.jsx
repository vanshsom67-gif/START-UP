import React, { useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORIES = [
  { label: "All", value: "All", icon: "✨" },
  { label: "Gym & Supplements", value: "Gym & Supplements", icon: "🏋️‍♂️" },
  { label: "Men's Clothing", value: "Men's Clothing", icon: "👕" },
  { label: "Women's Clothing", value: "Women's Clothing", icon: "👗" },
  { label: "Accessories", value: "Accessories", icon: "👜" },
  { label: "Footwear", value: "Footwear", icon: "👟" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
];

const RATING_OPTIONS = [
  { label: "4★ & above", value: 4 },
  { label: "3★ & above", value: 3 },
  { label: "2★ & above", value: 2 },
  { label: "All Ratings", value: 0 },
];

export default function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  productCount,
}) {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    rating: true,
    sort: true,
  });

  const toggle = (section) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const update = (key, value) => onFiltersChange({ ...filters, [key]: value });

  const resetAll = () =>
    onFiltersChange({
      category: "All",
      sort: "newest",
      minPrice: 0,
      maxPrice: 5000,
      minRating: 0,
    });

  const activeCount = [
    filters.category !== "All",
    filters.sort !== "newest",
    filters.minPrice > 0 || filters.maxPrice < 5000,
    filters.minRating > 0,
  ].filter(Boolean).length;

  const SectionHeader = ({ title, section }) => (
    <button
      className="filter-section-header"
      onClick={() => toggle(section)}
    >
      <span>{title}</span>
      {openSections[section] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="filter-overlay" onClick={onClose} />
      )}

      <aside className={`filter-sidebar ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="filter-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SlidersHorizontal size={18} />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="filter-active-badge">{activeCount}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {activeCount > 0 && (
              <button className="filter-clear-btn" onClick={resetAll}>
                Clear All
              </button>
            )}
            <button className="filter-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="filter-result-count">
          {productCount} products found
        </div>

        {/* Sort By */}
        <div className="filter-section">
          <SectionHeader title="Sort By" section="sort" />
          {openSections.sort && (
            <div className="filter-options">
              {SORT_OPTIONS.map((opt) => (
                <label key={opt.value} className="filter-radio-label">
                  <input
                    type="radio"
                    name="sort"
                    value={opt.value}
                    checked={filters.sort === opt.value}
                    onChange={() => update("sort", opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Category */}
        <div className="filter-section">
          <SectionHeader title="Category" section="category" />
          {openSections.category && (
            <div className="filter-options">
              {CATEGORIES.map((cat) => (
                <label key={cat.value} className="filter-radio-label">
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={filters.category === cat.value}
                    onChange={() => update("category", cat.value)}
                  />
                  <span>{cat.icon} {cat.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="filter-section">
          <SectionHeader title="Price Range" section="price" />
          {openSections.price && (
            <div className="filter-price-section">
              <div className="filter-price-inputs">
                <div className="filter-price-input-group">
                  <span>₹</span>
                  <input
                    type="number"
                    value={filters.minPrice}
                    min={0}
                    max={filters.maxPrice - 100}
                    onChange={(e) => update("minPrice", Number(e.target.value))}
                    placeholder="Min"
                  />
                </div>
                <span style={{ color: "#94a3b8" }}>—</span>
                <div className="filter-price-input-group">
                  <span>₹</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    min={filters.minPrice + 100}
                    max={10000}
                    onChange={(e) => update("maxPrice", Number(e.target.value))}
                    placeholder="Max"
                  />
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={5000}
                step={100}
                value={filters.maxPrice}
                onChange={(e) => update("maxPrice", Number(e.target.value))}
                className="price-range-slider"
              />
              <div className="filter-price-labels">
                <span>₹0</span>
                <span>₹5,000+</span>
              </div>
              {/* Quick price presets */}
              <div className="price-presets">
                {[
                  { label: "Under ₹500", min: 0, max: 500 },
                  { label: "₹500–₹1000", min: 500, max: 1000 },
                  { label: "₹1000–₹2000", min: 1000, max: 2000 },
                  { label: "Above ₹2000", min: 2000, max: 5000 },
                ].map((p) => (
                  <button
                    key={p.label}
                    className={`price-preset-btn ${
                      filters.minPrice === p.min && filters.maxPrice === p.max ? "active" : ""
                    }`}
                    onClick={() => onFiltersChange({ ...filters, minPrice: p.min, maxPrice: p.max })}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="filter-section">
          <SectionHeader title="Customer Rating" section="rating" />
          {openSections.rating && (
            <div className="filter-options">
              {RATING_OPTIONS.map((opt) => (
                <label key={opt.value} className="filter-radio-label">
                  <input
                    type="radio"
                    name="rating"
                    value={opt.value}
                    checked={filters.minRating === opt.value}
                    onChange={() => update("minRating", opt.value)}
                  />
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {opt.value > 0 && (
                      <span style={{ color: "#f59e0b", fontWeight: "700" }}>
                        {"★".repeat(opt.value)}
                      </span>
                    )}
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
