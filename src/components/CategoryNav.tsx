import React from 'react';
import { Menu, Tag, Flame, Shield, Truck, Smartphone, Laptop, Home, Keyboard, Lamp } from 'lucide-react';
import { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  selectedSubcategory: string;
  onSelectSubcategory: (sub: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  selectedBrand,
  onSelectBrand,
}) => {
  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <nav className="relative bg-slate-800 text-white text-sm px-4 sm:px-6 h-10 flex items-center space-x-4 sm:space-x-6 shrink-0 overflow-x-auto whitespace-nowrap shadow-sm">
      {/* All Products Button */}
      <button
        onClick={() => {
          onSelectCategory('');
          onSelectSubcategory('');
          onSelectBrand('');
        }}
        className={`flex items-center gap-1 font-bold cursor-pointer hover:border-white border border-transparent px-2.5 py-1 rounded transition-colors ${
          !selectedCategoryId && !selectedBrand
            ? 'bg-amber-400 text-slate-900 font-extrabold'
            : 'text-white'
        }`}
      >
        <Menu className="w-4 h-4" />
        <span>All</span>
      </button>

      {/* Category Items */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => {
              onSelectCategory(cat.id);
              onSelectSubcategory('');
              onSelectBrand('');
            }}
            className={`hover:border-white border border-transparent px-2.5 py-1 rounded transition-all text-xs sm:text-sm ${
              isSelected
                ? 'bg-amber-400 text-slate-900 font-bold'
                : 'text-white'
            }`}
          >
            {cat.name}
          </button>
        );
      })}

      <span className="text-slate-600">|</span>

      {/* Brand Highlights */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider pl-1">Brands:</span>
        {['IFB', 'ASUS', 'Apple', 'Samsung', 'Logitech', 'Sony'].map((brand) => (
          <button
            key={brand}
            onClick={() => {
              onSelectBrand(selectedBrand === brand ? '' : brand);
            }}
            className={`px-2 py-0.5 text-[11px] rounded transition-all border ${
              selectedBrand === brand
                ? 'bg-white text-slate-900 font-bold border-white'
                : 'border-slate-700 text-gray-300 hover:border-white hover:text-white'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Delivery Guarantee badge */}
      <div className="ml-auto hidden xl:flex items-center gap-2 text-amber-300 font-semibold text-xs">
        <Truck className="w-3.5 h-3.5 text-amber-400" />
        <span>Express Delivery Across India • WhatsApp Support</span>
      </div>

      {/* Subcategory Bar when a Category is selected */}
      {currentCategory && currentCategory.subcategories.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-700 px-6 py-1.5 flex items-center gap-2 overflow-x-auto text-xs z-30 shadow-md">
          <span className="text-amber-400 font-bold">
            {currentCategory.name}:
          </span>
          <button
            onClick={() => onSelectSubcategory('')}
            className={`px-2.5 py-0.5 rounded text-xs ${
              !selectedSubcategory ? 'bg-amber-400 text-slate-900 font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            All Subcategories
          </button>
          {currentCategory.subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => onSelectSubcategory(selectedSubcategory === sub ? '' : sub)}
              className={`px-2.5 py-0.5 rounded text-xs transition-all ${
                selectedSubcategory === sub
                  ? 'bg-amber-400 text-slate-900 font-bold'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
