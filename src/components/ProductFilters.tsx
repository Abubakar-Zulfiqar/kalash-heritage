"use client";

import { useState, useEffect } from "react";

interface FilterSize {
  id: string;
  name: string;
  slug: string;
}

interface FilterCollection {
  id: string;
  name: string;
  slug: string;
}

interface FiltersData {
  collections: FilterCollection[];
  styles: string[];
  sizes: FilterSize[];
}

interface SelectedFilters {
  collection: string;
  size: string;
  style: string;
}

interface ProductFiltersProps {
  collectionSlug?: string;
  onFiltersChange: (filters: SelectedFilters) => void;
  initialFilters?: Partial<SelectedFilters>;
  showCollectionFilter?: boolean;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-semibold text-gray-900 mb-3 hover:text-primary-600 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {children}
        </ul>
      )}
    </div>
  );
}

export default function ProductFilters({
  collectionSlug,
  onFiltersChange,
  initialFilters = {},
  showCollectionFilter = true,
}: ProductFiltersProps) {
  const [filtersData, setFiltersData] = useState<FiltersData>({
    collections: [],
    styles: [],
    sizes: [],
  });
  const [loading, setLoading] = useState(true);

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    collection: initialFilters.collection || "",
    size: initialFilters.size || "",
    style: initialFilters.style || "",
  });

  // Fetch filter options from API
  useEffect(() => {
    const params = new URLSearchParams();
    if (collectionSlug) {
      params.append("collection", collectionSlug);
    }

    fetch(`/api/filters?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setFiltersData({
          collections: data.collections || [],
          styles: data.styles || [],
          sizes: data.sizes || [],
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching filters:", error);
        setLoading(false);
      });
  }, [collectionSlug]);

  // Update initial filters when they change
  useEffect(() => {
    setSelectedFilters((prev) => ({
      ...prev,
      collection: initialFilters.collection || "",
      size: initialFilters.size || "",
      style: initialFilters.style || "",
    }));
  }, [initialFilters.collection, initialFilters.size, initialFilters.style]);

  // Notify parent when filters change
  const updateFilter = (key: keyof SelectedFilters, value: string) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters: SelectedFilters = {
      collection: "",
      size: "",
      style: "",
    };
    setSelectedFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters =
    selectedFilters.collection ||
    selectedFilters.size ||
    selectedFilters.style;

  if (loading) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 w-1/3 mb-2"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-3 bg-gray-200 w-2/3"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Reset
          </button>
        )}
      </div>

      {/* Collection Filter */}
      {showCollectionFilter && filtersData.collections.length > 0 && (
        <CollapsibleSection title="Collection" defaultOpen={true}>
          <li>
            <button
              onClick={() => updateFilter("collection", "")}
              className={`text-sm transition-colors ${
                selectedFilters.collection === ""
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
          </li>
          {filtersData.collections.map((col) => (
            <li key={col.id}>
              <button
                onClick={() => updateFilter("collection", col.slug)}
                className={`text-sm transition-colors ${
                  selectedFilters.collection === col.slug
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {col.name}
              </button>
            </li>
          ))}
        </CollapsibleSection>
      )}

      {/* Size Filter */}
      {filtersData.sizes.length > 0 && (
        <CollapsibleSection title="Size" defaultOpen={true}>
          <li>
            <button
              onClick={() => updateFilter("size", "")}
              className={`text-sm transition-colors ${
                selectedFilters.size === ""
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
          </li>
          {filtersData.sizes.map((size) => (
            <li key={size.id}>
              <button
                onClick={() => updateFilter("size", size.slug)}
                className={`text-sm transition-colors ${
                  selectedFilters.size === size.slug
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {size.name}
              </button>
            </li>
          ))}
        </CollapsibleSection>
      )}

      {/* Style Filter */}
      {filtersData.styles.length > 0 && (
        <CollapsibleSection title="Style" defaultOpen={true}>
          <li>
            <button
              onClick={() => updateFilter("style", "")}
              className={`text-sm transition-colors ${
                selectedFilters.style === ""
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
          </li>
          {filtersData.styles.map((style) => (
            <li key={style}>
              <button
                onClick={() => updateFilter("style", style)}
                className={`text-sm transition-colors ${
                  selectedFilters.style === style
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {style}
              </button>
            </li>
          ))}
        </CollapsibleSection>
      )}

    </div>
  );
}
