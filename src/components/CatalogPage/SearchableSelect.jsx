"use client";

import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  emptyMessage = "No se encontraron opciones",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  // Sync display search term when value changes from outside
  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value || "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter((opt) =>
    (opt || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm(option);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-neutral-200 bg-white shadow-sm focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition text-sm cursor-text"
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") {
              onChange("");
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent focus:outline-none text-neutral-800 placeholder-neutral-400"
        />
        <div className="flex items-center gap-1 text-neutral-400 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-neutral-600 transition cursor-pointer"
            >
              <FaTimes size={12} />
            </button>
          )}
          <FaChevronDown
            size={12}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200">
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition cursor-pointer ${
                    value === opt ? "bg-red-50 text-red-700 font-semibold" : "text-neutral-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-neutral-500 text-center">
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
