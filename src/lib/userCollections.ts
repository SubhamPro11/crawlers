import { supabase } from "@/lib/supabaseClient";

export interface UserCollection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface UserCollectionItem {
  collection_id: string;
  tool_id: string;
  added_at: string;
}

// LocalStorage helpers for mock/offline fallback
const LOCAL_COLLECTIONS_KEY = "crawlers_user_collections";
const LOCAL_ITEMS_KEY = "crawlers_user_collection_items";

const getLocalCollections = (): UserCollection[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_COLLECTIONS_KEY) || "[]");
  } catch {
    return [];
  }
};

const setLocalCollections = (cols: UserCollection[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_COLLECTIONS_KEY, JSON.stringify(cols));
};

const getLocalItems = (): UserCollectionItem[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ITEMS_KEY) || "[]");
  } catch {
    return [];
  }
};

const setLocalItems = (items: UserCollectionItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(items));
};

export async function fetchUserCollections(userId: string): Promise<UserCollection[]> {
  try {
    const { data, error } = await supabase
      .from("user_collections")
      .select("*, user_collection_items(tool_id)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((col: any) => ({
        id: col.id,
        user_id: col.user_id,
        name: col.name,
        created_at: col.created_at,
        updated_at: col.updated_at,
        item_count: Array.isArray(col.user_collection_items) ? col.user_collection_items.length : 0
      }));
    }
  } catch (err) {
    console.warn("Falling back to local user collections:", err);
  }

  // Local storage fallback
  const allLocal = getLocalCollections().filter(c => c.user_id === userId);
  const allItems = getLocalItems();
  return allLocal.map(col => ({
    ...col,
    item_count: allItems.filter(i => i.collection_id === col.id).length
  }));
}

export async function createUserCollection(userId: string, name: string): Promise<UserCollection | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  try {
    const { data, error } = await supabase
      .from("user_collections")
      .insert([{ user_id: userId, name: trimmed }])
      .select()
      .single();

    if (!error && data) {
      return { ...data, item_count: 0 };
    }
  } catch (err) {
    console.warn("Error creating collection via Supabase, using local fallback:", err);
  }

  // Local fallback
  const newCol: UserCollection = {
    id: `local-col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    name: trimmed,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 0
  };

  const current = getLocalCollections();
  setLocalCollections([newCol, ...current]);
  return newCol;
}

export async function renameUserCollection(collectionId: string, name: string): Promise<boolean> {
  const trimmed = name.trim();
  if (!trimmed) return false;

  try {
    const { error } = await supabase
      .from("user_collections")
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq("id", collectionId);

    if (!error) return true;
  } catch (err) {
    console.warn("Error updating collection name via Supabase:", err);
  }

  // Local fallback
  const current = getLocalCollections();
  const updated = current.map(c => c.id === collectionId ? { ...c, name: trimmed, updated_at: new Date().toISOString() } : c);
  setLocalCollections(updated);
  return true;
}

export async function deleteUserCollection(collectionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_collections")
      .delete()
      .eq("id", collectionId);

    if (!error) return true;
  } catch (err) {
    console.warn("Error deleting collection via Supabase:", err);
  }

  // Local fallback
  const currentCols = getLocalCollections().filter(c => c.id !== collectionId);
  setLocalCollections(currentCols);
  const currentItems = getLocalItems().filter(i => i.collection_id !== collectionId);
  setLocalItems(currentItems);
  return true;
}

export async function fetchCollectionToolIds(collectionId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("user_collection_items")
      .select("tool_id")
      .eq("collection_id", collectionId);

    if (!error && data) {
      return data.map(item => item.tool_id);
    }
  } catch (err) {
    console.warn("Error fetching collection items via Supabase:", err);
  }

  // Local fallback
  return getLocalItems()
    .filter(i => i.collection_id === collectionId)
    .map(i => i.tool_id);
}

export async function toggleToolInCollection(collectionId: string, toolId: string): Promise<boolean> {
  // Check existing
  const toolIds = await fetchCollectionToolIds(collectionId);
  const isMember = toolIds.includes(toolId);

  if (isMember) {
    // Remove
    try {
      const { error } = await supabase
        .from("user_collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("tool_id", toolId);
      if (!error) return false; // returns new isMember status (false)
    } catch (err) {
      console.warn("Error removing tool from collection via Supabase:", err);
    }

    const currentItems = getLocalItems().filter(i => !(i.collection_id === collectionId && i.tool_id === toolId));
    setLocalItems(currentItems);
    return false;
  } else {
    // Add
    try {
      const { error } = await supabase
        .from("user_collection_items")
        .insert([{ collection_id: collectionId, tool_id: toolId }]);
      if (!error) return true; // returns new isMember status (true)
    } catch (err) {
      console.warn("Error adding tool to collection via Supabase:", err);
    }

    const currentItems = getLocalItems();
    setLocalItems([{ collection_id: collectionId, tool_id: toolId, added_at: new Date().toISOString() }, ...currentItems]);
    return true;
  }
}
