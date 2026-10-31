"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Search, Upload, Check, Image as ImageIcon, RefreshCw } from "lucide-react";

interface MediaPickerItem {
  path: string;
  name: string;
  category: string;
  sizeBytes: number;
  alt_text?: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: { url: string; alt?: string }) => void;
  currentUrl?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaPickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<MediaPickerItem | null>(null);
  const [customAlt, setCustomAlt] = useState("");

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.success && data.media) {
        setMedia(data.media);
        if (currentUrl) {
          const match = data.media.find((m: MediaPickerItem) => m.path === currentUrl);
          if (match) {
            setSelectedItem(match);
            setCustomAlt(match.alt_text || "");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "Uploads");

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        const newItem: MediaPickerItem = {
          path: data.url,
          name: data.filename,
          category: "Uploads",
          sizeBytes: file.size,
          alt_text: file.name.replace(/\.[^/.]+$/, ""),
        };
        setMedia((prev) => [newItem, ...prev]);
        setSelectedItem(newItem);
        setCustomAlt(newItem.alt_text || "");
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const categories = ["All", "Uploads", "Portfolio Projects", "Team Photos", "Brand & Verification"];

  const filtered = media.filter((m) => {
    const matchesCat = selectedCategory === "All" || m.category === selectedCategory;
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.path.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleConfirm = () => {
    if (!selectedItem) return;
    onSelect({
      url: selectedItem.path,
      alt: customAlt || selectedItem.alt_text || selectedItem.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E8DDE0] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DDE0] flex items-center justify-between bg-[#FCFAF8]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#F7EEF1] text-[#750F2C]">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#191416]">
                Select Image from Media Library
              </h2>
              <p className="text-xs text-[#6F6568]">
                Choose an existing managed asset or upload a new image directly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6F6568] hover:bg-[#F2ECEE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 border-b border-[#E8DDE0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#8C7E83] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E8DDE0] text-xs focus:outline-none focus:border-[#750F2C]"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E8DDE0] text-xs text-[#191416] bg-white focus:outline-none focus:border-[#750F2C]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#750F2C] hover:bg-[#52091E] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "Uploading..." : "Upload New Asset"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="py-20 text-center text-xs text-[#8C7E83]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#750F2C] mb-2" />
              <span>Loading media repository...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-xs text-[#8C7E83] space-y-1">
              <ImageIcon className="w-8 h-8 mx-auto text-[#8C7E83] opacity-40" />
              <p className="font-semibold text-[#191416]">No media assets match your query</p>
              <p>Upload a new image or change filter parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((item) => {
                const isSelected = selectedItem?.path === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      setSelectedItem(item);
                      setCustomAlt(item.alt_text || item.name);
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border text-left transition-all group cursor-pointer ${
                      isSelected
                        ? "border-[#750F2C] ring-2 ring-[#750F2C] shadow-md scale-[1.02]"
                        : "border-[#E8DDE0] hover:border-[#750F2C]/50 hover:shadow-2xs"
                    }`}
                  >
                    <Image
                      src={item.path}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, 20vw"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#750F2C] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-[10px] text-white truncate">
                      {item.name}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Image Configuration Footer */}
        <div className="p-4 border-t border-[#E8DDE0] bg-[#FCFAF8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3">
            {selectedItem ? (
              <>
                <div className="w-10 h-10 relative rounded-lg overflow-hidden border border-[#E8DDE0] bg-white shrink-0">
                  <Image src={selectedItem.path} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-mono text-[#6F6568] truncate block">
                    {selectedItem.path}
                  </span>
                  <input
                    type="text"
                    value={customAlt}
                    onChange={(e) => setCustomAlt(e.target.value)}
                    placeholder="Enter image alt text..."
                    className="w-full text-xs px-2.5 py-1 rounded border border-[#E8DDE0] bg-white focus:outline-none focus:border-[#750F2C] text-[#191416]"
                  />
                </div>
              </>
            ) : (
              <span className="text-xs text-[#8C7E83] italic">
                Select an image above to preview and attach.
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E8DDE0] bg-white hover:bg-[#F2ECEE] text-xs font-semibold text-[#4D4245] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedItem}
              className="px-5 py-2 rounded-xl bg-[#750F2C] hover:bg-[#52091E] text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              Attach Selected Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
