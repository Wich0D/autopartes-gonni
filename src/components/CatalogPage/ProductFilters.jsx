"use client";

import { FaSearch, FaUndo } from "react-icons/fa";
import SearchableSelect from "./SearchableSelect";

export default function ProductFilters({
  searchQuery,
  setSearchQuery,
  selectedBrand,
  setSelectedBrand,
  selectedCategory,
  setSelectedCategory,
  enableYearRange,
  setEnableYearRange,
  minYear,
  setMinYear,
  maxYear,
  setMaxYear,
  minLimitYear,
  maxLimitYear,
  brands,
  categories,
  resetFilters,
  setCurrentPage,
}) {
  const rangeSpan = maxLimitYear - minLimitYear;
  const leftPercent = rangeSpan > 0 ? ((minYear - minLimitYear) / rangeSpan) * 100 : 0;
  const rightPercent = rangeSpan > 0 ? 100 - (((maxYear - minLimitYear) / rangeSpan) * 100) : 0;
  const midYearThreshold = minLimitYear + (rangeSpan / 2);

  return (
    <div className="flex flex-col gap-4 bg-neutral-50/60 border border-neutral-100 p-5 rounded-2xl shadow-sm">
      {/* Row 1: Search and Selects */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por modelo, código, categoría..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white shadow-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition text-sm text-neutral-800"
          />
        </div>

        {/* Brand Dropdown */}
        <div>
          <SearchableSelect
            value={selectedBrand}
            onChange={(val) => {
              setSelectedBrand(val);
              setCurrentPage(1);
            }}
            options={brands}
            placeholder="Todas las marcas"
            emptyMessage="No se encontraron marcas"
          />
        </div>

        {/* Category Dropdown & Clear Filters */}
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <div className="flex-1">
            <SearchableSelect
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              options={categories}
              placeholder="Todas las categorías"
              emptyMessage="No se encontraron categorías"
            />
          </div>

          {/* Reset button */}
          {(searchQuery || selectedBrand || selectedCategory || enableYearRange) && (
            <button
              onClick={resetFilters}
              title="Restablecer filtros"
              className="px-3.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-xl transition flex items-center justify-center cursor-pointer shadow-sm"
            >
              <FaUndo size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Checkbox & Year Range Bar */}
      <div className="border-t border-neutral-200/50 pt-3 flex flex-col md:flex-row md:items-center gap-6 w-full">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-neutral-700 select-none shrink-0">
          <input
            type="checkbox"
            checked={enableYearRange}
            onChange={(e) => {
              setEnableYearRange(e.target.checked);
              setCurrentPage(1);
            }}
            className="w-4.5 h-4.5 text-red-600 border-neutral-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer accent-red-600"
          />
          <span>Seleccionar rango de años</span>
        </label>

        {enableYearRange && (
          <div className="flex-1 flex items-center w-full animate-fadeIn select-none">
            {/* Left Label: Shows minYear, updates dynamically */}
            <span className="text-black/90 text-xs font-black rounded-xl shrink-0 min-w-[70px] text-center">
              {minYear}
            </span>

            {/* Dual Range Bar Container */}
            <div className="relative flex-1 flex items-center h-6">
              {/* Background track */}
              <div className="absolute left-0 right-0 h-1.5 bg-neutral-200 rounded-full" />

              {/* Active highlighted range */}
              <div
                className="absolute h-1.5 bg-red-600 rounded-full"
                style={{
                  left: `${leftPercent}%`,
                  right: `${rightPercent}%`
                }}
              />

              {/* Min Year Range Input */}
              <input
                type="range"
                min={minLimitYear}
                max={maxLimitYear}
                value={minYear}
                onChange={(e) => {
                  const val = Math.min(parseInt(e.target.value), maxYear);
                  setMinYear(val);
                  setCurrentPage(1);
                }}
                className="absolute pointer-events-none appearance-none w-full bg-transparent h-1 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:pointer-events-auto cursor-pointer"
                style={{ zIndex: minYear > midYearThreshold ? 12 : 11 }}
              />

              {/* Max Year Range Input */}
              <input
                type="range"
                min={minLimitYear}
                max={maxLimitYear}
                value={maxYear}
                onChange={(e) => {
                  const val = Math.max(parseInt(e.target.value), minYear);
                  setMaxYear(val);
                  setCurrentPage(1);
                }}
                className="absolute pointer-events-none appearance-none w-full bg-transparent h-1 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:pointer-events-auto cursor-pointer"
                style={{ zIndex: 10 }}
              />
            </div>

            {/* Right Label: Shows maxYear, updates dynamically */}
            <span className="text-black/90 text-xs font-black rounded-xl shrink-0 min-w-[70px] text-center">
              {maxYear}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
