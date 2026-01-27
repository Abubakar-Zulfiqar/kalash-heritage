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
  colors: string[];
  styles: string[];
  materials: string[];
  sizes: FilterSize[];
}

interface SelectedFilters {
  collection: string;
  size: string;
  color: string;
  style: string;
  material: string;
}

interface ProductFiltersProps {
  collectionSlug?: string; // If provided, filters are scoped to this collection
  onFiltersChange: (filters: SelectedFilters) => void;
  initialFilters?: Partial<SelectedFilters>;
  showCollectionFilter?: boolean; // Whether to show collection filter (false for collection pages)
}

export default function ProductFilters({
  collectionSlug,
  onFiltersChange,
  initialFilters = {},
  showCollectionFilter = true,
}: ProductFiltersProps) {
  const [filtersData, setFiltersData] = useState<FiltersData>({
    collections: [],
    colors: [],
    styles: [],
    materials: [],
    sizes: [],
  });
  const [loading, setLoading] = useState(true);

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    collection: initialFilters.collection || "",
    size: initialFilters.size || "",
    color: initialFilters.color || "",
    style: initialFilters.style || "",
    material: initialFilters.material || "",
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
          colors: data.colors || [],
          styles: data.styles || [],
          materials: data.materials || [],
          sizes: data.sizes || [],
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching filters:", error);
        setLoading(false);
      });
  }, [collectionSlug]);

  // Update initial filters when they change (e.g., from URL params)
  useEffect(() => {
    setSelectedFilters((prev) => ({
      ...prev,
      collection: initialFilters.collection || "",
      size: initialFilters.size || "",
      color: initialFilters.color || "",
      style: initialFilters.style || "",
      material: initialFilters.material || "",
    }));
  }, [initialFilters.collection, initialFilters.size, initialFilters.color, initialFilters.style, initialFilters.material]);

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
      color: "",
      style: "",
      material: "",
    };
    setSelectedFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters =
    selectedFilters.collection ||
    selectedFilters.size ||
    selectedFilters.color ||
    selectedFilters.style ||
    selectedFilters.material;

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
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Collection</h3>
          <ul className="space-y-2">
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
          </ul>
        </div>
      )}

      {/* Size Filter */}
      {filtersData.sizes.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
          <ul className="space-y-2">
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
          </ul>
        </div>
      )}

      {/* Color Filter */}
      {filtersData.colors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => updateFilter("color", "")}
                className={`text-sm transition-colors ${
                  selectedFilters.color === ""
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
            </li>
            {filtersData.colors.map((color) => (
              <li key={color}>
                <button
                  onClick={() => updateFilter("color", color)}
                  className={`text-sm transition-colors ${
                    selectedFilters.color === color
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {color}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Style Filter */}
      {filtersData.styles.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Style</h3>
          <ul className="space-y-2">
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
          </ul>
        </div>
      )}

      {/* Material Filter */}
      {filtersData.materials.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Material</h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => updateFilter("material", "")}
                className={`text-sm transition-colors ${
                  selectedFilters.material === ""
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
            </li>
            {filtersData.materials.map((material) => (
              <li key={material}>
                <button
                  onClick={() => updateFilter("material", material)}
                  className={`text-sm transition-colors ${
                    selectedFilters.material === material
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {material}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
