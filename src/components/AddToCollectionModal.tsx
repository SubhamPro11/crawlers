"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import {
  fetchUserCollections,
  createUserCollection,
  toggleToolInCollection,
  fetchCollectionToolIds,
  UserCollection
} from "@/lib/userCollections";

interface AddToCollectionModalProps {
  toolId: string;
  toolName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToCollectionModal({
  toolId,
  toolName,
  isOpen,
  onClose
}: AddToCollectionModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [membershipMap, setMembershipMap] = useState<Record<string, boolean>>({});
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadCollections = useCallback(async (activeUser: User) => {
    setIsLoading(true);
    const cols = await fetchUserCollections(activeUser.id);
    setCollections(cols);

    // Check membership for each collection
    const map: Record<string, boolean> = {};
    await Promise.all(
      cols.map(async (col) => {
        const toolIds = await fetchCollectionToolIds(col.id);
        map[col.id] = toolIds.includes(toolId);
      })
    );
    setMembershipMap(map);
    setIsLoading(false);
  }, [toolId]);

  useEffect(() => {
    if (!isOpen) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        loadCollections(activeUser);
      } else {
        setIsLoading(false);
      }
    });
  }, [isOpen, loadCollections]);

  if (!isOpen) return null;

  // Signed out check
  if (!user && !isLoading) {
    onClose();
    window.dispatchEvent(new CustomEvent("open-signin-modal"));
    return null;
  }

  const handleToggle = async (collectionId: string) => {
    const isAdded = await toggleToolInCollection(collectionId, toolId);
    setMembershipMap(prev => ({ ...prev, [collectionId]: isAdded }));
    
    // Dispatch toast
    const colName = collections.find(c => c.id === collectionId)?.name || "collection";
    const msg = isAdded 
      ? `Added "${toolName}" to ${colName}` 
      : `Removed "${toolName}" from ${colName}`;
    window.dispatchEvent(new CustomEvent("toast", { detail: { message: msg, type: "success" } }));
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCollectionName.trim()) return;

    const created = await createUserCollection(user.id, newCollectionName.trim());
    if (created) {
      setNewCollectionName("");
      setIsCreating(false);
      // Automatically add tool to newly created collection
      await toggleToolInCollection(created.id, toolId);
      loadCollections(user);
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: `Created collection "${created.name}" and added "${toolName}"`, type: "success" } }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#212623] bg-[#0E100F] shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-[#212623] bg-[#131615] px-4 py-3 select-none">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
            <span className="text-[#8FBF3F]">&gt;</span>
            <span>add_to_collection //</span>
            <span className="text-slate-400 font-normal truncate max-w-[180px]">[{toolName}]</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-xs font-mono px-2 py-1 cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#8FBF3F] animate-pulse" />
              <span>fetching_user_collections...</span>
            </div>
          ) : (
            <>
              {collections.length === 0 && !isCreating ? (
                <div className="py-6 text-center space-y-3">
                  <p className="text-xs text-slate-400 font-sans">
                    You don&apos;t have any personal collections yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#8FBF3F] px-4 py-2 text-xs font-bold text-slate-950 hover:bg-[#7ba235] transition-colors cursor-pointer"
                  >
                    + Create First Collection
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {collections.map((col) => {
                    const isChecked = !!membershipMap[col.id];
                    return (
                      <button
                        type="button"
                        key={col.id}
                        onClick={() => handleToggle(col.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                          isChecked
                            ? "border-[#8FBF3F]/40 bg-[#8FBF3F]/10 text-white"
                            : "border-[#212623] bg-[#131615] hover:border-[#8FBF3F]/25 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-mono transition-colors ${
                            isChecked
                              ? "border-[#8FBF3F] bg-[#8FBF3F] text-slate-950 font-bold"
                              : "border-[#212623] bg-[#0D0F0E]"
                          }`}>
                            {isChecked ? "✓" : ""}
                          </span>
                          <span className="text-xs font-semibold font-sans">{col.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {isChecked ? "added" : "+ add"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Inline Create Input */}
              {isCreating ? (
                <form onSubmit={handleCreateCollection} className="pt-2 border-t border-[#212623] space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="new-collection-modal-name"
                      name="new_collection_name"
                      aria-label="New collection name"
                      type="text"
                      placeholder="Collection name (e.g. My Writing Stack)"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      autoFocus
                      className="flex-1 rounded-lg border border-[#212623] bg-[#131615] px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#8FBF3F] font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!newCollectionName.trim()}
                      className="rounded-lg bg-[#8FBF3F] hover:bg-[#7ba235] disabled:opacity-50 text-slate-950 font-bold px-3 py-2 text-xs font-sans transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="rounded-lg border border-[#212623] bg-[#131615] text-slate-400 hover:text-white px-3 py-2 text-xs font-sans transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : collections.length > 0 ? (
                <div className="pt-2 border-t border-[#212623] flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="text-xs font-mono text-[#8FBF3F] hover:underline cursor-pointer"
                  >
                    + new_collection
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-[#212623] bg-[#131615] px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer font-sans"
                  >
                    Done
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
