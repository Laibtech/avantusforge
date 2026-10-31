"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Copy,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  AlertTriangle,
  Info,
  X,
  Edit2,
  Save,
  Check,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  RefreshCw,
  ArrowRightLeft,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface MediaReference {
  entityType: string;
  name: string;
  id?: string | number;
}

interface MediaItem {
  path: string;
  name: string;
  category: string;
  sizeBytes: number;
  modifiedAt: string;
  isDeletable: boolean;
  references: MediaReference[];
  hasReferences: boolean;
  alt_text?: string;
  caption?: string;
  uploaded_by?: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selection for bulk actions
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Details drawer item
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);

  // Single Delete Confirmation Dialog
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<MediaItem | null>(null);
  const [singleDeleteRefs, setSingleDeleteRefs] = useState<MediaReference[] | null>(null);
  const [replacementPath, setReplacementPath] = useState<string>("");

  // Bulk Delete Confirmation Dialog
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkBlockedList, setBulkBlockedList] = useState<{ filename: string; name: string; references: MediaReference[] }[]>([]);

  // Metadata editing
  const [editingMetadata, setEditingMetadata] = useState<{ filename: string; alt_text: string; caption: string } | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.success && data.media) {
        setMedia(data.media);
      }
    } catch (e) {
      console.error("Failed to load media", e);
      setFeedback({ type: "error", text: "Failed to connect to media storage repository." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopy = (pathStr: string) => {
    navigator.clipboard.writeText(pathStr);
    setCopiedPath(pathStr);
    setTimeout(() => setCopiedPath(null), 2500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", selectedCategory === "All" ? "Uploads" : selectedCategory);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Uploaded '${file.name}' successfully! Path: ${data.url}`,
        });
        await fetchMedia();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to upload file." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error uploading file to server." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Selection toggle
  const toggleSelectOne = (pathStr: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(pathStr)) {
        next.delete(pathStr);
      } else {
        next.add(pathStr);
      }
      return next;
    });
  };

  const toggleSelectAll = (itemsToSelect: MediaItem[]) => {
    if (selectedItems.size === itemsToSelect.length && itemsToSelect.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(itemsToSelect.map((m) => m.path)));
    }
  };

  // Open Single Delete Dialog
  const handleOpenSingleDelete = (item: MediaItem) => {
    setSingleDeleteTarget(item);
    setSingleDeleteRefs(item.hasReferences ? item.references : null);
    // Suggest first different media item as replacement candidate
    const otherMedia = media.filter((m) => m.path !== item.path && !m.path.endsWith(".pdf"));
    setReplacementPath(otherMedia[0]?.path || "");
  };

  // Execute Single Delete
  const handleConfirmSingleDelete = async (force: boolean) => {
    if (!singleDeleteTarget) return;

    try {
      setIsDeleting(true);
      setFeedback(null);

      const res = await fetch(`/api/admin/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: singleDeleteTarget.path,
          force,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Immediate UI removal upon server confirmation
        setMedia((prev) => prev.filter((m) => m.path !== singleDeleteTarget.path));
        setSelectedItems((prev) => {
          const next = new Set(prev);
          next.delete(singleDeleteTarget.path);
          return next;
        });
        setFeedback({ type: "success", text: `Successfully deleted '${singleDeleteTarget.name}' from storage and media registry.` });
        if (activeItem?.path === singleDeleteTarget.path) {
          setActiveItem(null);
        }
        setSingleDeleteTarget(null);
        setSingleDeleteRefs(null);
      } else if (data.blocked || res.status === 409) {
        // Requirement 8: display references and guide resolution
        setSingleDeleteRefs(data.references || singleDeleteTarget.references || []);
        setFeedback({
          type: "error",
          text: `Deletion blocked: '${singleDeleteTarget.name}' is actively referenced. Please reassign references or confirm force deletion.`,
        });
      } else {
        setFeedback({ type: "error", text: data.message || "Deletion failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Network error during deletion: " + err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  // Reassign / Replace References
  const handleReassignReferences = async () => {
    if (!singleDeleteTarget || !replacementPath) return;

    try {
      setIsReassigning(true);
      setFeedback(null);

      const res = await fetch("/api/admin/media/replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPath: singleDeleteTarget.path,
          newPath: replacementPath,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: "success",
          text: `${data.message} You can now safely delete '${singleDeleteTarget.name}'.`,
        });
        // Clear references locally
        setSingleDeleteRefs([]);
        setSingleDeleteTarget((prev) => prev ? { ...prev, hasReferences: false, references: [] } : null);
        // Refresh full media catalog
        fetchMedia();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to reassign references." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Error reassigning references: " + err.message });
    } finally {
      setIsReassigning(false);
    }
  };

  // Open Bulk Delete Dialog
  const handleOpenBulkDelete = () => {
    if (selectedItems.size === 0) return;

    const selectedMediaList = media.filter((m) => selectedItems.has(m.path));
    const blocked = selectedMediaList
      .filter((m) => m.hasReferences)
      .map((m) => ({ filename: m.path, name: m.name, references: m.references }));

    setBulkBlockedList(blocked);
    setBulkDeleteModalOpen(true);
  };

  // Execute Bulk Delete
  const handleConfirmBulkDelete = async (force: boolean) => {
    if (selectedItems.size === 0) return;

    try {
      setIsDeleting(true);
      setFeedback(null);

      let targetPaths: string[] = Array.from(selectedItems);

      // If not forced and there are blocked files, delete only unused
      if (!force && bulkBlockedList.length > 0) {
        const blockedSet = new Set(bulkBlockedList.map((b) => b.filename));
        targetPaths = targetPaths.filter((p) => !blockedSet.has(p));
      }

      if (targetPaths.length === 0) {
        setFeedback({
          type: "error",
          text: "All selected assets are actively referenced. Please reassign references or select force delete.",
        });
        setIsDeleting(false);
        return;
      }

      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filenames: targetPaths,
          force,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const deletedSet = new Set(targetPaths);
        setMedia((prev) => prev.filter((m) => !deletedSet.has(m.path)));
        setSelectedItems((prev) => {
          const next = new Set(prev);
          targetPaths.forEach((p) => next.delete(p));
          return next;
        });

        setFeedback({
          type: "success",
          text: `Bulk deletion complete: ${data.message}`,
        });
        setBulkDeleteModalOpen(false);
        setBulkBlockedList([]);
        if (activeItem && deletedSet.has(activeItem.path)) {
          setActiveItem(null);
        }
      } else if (data.blocked || res.status === 409) {
        setBulkBlockedList(data.blockedFiles || []);
        setFeedback({
          type: "error",
          text: data.message || "Some assets are actively referenced.",
        });
      } else {
        setFeedback({ type: "error", text: data.message || "Bulk deletion failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Network error during bulk deletion: " + err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!editingMetadata) return;
    try {
      setSavingMeta(true);
      const res = await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMetadata),
      });
      const data = await res.json();
      if (data.success) {
        setMedia((prev) =>
          prev.map((m) =>
            m.name === editingMetadata.filename
              ? { ...m, alt_text: editingMetadata.alt_text, caption: editingMetadata.caption }
              : m
          )
        );
        if (activeItem && activeItem.name === editingMetadata.filename) {
          setActiveItem({
            ...activeItem,
            alt_text: editingMetadata.alt_text,
            caption: editingMetadata.caption,
          });
        }
        setEditingMetadata(null);
        setFeedback({ type: "success", text: "Alt text & caption metadata saved." });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to update metadata." });
    } finally {
      setSavingMeta(false);
    }
  };

  const categories = [
    "All",
    "Uploads",
    "Portfolio Projects",
    "Team Photos",
    "Brand & Verification",
    "Country Flags",
  ];

  const filteredMedia = media.filter((m) => {
    const matchesCat = selectedCategory === "All" || m.category === selectedCategory;
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.path.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedCount = selectedItems.size;
  const isAllSelected = filteredMedia.length > 0 && selectedCount === filteredMedia.length;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header Banner */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Media Library" }]}
        eyebrow="Central Asset Management"
        title="Media Library & Asset Vault"
        description="Upload, inspect, replace, and safely delete assets with full dependency scanning across CMS pages, portfolio, services, and settings."
        badge={`${media.length} Stored Assets`}
        badgeColor="burgundy"
      >
        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={fetchMedia}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </AdminButton>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
            className="hidden"
          />
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            icon={Upload}
          >
            {uploading ? "Verifying & Uploading..." : "Upload Media Asset"}
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* Toast Feedback */}
      {feedback && (
        <AdminAlert
          variant={feedback.type}
          message={feedback.text}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Filter, Search & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EADFE3] shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#777078] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename or path..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleSelectAll(filteredMedia)}
              className="px-3 py-1.5 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-xs font-semibold text-[#4D4245] flex items-center gap-1.5 cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#74102E]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-[#777078]" />
              )}
              <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenBulkDelete}
              disabled={selectedCount === 0}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${selectedCount > 0
                  ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer shadow-2xs"
                  : "border-[#EADFE3] bg-[#FAF7F7] text-[#777078] opacity-50 cursor-not-allowed"
                }`}
              title="Bulk Delete selected media files"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Bulk Delete {selectedCount > 0 ? `(${selectedCount})` : ""}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-[#FAF7F7] p-1 rounded-xl border border-[#EADFE3]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === cat
                    ? "bg-[#74102E] text-white"
                    : "text-[#777078] hover:text-[#24151B]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center border border-[#EADFE3] rounded-xl overflow-hidden bg-[#FAF7F7]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#74102E] text-white" : "text-[#777078] hover:text-[#24151B]"
                }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#74102E] text-white" : "text-[#777078] hover:text-[#24151B]"
                }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar when items selected */}
      {selectedCount > 0 && (
        <div className="sticky top-20 z-30 p-3 bg-white rounded-xl border-2 border-[#74102E] shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#74102E] animate-pulse" />
            <div className="text-xs font-bold text-[#24151B]">
              {selectedCount} media asset{selectedCount === 1 ? "" : "s"} selected
            </div>
            <button
              type="button"
              onClick={() => setSelectedItems(new Set())}
              className="text-[11px] text-[#74102E] hover:underline cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenBulkDelete}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete ({selectedCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* MEDIA DISPLAY */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#777078] bg-white rounded-2xl border border-[#EADFE3]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#74102E] mb-2" />
          <span>Loading media catalog...</span>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-[#EADFE3] text-xs text-[#777078] space-y-2">
          <FolderOpen className="w-8 h-8 text-[#777078] mx-auto opacity-50" />
          <p className="font-bold text-[#24151B]">No media files match your filter</p>
          <p className="text-[11px] text-[#777078]">Upload a new image or change the search query.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const isSelected = selectedItems.has(item.path);

            return (
              <div
                key={item.path}
                className={`bg-white rounded-xl border transition-all flex flex-col justify-between group overflow-hidden shadow-2xs ${isSelected ? "border-[#74102E] ring-2 ring-[#74102E]/20" : "border-[#EADFE3] hover:border-[#74102E]/40"
                  }`}
              >
                {/* Image Preview Container */}
                <div className="relative aspect-square w-full bg-[#FAF7F7] border-b border-[#EADFE3] flex items-center justify-center p-2 overflow-hidden">
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectOne(item.path);
                    }}
                    className="absolute top-2 left-2 z-20 p-1 rounded-md bg-white/90 border border-[#EADFE3] text-[#24151B] hover:bg-white shadow-2xs cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#74102E]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#777078]" />
                    )}
                  </button>

                  {/* Usage Badge */}
                  {item.hasReferences && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="px-1.5 py-0.5 rounded bg-[#4A0B20] text-white text-[9px] font-mono font-bold shadow-2xs">
                        IN USE ({item.references.length})
                      </span>
                    </div>
                  )}

                  <div
                    onClick={() => setActiveItem(item)}
                    className="w-full h-full relative cursor-pointer flex items-center justify-center"
                  >
                    {item.path.endsWith(".pdf") ? (
                      <div className="text-center p-4">
                        <FileText className="w-8 h-8 text-rose-600 mx-auto mb-1" />
                        <span className="text-xs font-mono font-bold text-rose-600 block">PDF</span>
                        <span className="text-[10px] text-[#777078] truncate block mt-0.5">{item.name}</span>
                      </div>
                    ) : (
                      <Image
                        src={item.path}
                        alt={item.alt_text || item.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    )}
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-3 space-y-1">
                  <div
                    onClick={() => setActiveItem(item)}
                    className="text-xs font-bold text-[#24151B] truncate cursor-pointer hover:text-[#74102E]"
                    title={item.name}
                  >
                    {item.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#777078]">
                    <span>{(item.sizeBytes / 1024).toFixed(0)} KB</span>
                    <span className="truncate max-w-[80px]">{item.category}</span>
                  </div>
                </div>

                {/* Action Bar with Visible Delete Button */}
                <div className="p-2.5 pt-0 flex items-center justify-between border-t border-[#EADFE3]/50 mt-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.path)}
                      className="p-1 rounded text-[#777078] hover:text-[#74102E] hover:bg-[#FAF7F7] cursor-pointer"
                      title="Copy relative path"
                    >
                      {copiedPath === item.path ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className="text-[11px] font-bold text-[#74102E] hover:underline cursor-pointer px-1"
                    >
                      Details
                    </button>
                  </div>

                  {/* REQUIREMENT 1: CLEARLY VISIBLE DELETE BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleOpenSingleDelete(item)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 transition-colors cursor-pointer border border-rose-200"
                    title={`Delete ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(filteredMedia)}
                      className="cursor-pointer"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#74102E]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#777078]" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 w-16">Preview</th>
                  <th className="py-3 px-4 font-bold">File Name &amp; Path</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Size</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFE3]">
                {filteredMedia.map((item) => {
                  const isSelected = selectedItems.has(item.path);

                  return (
                    <tr
                      key={item.path}
                      className={`hover:bg-[#FAF7F7]/60 transition-colors ${isSelected ? "bg-[#FBF4F6]/40" : ""
                        }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(item.path)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#74102E]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#777078]" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        <div
                          onClick={() => setActiveItem(item)}
                          className="w-12 h-12 relative rounded-lg bg-[#FAF7F7] border border-[#EADFE3] overflow-hidden flex items-center justify-center cursor-pointer"
                        >
                          {item.path.endsWith(".pdf") ? (
                            <FileText className="w-5 h-5 text-rose-600" />
                          ) : (
                            <Image
                              src={item.path}
                              alt={item.alt_text || item.name}
                              fill
                              className="object-contain p-1"
                              sizes="48px"
                            />
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div
                          onClick={() => setActiveItem(item)}
                          className="font-bold text-[#24151B] hover:text-[#74102E] cursor-pointer truncate max-w-xs"
                          title={item.name}
                        >
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#777078] flex items-center gap-1.5 mt-0.5">
                          <span>{item.path}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.path)}
                            className="hover:text-[#74102E] cursor-pointer"
                            title="Copy path"
                          >
                            {copiedPath === item.path ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-[#4D4245]">{item.category}</td>

                      <td className="py-3 px-4 font-mono text-[#4D4245]">
                        {(item.sizeBytes / 1024).toFixed(1)} KB
                      </td>

                      <td className="py-3 px-4">
                        {item.hasReferences ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FBF4F6] text-[#74102E] border border-[#EADFE3]">
                            In Use ({item.references.length})
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Unreferenced
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveItem(item)}
                            className="px-2.5 py-1 rounded-md bg-[#FAF7F7] hover:bg-[#FBF4F6] text-[#74102E] font-semibold text-[11px] border border-[#EADFE3] cursor-pointer"
                          >
                            Details
                          </button>

                          {/* REQUIREMENT 1: VISIBLE DELETE BUTTON IN ROW */}
                          <button
                            type="button"
                            onClick={() => handleOpenSingleDelete(item)}
                            className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 transition-colors cursor-pointer border border-rose-200"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILS & PREVIEW PANEL (DRAWER / MODAL) */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <div className="truncate pr-4">
                <span className="text-[10px] font-mono uppercase font-bold text-[#74102E]">
                  Asset Inspector
                </span>
                <h2 className="text-base font-bold text-[#24151B] truncate">{activeItem.name}</h2>
                <span className="text-[11px] font-mono text-[#777078]">{activeItem.path}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="text-[#777078] hover:text-[#24151B] cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="relative w-full h-56 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] overflow-hidden flex items-center justify-center p-3">
              {activeItem.path.endsWith(".pdf") ? (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-12 h-12 text-rose-600 mx-auto" />
                  <div className="font-bold text-[#24151B]">PDF Document Asset</div>
                  <a
                    href={activeItem.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#74102E] hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <Image
                  src={activeItem.path}
                  alt={activeItem.alt_text || activeItem.name}
                  fill
                  className="object-contain p-2"
                />
              )}
            </div>

            {/* Technical Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF7F7] p-3.5 rounded-xl border border-[#EADFE3]">
              <div>
                <span className="text-[#777078] block text-[10px] font-mono uppercase font-bold">File Size:</span>
                <span className="font-mono font-bold text-[#24151B]">
                  {(activeItem.sizeBytes / 1024).toFixed(1)} KB
                </span>
              </div>
              <div>
                <span className="text-[#777078] block text-[10px] font-mono uppercase font-bold">Category:</span>
                <span className="font-bold text-[#24151B]">{activeItem.category}</span>
              </div>
              <div>
                <span className="text-[#777078] block text-[10px] font-mono uppercase font-bold">Uploaded By:</span>
                <span className="font-bold text-[#24151B]">{activeItem.uploaded_by || "System"}</span>
              </div>
              <div>
                <span className="text-[#777078] block text-[10px] font-mono uppercase font-bold">Last Modified:</span>
                <span className="font-mono text-[#24151B]">
                  {new Date(activeItem.modifiedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Active Usage References Section */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#24151B] block">
                Active System References ({activeItem.references.length})
              </span>
              {activeItem.references.length === 0 ? (
                <div className="text-xs p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero active references detected. This asset is completely safe to delete.</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeItem.references.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-[#24151B]">{r.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FBF4F6] text-[#74102E] border border-[#EADFE3] font-bold">
                        {r.entityType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alt Text & Caption Form */}
            <div className="space-y-3 pt-2 border-t border-[#EADFE3]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#24151B] block">
                Accessibility Alt Text &amp; Caption
              </span>
              <div>
                <label className="text-[11px] text-[#777078] block mb-1">Alt Text</label>
                <input
                  type="text"
                  defaultValue={activeItem.alt_text || ""}
                  onChange={(e) =>
                    setEditingMetadata({
                      filename: activeItem.name,
                      alt_text: e.target.value,
                      caption: editingMetadata?.caption || activeItem.caption || "",
                    })
                  }
                  placeholder="Describe image for screen readers & SEO"
                  className="w-full px-3 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs focus:outline-none focus:border-[#74102E]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#777078] block mb-1">Caption</label>
                <input
                  type="text"
                  defaultValue={activeItem.caption || ""}
                  onChange={(e) =>
                    setEditingMetadata({
                      filename: activeItem.name,
                      alt_text: editingMetadata?.alt_text || activeItem.alt_text || "",
                      caption: e.target.value,
                    })
                  }
                  placeholder="Optional editorial caption"
                  className="w-full px-3 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs focus:outline-none focus:border-[#74102E]"
                />
              </div>

              {editingMetadata && (
                <button
                  type="button"
                  onClick={handleSaveMetadata}
                  disabled={savingMeta}
                  className="w-full py-2 rounded-lg bg-[#74102E] text-white text-xs font-bold hover:bg-[#4A0B20] transition-colors cursor-pointer"
                >
                  {savingMeta ? "Saving..." : "Save Metadata"}
                </button>
              )}
            </div>

            {/* REQUIREMENT 1: VISIBLE DELETE BUTTON IN DETAILS PANEL */}
            <div className="pt-3 border-t border-[#EADFE3] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCopy(activeItem.path)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-xs font-semibold text-[#4D4245] cursor-pointer"
              >
                {copiedPath === activeItem.path ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const it = activeItem;
                  handleOpenSingleDelete(it);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete This Media Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE DELETE CONFIRMATION & RESOLUTION DIALOG */}
      {singleDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#EADFE3]">
              <div className="flex items-center gap-3 text-rose-700">
                <span className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                  <Trash2 className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#24151B]">Confirm Asset Deletion</h2>
                  <span className="text-[11px] font-mono text-[#777078]">{singleDeleteTarget.name}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSingleDeleteTarget(null);
                  setSingleDeleteRefs(null);
                }}
                className="text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail and metadata snippet */}
            <div className="flex items-center gap-3 p-3 bg-[#FAF7F7] rounded-xl border border-[#EADFE3]">
              <div className="w-14 h-14 relative rounded-lg bg-white border border-[#EADFE3] overflow-hidden shrink-0 flex items-center justify-center">
                {singleDeleteTarget.path.endsWith(".pdf") ? (
                  <FileText className="w-6 h-6 text-rose-600" />
                ) : (
                  <Image
                    src={singleDeleteTarget.path}
                    alt={singleDeleteTarget.name}
                    fill
                    className="object-contain p-1"
                  />
                )}
              </div>
              <div className="text-xs space-y-0.5 truncate">
                <div className="font-bold text-[#24151B] truncate">{singleDeleteTarget.name}</div>
                <div className="text-[10px] text-[#777078]">
                  {(singleDeleteTarget.sizeBytes / 1024).toFixed(1)} KB • {singleDeleteTarget.category}
                </div>
                <div className="text-[10px] font-mono text-[#777078] truncate">{singleDeleteTarget.path}</div>
              </div>
            </div>

            {/* CASE 1: Active References Detected (Requirements 6, 7, 8) */}
            {singleDeleteRefs && singleDeleteRefs.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5 text-xs text-rose-900">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>In-Use Warning: {singleDeleteRefs.length} Active System Reference(s)</span>
                  </div>
                  <p className="text-[11px] text-rose-800/90 leading-relaxed">
                    This file is referenced by active website pages or settings. Deleting it will cause broken image links.
                  </p>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto bg-[#FAF7F7] p-2.5 rounded-xl border border-[#EADFE3] text-xs">
                  {singleDeleteRefs.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-[#EADFE3]/50 last:border-0">
                      <span className="font-bold text-[#24151B] truncate pr-2">{r.name}</span>
                      <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-white text-[#74102E] border border-[#EADFE3] shrink-0">
                        {r.entityType}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Option 1: Reassign / Replace References */}
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                    <span>Recommended: Reassign References First</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Select a replacement asset to take over all references so the original file can be safely removed without broken links:
                  </p>
                  <select
                    value={replacementPath}
                    onChange={(e) => setReplacementPath(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-medium text-[#24151B] focus:outline-none"
                  >
                    {media
                      .filter((m) => m.path !== singleDeleteTarget.path && !m.path.endsWith(".pdf"))
                      .map((m) => (
                        <option key={m.path} value={m.path}>
                          {m.name} ({m.category})
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleReassignReferences}
                    disabled={isReassigning || !replacementPath}
                    className="w-full py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isReassigning ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Reassigning All References...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Reassign References to Selected Media</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action buttons with force option */}
                <div className="pt-2 border-t border-[#EADFE3] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSingleDeleteTarget(null);
                      setSingleDeleteRefs(null);
                    }}
                    className="px-3.5 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-xs font-bold text-[#4D4245] cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmSingleDelete(true)}
                    disabled={isDeleting}
                    className="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Force Delete Anyway</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* CASE 2: Unused File (Safe to Delete) */
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero active references found. This asset is completely safe to delete.</span>
                </div>

                <p className="text-xs text-[#777078] leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-[#24151B]">{singleDeleteTarget.name}</strong>? This file will be removed from server storage and the media registry. This action is irreversible.
                </p>

                <div className="pt-3 border-t border-[#EADFE3] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleDeleteTarget(null)}
                    className="px-4 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-xs font-bold text-[#4D4245] cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmSingleDelete(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting from Storage...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm Permanent Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION DIALOG (Requirements 2, 3, 11) */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-[#EADFE3]">
              <div className="flex items-center gap-3 text-rose-700">
                <span className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                  <Trash2 className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#24151B]">Confirm Bulk Asset Deletion</h2>
                  <span className="text-[11px] font-mono text-[#777078]">
                    {selectedCount} item{selectedCount === 1 ? "" : "s"} selected for removal
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                className="text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#777078] leading-relaxed">
              You are about to delete <strong className="text-[#24151B]">{selectedCount}</strong> media asset(s). This operation removes the files from filesystem storage and clears their database records. This action is irreversible.
            </p>

            {bulkBlockedList.length > 0 ? (
              <div className="space-y-2.5">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>{bulkBlockedList.length} of {selectedCount} files have active references:</span>
                  </div>
                  <div className="space-y-1 max-h-28 overflow-y-auto pt-1">
                    {bulkBlockedList.map((b) => (
                      <div key={b.filename} className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-bold text-[#24151B]">{b.name}</span>
                        <span className="text-amber-800">({b.references.length} ref{b.references.length === 1 ? "" : "s"})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EADFE3] flex flex-col sm:flex-row items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkDeleteModalOpen(false)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs font-bold text-[#4D4245] cursor-pointer"
                  >
                    Cancel
                  </button>

                  {selectedCount > bulkBlockedList.length && (
                    <button
                      type="button"
                      onClick={() => handleConfirmBulkDelete(false)}
                      disabled={isDeleting}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <span>Delete {selectedCount - bulkBlockedList.length} Unused Files Only</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleConfirmBulkDelete(true)}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Force Delete All ({selectedCount})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All {selectedCount} selected assets are unreferenced and safe to delete.</span>
                </div>

                <div className="pt-2 border-t border-[#EADFE3] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkDeleteModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs font-bold text-[#4D4245] cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmBulkDelete(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting Selected Files...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm Bulk Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
