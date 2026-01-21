"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

interface Collection {
  id: string;
  name: string;
  hasCategories: boolean;
}

interface Category {
  id: string;
  name: string;
  collectionId: string;
}

interface Size {
  id: string;
  name: string;
  collectionId?: string;
  categoryId?: string;
}

interface ProductFormProps {
  collections: Collection[];
  categories: Category[];
  sizes: Size[];
  initialData?: {
    id?: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    price: number;
    salePrice?: number;
    sizeId?: string;
    dimensions?: string;
    material?: string;
    color?: string;
    style?: string;
    origin?: string;
    pattern?: string;
    stock: number;
    inStock: boolean;
    featured: boolean;
    images: string[];
    thumbnail?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
}

export default function ProductForm({ collections, categories, sizes, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get initial collection and category based on initial sizeId
  const getInitialSelections = () => {
    if (initialData?.sizeId) {
      const size = sizes.find(s => s.id === initialData.sizeId);
      if (size) {
        if (size.categoryId) {
          const category = categories.find(c => c.id === size.categoryId);
          return {
            collectionId: category?.collectionId || "",
            categoryId: size.categoryId,
          };
        } else if (size.collectionId) {
          return {
            collectionId: size.collectionId,
            categoryId: "",
          };
        }
      }
    }
    return { collectionId: "", categoryId: "" };
  };

  const initialSelections = getInitialSelections();
  const [selectedCollectionId, setSelectedCollectionId] = useState(initialSelections.collectionId);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialSelections.categoryId);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    salePrice: initialData?.salePrice || "",
    sizeId: initialData?.sizeId || "",
    dimensions: initialData?.dimensions || "",
    material: initialData?.material || "",
    color: initialData?.color || "",
    style: initialData?.style || "",
    origin: initialData?.origin || "",
    pattern: initialData?.pattern || "",
    stock: initialData?.stock || 0,
    inStock: initialData?.inStock ?? true,
    featured: initialData?.featured || false,
    images: initialData?.images || [],
    thumbnail: initialData?.thumbnail || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Get the selected collection
  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  // Filter categories for the selected collection
  const filteredCategories = categories.filter(c => c.collectionId === selectedCollectionId);

  // Filter sizes based on selection
  const filteredSizes = sizes.filter(s => {
    if (selectedCollection?.hasCategories && selectedCategoryId) {
      return s.categoryId === selectedCategoryId;
    } else if (selectedCollectionId && !selectedCollection?.hasCategories) {
      return s.collectionId === selectedCollectionId;
    }
    return false;
  });

  // Reset category and size when collection changes
  useEffect(() => {
    if (!isEditing) {
      setSelectedCategoryId("");
      setFormData(prev => ({ ...prev, sizeId: "" }));
    }
  }, [selectedCollectionId, isEditing]);

  // Reset size when category changes
  useEffect(() => {
    if (!isEditing && selectedCollection?.hasCategories) {
      setFormData(prev => ({ ...prev, sizeId: "" }));
    }
  }, [selectedCategoryId, selectedCollection?.hasCategories, isEditing]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    const validFiles = fileArray.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload image");
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
        thumbnail: prev.thumbnail || uploadedUrls[0],
      }));

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
        thumbnail: prev.thumbnail || newImageUrl.trim(),
      }));
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        thumbnail: prev.thumbnail === prev.images[index] ? newImages[0] || "" : prev.thumbnail,
      };
    });
  };

  const handleSetThumbnail = (url: string) => {
    setFormData((prev) => ({ ...prev, thumbnail: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sizeId) {
      toast.error("Please select a size for this product");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/products/${initialData?.id}`
        : "/api/admin/products";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          salePrice: formData.salePrice ? Number(formData.salePrice) : null,
          stock: Number(formData.stock),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      toast.success(isEditing ? "Product updated successfully" : "Product created successfully");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU *
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Product Placement (Collection → Category → Size) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Placement</h2>
        <p className="text-sm text-gray-500 mb-4">Select where this product belongs in the catalog hierarchy.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection *
            </label>
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCollection?.hasCategories && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {filteredCategories.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">No categories in this collection.</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size *
            </label>
            <select
              value={formData.sizeId}
              onChange={(e) => setFormData((prev) => ({ ...prev, sizeId: e.target.value }))}
              required
              disabled={!selectedCollectionId || (selectedCollection?.hasCategories && !selectedCategoryId)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Size</option>
              {filteredSizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </select>
            {filteredSizes.length === 0 && selectedCollectionId && (!selectedCollection?.hasCategories || selectedCategoryId) && (
              <p className="text-xs text-yellow-600 mt-1">No sizes available. Create sizes first.</p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Stock</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Price (USD)
            </label>
            <input
              type="number"
              value={formData.salePrice}
              onChange={(e) => setFormData((prev) => ({ ...prev, salePrice: e.target.value }))}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock *
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData((prev) => ({ ...prev, inStock: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">In Stock</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
            <input
              type="text"
              value={formData.dimensions}
              onChange={(e) => setFormData((prev) => ({ ...prev, dimensions: e.target.value }))}
              placeholder="e.g., 280cm x 175cm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
              placeholder="e.g., Wool, Silk"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
              placeholder="e.g., Red, Blue"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <input
              type="text"
              value={formData.style}
              onChange={(e) => setFormData((prev) => ({ ...prev, style: e.target.value }))}
              placeholder="e.g., Oriental, Modern"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
            <input
              type="text"
              value={formData.pattern}
              onChange={(e) => setFormData((prev) => ({ ...prev, pattern: e.target.value }))}
              placeholder="e.g., Floral, Geometric"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData((prev) => ({ ...prev, origin: e.target.value }))}
              placeholder="e.g., Pakistan, Afghanistan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-6
            ${isDragging
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            }
            ${isUploading ? "pointer-events-none opacity-50" : ""}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-600 mb-1">
                <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, WebP or GIF (max 5MB each)
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          multiple
          className="hidden"
        />

        {/* Image Gallery */}
        {formData.images.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              {formData.images.length} image(s) - Click to set as thumbnail
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetThumbnail(url);
                    }}
                    className={`
                      relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer
                      ${formData.thumbnail === url ? "ring-2 ring-primary-500 ring-offset-2" : ""}
                    `}
                  >
                    <Image
                      src={url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {formData.thumbnail === url && (
                      <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                        Thumbnail
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual URL option */}
        <div className="pt-4 border-t border-gray-200">
          <details className="group">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Or add image by URL
            </summary>
            <div className="mt-3 flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Add
              </button>
            </div>
          </details>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
              placeholder="Leave empty to use product name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
              placeholder="Leave empty to use product description"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
