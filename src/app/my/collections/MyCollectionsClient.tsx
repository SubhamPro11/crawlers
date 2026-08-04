"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import {
  fetchUserCollections,
  createUserCollection,
  renameUserCollection,
  deleteUserCollection,
  fetchCollectionToolIds,
  toggleToolInCollection,
  UserCollection
} from "@/lib/userCollections";
import { mockDb, Tool } from "@/data/mockDb";
import ToolCard from "@/components/ToolCard";
import { TerminalLoader } from "@/components/TerminalLoader";

export default function MyCollectionsClient() {
  const [user, setUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<UserCollection | null>(null);
  const [collectionTools, setCollectionTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToolsLoading, setIsToolsLoading] = useState(false);

  // New & edit collection inline form states
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loadCollections = useCallback(async (activeUser: User) => {
    setIsLoading(true);
    const cols = await fetchUserCollections(activeUser.id);
    setCollections(cols);
    if (cols.length > 0) {
      // Preserve selection if available, otherwise select first
      setSelectedCollection(prev => {
        if (prev) {
          const match = cols.find(c => c.id === prev.id);
          return match || cols[0];
        }
        return cols[0];
      });
    } else {
      setSelectedCollection(null);
      setCollectionTools([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        loadCollections(activeUser);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        loadCollections(activeUser);
      } else {
        setCollections([]);
        setSelectedCollection(null);
        setCollectionTools([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadCollections]);

  const loadCollectionTools = useCallback(async (colId: string) => {
    setIsToolsLoading(true);
    const toolIds = await fetchCollectionToolIds(colId);
    if (toolIds.length === 0) {
      setCollectionTools([]);
      setIsToolsLoading(false);
      return;
    }
    const allTools = await mockDb.getTools();
    setCollectionTools(allTools.filter(t => toolIds.includes(t.id)));
    setIsToolsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    if (!selectedCollection) return;
    Promise.resolve().then(() => {
      if (active) {
        loadCollectionTools(selectedCollection.id);
      }
    });

    return () => {
      active = false;
    };
  }, [selectedCollection, loadCollectionTools]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCollectionName.trim()) return;

    const created = await createUserCollection(user.id, newCollectionName.trim());
    if (created) {
      setNewCollectionName("");
      setIsCreating(false);
      await loadCollections(user);
      setSelectedCollection(created);
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: `Created collection "${created.name}"`, type: "success" } }));
    }
  };

  const handleRenameCollection = async (collectionId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const success = await renameUserCollection(collectionId, editName.trim());
    if (success && user) {
      setEditingCollectionId(null);
      await loadCollections(user);
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Collection renamed", type: "success" } }));
    }
  };

  const handleDeleteCollection = async (collectionId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the collection "${name}"?`)) return;

    const success = await deleteUserCollection(collectionId);
    if (success && user) {
      await loadCollections(user);
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: `Deleted collection "${name}"`, type: "info" } }));
    }
  };

  const handleRemoveToolFromCollection = async (toolId: string, toolName: string) => {
    if (!selectedCollection) return;
    await toggleToolInCollection(selectedCollection.id, toolId);
    if (user) {
      await loadCollections(user);
      loadCollectionTools(selectedCollection.id);
    }
    window.dispatchEvent(new CustomEvent("toast", { detail: { message: `Removed "${toolName}" from collection`, type: "info" } }));
  };

  if (isLoading) {
    return <TerminalLoader message="loading_personal_collections" />;
  }

  // Signed out state
  if (!user) {
    return (
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="max-w-md mx-auto rounded-2xl border border-[#212623] bg-[#131615] p-8 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#212623] bg-[#0D0F0E] text-[#8FBF3F] font-mono font-bold mx-auto text-lg">
            &gt;_
          </div>
          <h1 className="font-serif text-2xl font-medium text-white">Personal Collections</h1>
          <p className="text-slate-400 text-xs font-sans leading-relaxed">
            Sign in to create private tool stacks, organize workflows, and save personal recommendations.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-signin-modal"))}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#8FBF3F] px-5 text-xs font-bold text-slate-950 hover:bg-[#7ba235] transition-colors cursor-pointer"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="border-b border-[#212623] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8FBF3F]">
            &gt; user_workspace //
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-tight mt-1">
            Personal Collections
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Private stacks and saved tools organized by custom workflows
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#8FBF3F] px-4 py-2 text-xs font-bold text-slate-950 hover:bg-[#7ba235] transition-colors cursor-pointer self-start sm:self-auto font-sans"
        >
          + Create Collection
        </button>
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <form onSubmit={handleCreateCollection} className="mb-8 rounded-xl border border-[#8FBF3F]/30 bg-[#131615] p-4 flex flex-col sm:flex-row items-center gap-3">
          <input
            id="new-collection-name-input"
            name="collection_name"
            aria-label="New collection name"
            type="text"
            placeholder="Collection name (e.g. My AI Writing Stack)"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            autoFocus
            className="flex-1 w-full rounded-lg border border-[#212623] bg-[#0D0F0E] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#8FBF3F] font-sans"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={!newCollectionName.trim()}
              className="rounded-lg bg-[#8FBF3F] hover:bg-[#7ba235] disabled:opacity-50 text-slate-950 font-bold px-4 py-2 text-xs transition-colors cursor-pointer font-sans"
            >
              Save Collection
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-lg border border-[#212623] bg-[#0D0F0E] text-slate-400 hover:text-white px-3 py-2 text-xs transition-colors cursor-pointer font-sans"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Content Area */}
      {collections.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-[#131615] border border-[#212623] rounded-2xl font-sans max-w-xl mx-auto my-8 p-8 space-y-4">
          <div className="h-10 w-10 text-[#8FBF3F] mx-auto font-mono text-base flex items-center justify-center rounded-lg border border-[#212623] bg-[#0D0F0E]">
            &gt;_
          </div>
          <h3 className="text-base font-semibold text-white font-mono">no_collections_yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Organize tools into custom private collections for your projects, team stacks, or research workflows.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#8FBF3F] px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-[#7ba235] transition-colors cursor-pointer"
          >
            + Create Your First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar / Collection Selector */}
          <div className="lg:col-span-1 space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
              Your Collections ({collections.length})
            </div>
            <div className="space-y-1.5">
              {collections.map((col) => {
                const isSelected = selectedCollection?.id === col.id;
                const isEditing = editingCollectionId === col.id;

                if (isEditing) {
                  return (
                    <form
                      key={col.id}
                      onSubmit={(e) => handleRenameCollection(col.id, e)}
                      className="flex items-center gap-1 p-1 bg-[#131615] rounded-xl border border-[#8FBF3F]/40"
                    >
                      <input
                        id={`edit-collection-${col.id}`}
                        name="edit_collection_name"
                        aria-label="Edit collection name"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="w-full bg-[#0D0F0E] border border-[#212623] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#8FBF3F]"
                      />
                      <button type="submit" aria-label="Confirm rename" className="text-[#8FBF3F] text-xs px-1.5 font-bold">✓</button>
                      <button type="button" aria-label="Cancel rename" onClick={() => setEditingCollectionId(null)} className="text-slate-500 text-xs px-1">✕</button>
                    </form>
                  );
                }

                return (
                  <div
                    key={col.id}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-[#8FBF3F]/40 bg-[#8FBF3F]/10 text-white shadow-sm"
                        : "border-[#212623] bg-[#131615] hover:border-[#8FBF3F]/25 text-slate-300"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedCollection(col)}
                      className="flex-1 text-left truncate flex items-center justify-between cursor-pointer mr-2"
                    >
                      <span className="text-xs font-semibold font-sans truncate">{col.name}</span>
                      <span className="font-mono text-[10px] text-slate-500 ml-2 shrink-0">
                        {col.item_count} {col.item_count === 1 ? 'tool' : 'tools'}
                      </span>
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={() => { setEditingCollectionId(col.id); setEditName(col.name); }}
                        className="text-slate-400 hover:text-white text-[10px] font-mono px-1"
                        title="Rename"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(col.id, col.name)}
                        className="text-rose-400 hover:text-rose-300 text-[10px] font-mono px-1"
                        title="Delete"
                      >
                        del
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Panel / Selected Collection Tools */}
          <div className="lg:col-span-3 space-y-6">
            {selectedCollection && (
              <>
                <div className="flex items-center justify-between border-b border-[#212623] pb-4">
                  <div>
                    <h2 className="font-serif text-xl font-medium text-white flex items-center gap-2">
                      <span>{selectedCollection.name}</span>
                      <span className="text-xs font-mono text-[#8FBF3F] font-bold">
                        [{collectionTools.length} {collectionTools.length === 1 ? 'tool' : 'tools'}]
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingCollectionId(selectedCollection.id); setEditName(selectedCollection.name); }}
                      className="rounded border border-[#212623] bg-[#131615] px-2.5 py-1 text-xs text-slate-300 hover:text-white font-mono cursor-pointer transition-colors"
                    >
                      rename
                    </button>
                    <button
                      onClick={() => handleDeleteCollection(selectedCollection.id, selectedCollection.name)}
                      className="rounded border border-[#212623] bg-[#131615] px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 font-mono cursor-pointer transition-colors"
                    >
                      delete
                    </button>
                  </div>
                </div>

                {isToolsLoading ? (
                  <div className="py-12 text-center text-xs font-mono text-slate-500">
                    loading_collection_items...
                  </div>
                ) : collectionTools.length === 0 ? (
                  <div className="py-12 text-center bg-[#131615]/50 border border-[#212623] rounded-xl p-6 font-sans">
                    <p className="text-xs text-slate-400 mb-4">
                      This collection is empty. Add tools while browsing the directory by clicking the <span className="font-mono text-[#8FBF3F]">+</span> button on any tool card.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#8FBF3F] px-4 text-xs font-bold text-slate-950 hover:bg-[#7ba235] transition-colors"
                    >
                      Explore Tools &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {collectionTools.map((tool) => (
                      <div key={tool.id} className="relative group">
                        <ToolCard tool={tool} />
                        <button
                          onClick={() => handleRemoveToolFromCollection(tool.id, tool.name)}
                          className="absolute top-4 left-4 z-20 rounded border border-rose-500/40 bg-[#0E100F] px-2 py-0.5 text-[9px] font-mono text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 cursor-pointer"
                        >
                          remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
