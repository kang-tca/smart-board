import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { compressData, decompressData, generateId, validateAndMigrateItems } from '../lib/utils';
import { loadData, saveData, deleteData } from '../lib/db';
import { CanvasItem, SaveMetadata, Transform } from '../types';

const ITEMS_STORAGE_KEY = 'pdf-canvas-items';
const TRANSFORM_STORAGE_KEY = 'pdf-canvas-transform';
const SAVES_LIST_KEY = 'pdf-canvas-saves-list';
const BACKGROUND_COLOR_STORAGE_KEY = 'pdf-canvas-background-color';
const GRID_OPACITY_STORAGE_KEY = 'pdf-canvas-grid-opacity';

export const useCloudStorage = (
    currentUser: any,
    getCurrentState: () => { items: CanvasItem[], transform: Transform },
    setItems: (items: CanvasItem[]) => void,
    setTransform: (transform: Transform) => void,
    setBackgroundColor: (color: string) => void,
    setGridOpacity: (opacity: number) => void,
    setStatusMessage: (msg: { text: string; type: 'success' | 'error' } | null) => void,
    setIsProcessingCloud: (id: string | null) => void
) => {
    const [savesList, setSavesList] = useState<SaveMetadata[]>([]);
    const [currentFileId, setCurrentFileId] = useState<string | null>(null);
    const [saveName, setSaveName] = useState('');

    const fetchSavesList = useCallback(async () => {
        try {
            if (currentUser) {
                const { data, error } = await supabase.from('canvas_saves')
                    .select('id, name, last_modified')
                    .eq('user_id', currentUser.id)
                    .order('last_modified', { ascending: false });

                if (error) throw error;

                const formatted = data.map(d => ({
                    id: d.id,
                    name: d.name,
                    lastModified: d.last_modified
                }));
                setSavesList(formatted);
                return formatted;
            } else {
                const list = await loadData<SaveMetadata[]>(SAVES_LIST_KEY) || [];
                setSavesList(list);
                return list;
            }
        } catch (error) {
            console.error("Failed to fetch saves list:", error);
            return [];
        }
    }, [currentUser]);

    const handleSave = async (targetId: string | null = null, currentSaveName: string) => {
        if (!currentSaveName.trim()) return;

        setIsProcessingCloud('save-button');
        setStatusMessage(null);
        try {
            const { items, transform } = getCurrentState();
            const lastModified = Date.now();
            const jsonString = JSON.stringify({ items, transform });
            const compressedBase64 = compressData(jsonString);

            if (currentUser) {
                let saveId = targetId;

                if (!targetId) {
                    const { data: existing } = await supabase.from('canvas_saves')
                        .select('id')
                        .eq('user_id', currentUser.id)
                        .eq('name', currentSaveName)
                        .single();

                    if (existing) {
                        if (!window.confirm(`Cloud: A save with the name "${currentSaveName}" already exists. Do you want to overwrite it?`)) {
                            setIsProcessingCloud(null);
                            return;
                        }
                        saveId = existing.id;
                    } else {
                        saveId = generateId();
                    }
                }

                const { error: saveError } = await supabase.from('canvas_saves').upsert({
                    id: saveId,
                    user_id: currentUser.id,
                    name: currentSaveName,
                    last_modified: lastModified,
                    packed_data: compressedBase64
                });
                if (saveError) throw saveError;

                setCurrentFileId(saveId!);
                setSaveName(currentSaveName);
                await fetchSavesList();

            } else {
                // Fallback local save
                const currentList = await fetchSavesList();
                let saveId = targetId || generateId(); // Use target if provided, else new
                let isOverwriting = false;

                if (!targetId) {
                    const existingSave = currentList.find(s => s.name === currentSaveName);
                    if (existingSave) {
                        if (!window.confirm(`Local: A save with the name "${currentSaveName}" already exists. Do you want to overwrite it?`)) {
                            setIsProcessingCloud(null);
                            return;
                        }
                        saveId = existingSave.id;
                        isOverwriting = true;
                    }
                } else {
                    isOverwriting = true;
                }

                const newSave: SaveMetadata = { id: saveId, name: currentSaveName, lastModified };

                const newList = isOverwriting
                    ? currentList.map(s => s.id === saveId ? newSave : s)
                    : [...currentList, newSave];

                await saveData(`save-items-${saveId}`, items);
                await saveData(`save-transform-${saveId}`, transform);
                await saveData(SAVES_LIST_KEY, newList);

                setSavesList(newList);
                setCurrentFileId(saveId);
                setSaveName(currentSaveName);
            }

            setStatusMessage({ text: targetId ? 'Overwritten successfully!' : 'Saved successfully!', type: 'success' });
            return true;
        } catch (error: any) {
            console.error("Failed to save:", error);
            setStatusMessage({ text: `Save failed: ${error.message || 'Unknown error'}`, type: 'error' });
            return false;
        } finally {
            setIsProcessingCloud(null);
        }
    };

    const handleLoad = async (id: string) => {
        if (window.confirm('Are you sure you want to load this canvas? Any unsaved changes will be lost.')) {
            setIsProcessingCloud(id);
            setStatusMessage(null);
            try {
                let loadedItems, loadedTransform;
                let loadedName = '';

                if (currentUser) {
                    const { data, error } = await supabase.from('canvas_saves')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error || !data) throw new Error("Save not found in cloud.");

                    loadedName = data.name;
                    let finalPackedData = data.packed_data || '';

                    const jsonString = decompressData(finalPackedData);
                    const parsed = JSON.parse(jsonString);
                    loadedItems = parsed.items;
                    loadedTransform = parsed.transform;

                } else {
                    loadedItems = await loadData<any[]>(`save-items-${id}`);
                    loadedTransform = await loadData<Transform>(`save-transform-${id}`);
                    // Fallback name retrieval
                    const currentList = await loadData<SaveMetadata[]>(SAVES_LIST_KEY) || [];
                    const found = currentList.find(s => s.id === id);
                    if (found) loadedName = found.name;
                }

                const itemsToLoad = validateAndMigrateItems(loadedItems, setStatusMessage);
                setItems(itemsToLoad);

                if (loadedTransform) {
                    setTransform(loadedTransform);
                } else {
                    setTransform({ scale: 1, x: 0, y: 0 });
                }

                setCurrentFileId(id);
                setSaveName(loadedName);

                setStatusMessage({ text: 'Loaded successfully!', type: 'success' });
            } catch (error) {
                console.error("Failed to load:", error);
                setStatusMessage({ text: 'Load failed.', type: 'error' });
            } finally {
                setIsProcessingCloud(null);
            }
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            setIsProcessingCloud(id);
            setStatusMessage(null);
            try {
                if (currentUser) {
                    const { error } = await supabase.from('canvas_saves').delete().eq('id', id);
                    if (error) throw error;
                    await fetchSavesList();
                    if (currentFileId === id) {
                        setCurrentFileId(null);
                        setSaveName('');
                    }
                } else {
                    await deleteData(`save-items-${id}`);
                    await deleteData(`save-transform-${id}`);

                    const currentList = await loadData<SaveMetadata[]>(SAVES_LIST_KEY) || [];
                    const newList = currentList.filter(s => s.id !== id);
                    await saveData(SAVES_LIST_KEY, newList);
                    setSavesList(newList);
                    if (currentFileId === id) {
                        setCurrentFileId(null);
                        setSaveName('');
                    }
                }

                setStatusMessage({ text: 'Deleted successfully.', type: 'success' });
            } catch (error) {
                console.error("Failed to delete:", error);
                setStatusMessage({ text: 'Delete failed.', type: 'error' });
            } finally {
                setIsProcessingCloud(null);
            }
        }
    };

    return {
        savesList,
        currentFileId,
        saveName,
        setSaveName,
        fetchSavesList,
        handleSave,
        handleLoad,
        handleDelete
    };
};
