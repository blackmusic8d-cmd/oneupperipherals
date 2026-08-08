import React from 'react';
import { Filter, X, Check, RotateCcw } from 'lucide-react';
import { Category } from '../types';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  selectedSubcategory: string;
  onSelectSubcategory: (sub: string) => void;
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  onResetFilters: () => void;
  allAvailableBrands: string[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  selectedBrands,
  onToggleBrand,
  minPrice,
  maxPrice,
  onPriceChange,
  inStockOnly,
  onToggleInStock,
  onResetFilters,
  allAvailableBrands,
}) => {
  return (
    <aside className="w-64 bg-white p-5 rounded-xl shadow-xs flex flex-col space-y-6 text-sm text-gray-900 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 border-gray-100">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-amber-600" /> Filter Options
        </h3>
        <button
          onClick={onResetFilters}
          className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 text-xs"
        >
          <RotateCcw className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Categories Selection */}
      <section>
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-500">Category</h3>
        <ul className="space-y-2 text-sm">
          <li
            onClick={() => {
              onSelectCategory('');
              onSelectSubcategory('');
            }}
            className={`cursor-pointer transition-colors ${
              !selectedCategoryId ? 'font-bold text-amber-700' : 'hover:text-amber-600 text-gray-700'
            }`}
          >
            All Categories
          </li>
          {categories.map((cat) => (
            <li key={cat.id} className="space-y-1">
              <div
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectSubcategory('');
                }}
                className={`cursor-pointer transition-colors ${
                  selectedCategoryId === cat.id ? 'font-bold text-amber-700' : 'hover:text-amber-600 text-gray-700'
                }`}
              >
                {cat.name}
              </div>

              {/* Subcategories */}
              {selectedCategoryId === cat.id && cat.subcategories.length > 0 && (
                <ul className="ml-3 space-y-1 pl-2 border-l-2 border-amber-300">
                  {cat.subcategories.map((sub) => (
                    <li
                      key={sub}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSubcategory(selectedSubcategory === sub ? '' : sub);
                      }}
                      className={`cursor-pointer text-xs transition-colors ${
                        selectedSubcategory === sub ? 'font-bold text-amber-800' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {sub}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Brand Filter */}
      <section className="border-t pt-4 border-gray-100">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-500">Brand</h3>
        <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-1">
          {allAvailableBrands.map((brand) => {
            const isChecked = selectedBrands.includes(brand);
            return (
              <label
                key={brand}
                className="flex items-center cursor-pointer select-none text-gray-700 hover:text-gray-900"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleBrand(brand)}
                  className="mr-2 rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                />
                <span className={isChecked ? 'font-bold text-amber-800' : ''}>{brand}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Price Range Filter */}
      <section className="border-t pt-4 border-gray-100 space-y-2">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Price Range (₹)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice || ''}
            onChange={(e) => onPriceChange(Number(e.target.value), maxPrice)}
            className="w-1/2 p-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice || ''}
            onChange={(e) => onPriceChange(minPrice, Number(e.target.value))}
            className="w-1/2 p-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </section>

      {/* Stock Toggle */}
      <section className="border-t pt-4 border-gray-100">
        <label className="flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className="mr-2 rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
          />
          <span className="font-semibold text-gray-700 text-xs">In Stock Only</span>
        </label>
      </section>

      {/* WhatsApp Order Footer section in Sidebar */}
      <section className="mt-auto border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400">Order via WhatsApp</p>
        <p className="font-bold text-sm text-gray-900">+91 98623 88771</p>
      </section>
    </aside>
  );
};
