
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { compressData, decompressData, validateAndMigrateItems, generateId } from './lib/utils';
import { useAuth } from './hooks/useAuth';
import { useCloudStorage } from './hooks/useCloudStorage';
import { useTranslation } from 'react-i18next';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PresentationToolbar } from './components/PresentationToolbar';
import { FileUploadButton } from './components/FileUploadButton';
import { CanvasItem, Tool, ToolOptions, Transform, SaveMetadata, ImageItem, TagItem, StickerItem, TextItem, YoutubeItem } from './types';
import { FloatingToolbar } from './components/FloatingToolbar';
import { Icon } from './components/Icon';
import { saveData, loadData, deleteData } from './lib/db';
import { supabase } from './lib/supabase'; // Import Supabase Client
import { Calculator } from './components/Calculator';
import { Timer } from './components/Timer';
import { PresenterRaffle } from './components/PresenterRaffle';
import { TagPanel } from './components/TagPanel';
import { Checklist } from './components/Checklist';
import { StudentClient } from './components/StudentClient';
import { ClassroomPanel } from './components/ClassroomPanel';

declare const pdfjsLib: any;
declare const jspdf: any;
declare const pako: any;

const ITEMS_STORAGE_KEY = 'pdf-canvas-items';
const TRANSFORM_STORAGE_KEY = 'pdf-canvas-transform';
const SAVES_LIST_KEY = 'pdf-canvas-saves-list';
const BACKGROUND_COLOR_STORAGE_KEY = 'pdf-canvas-background-color';
const GRID_OPACITY_STORAGE_KEY = 'pdf-canvas-grid-opacity';

const backgroundColors = [
    { name: 'Chalkboard', color: '#3A6B35' },
    { name: 'Off-white', color: '#F3F4F6' },
    { name: 'Black', color: '#000000' },
];








// Custom hook to manage state history for undo/redo
const useHistory = <T,>(initialState: T) => {
    const [state, setState] = useState({ history: [initialState], index: 0 });

    const set = useCallback((action: React.SetStateAction<T>) => {
        setState(prevState => {
            const currentState = prevState.history[prevState.index];
            const newState = typeof action === 'function'
                ? (action as (prevState: T) => T)(currentState)
                : action;

            // Prevent adding to history if state hasn't changed
            if (JSON.stringify(newState) === JSON.stringify(currentState)) {
                return prevState;
            }

            const newHistory = prevState.history.slice(0, prevState.index + 1);
            newHistory.push(newState);
            return { history: newHistory, index: newHistory.length - 1 };
        });
    }, []);

    const undo = useCallback(() => {
        setState(prevState => prevState.index > 0 ? { ...prevState, index: prevState.index - 1 } : prevState);
    }, []);

    const redo = useCallback(() => {
        setState(prevState => prevState.index < prevState.history.length - 1 ? { ...prevState, index: prevState.index + 1 } : prevState);
    }, []);

    const reset = useCallback((resetState: T) => {
        setState({ history: [resetState], index: 0 });
    }, []);

    return {
        state: state.history[state.index] || initialState,
        set,
        undo,
        redo,
        reset,
        canUndo: state.index > 0,
        canRedo: state.index < state.history.length - 1,
    };
};



const App: React.FC = () => {
    const { t, i18n } = useTranslation();

    // Check for Student Mode first
    const isStudentMode = new URLSearchParams(window.location.search).get('student') === 'true';

    const [isLoadedFromDB, setIsLoadedFromDB] = useState(false);
    const {
        state: items,
        set: setItems,
        undo,
        redo,
        reset: resetItemsHistory,
        canUndo,
        canRedo,
    } = useHistory<CanvasItem[]>([]);

    const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
    const [backgroundColor, setBackgroundColor] = useState<string>('#3A6B35'); // Chalkboard green default
    const [gridOpacity, setGridOpacity] = useState<number>(0);

    const [selectedTool, setSelectedTool] = useState<Tool>('select');
    const [toolOptions, setToolOptions] = useState<ToolOptions>({
        strokeColor: '#000000',
        strokeWidth: 4,
        fillColor: '#00000033',
        fontSize: 24,
        isBold: false,
        isItalic: false,
        stickerType: 'smile',
        stickerSize: 64,
    });
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

    // Cloud save/load state hook usage
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareableLink, setShareableLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [playingYoutubeId, setPlayingYoutubeId] = useState<string | null>(null);
    const [isProcessingCloud, setIsProcessingCloud] = useState<string | null>(null);

    const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Auth State using custom hook
    const { currentUser, isAuthReady, isLoginLoading, signIn, signUp, signOut } = useAuth();
    
    // Multi-touch Drawing Toggle
    const [isMultiTouchEnabled, setIsMultiTouchEnabled] = useState(false);

    const {
        savesList,
        currentFileId,
        saveName,
        setSaveName,
        setFileInfo,
        fetchSavesList,
        handleSave: hookHandleSave,
        handleLoad: hookHandleLoad,
        handleDelete: hookHandleDelete
    } = useCloudStorage(
        currentUser,
        useCallback(() => ({ items, transform }), [items, transform]),
        setItems,
        setTransform,
        setBackgroundColor,
        setGridOpacity,
        setStatusMessage,
        setIsProcessingCloud
    );
    const autoSaveMessage = useRef<string>('');
    const autoSaveMessageTimeoutRef = useRef<number | null>(null);
    const [autoSaveOpacity, setAutoSaveOpacity] = useState(0);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isTimerOpen, setIsTimerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPresenterRaffleOpen, setIsPresenterRaffleOpen] = useState(false);
    const [isTagPanelVisible, setIsTagPanelVisible] = useState(false);
    const [isChecklistVisible, setIsChecklistVisible] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isClassroomPanelOpen, setIsClassroomPanelOpen] = useState(false);

    // Refs for keyboard shortcuts
    const previousToolRef = useRef<Tool | null>(null);
    const isSpacePressedRef = useRef(false);

    // Refs for auto-save (to access state in interval without resetting)
    const itemsRef = useRef(items);
    const transformRef = useRef(transform);
    const currentFileIdRef = useRef(currentFileId);
    const saveNameRef = useRef(saveName);
    const lastSavedStateRef = useRef<string>('');

    useEffect(() => {
        itemsRef.current = items;
        transformRef.current = transform;
        currentFileIdRef.current = currentFileId;
        saveNameRef.current = saveName;
    }, [items, transform, currentFileId, saveName]);

    // Presentation mode state
    const [presentationState, setPresentationState] = useState<{
        item: ImageItem | null;
        preTransform: Transform | null;
        fitHeightTransform: Transform | null;
        fitWidthTransform: Transform | null;
        zoomMode: 'fitHeight' | 'fitWidth' | null;
    }>({ item: null, preTransform: null, fitHeightTransform: null, fitWidthTransform: null, zoomMode: null });
    const canvasWrapperRef = useRef<HTMLDivElement>(null);

    const [isGuest, setIsGuest] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');

    const handleLogout = async () => {
        if (window.confirm(t('modals.prompts.logout'))) {
            const { error } = await signOut();
            if (error) {
                setStatusMessage({ text: `Logout failed: ${error.message}`, type: 'error' });
            }
        }
    };

    const handleClassroomDrop = useCallback((itemData: { type: 'text' | 'image', content: string }) => {
        const viewportCenterX = (window.innerWidth / 2 - transform.x) / transform.scale;
        const viewportCenterY = (window.innerHeight / 2 - transform.y) / transform.scale;

        if (itemData.type === 'image') {
            const img = new Image();
            img.src = itemData.content;
            img.onload = () => {
                const newItem: ImageItem = {
                    id: generateId(),
                    type: 'image',
                    x: viewportCenterX - img.width / 2,
                    y: viewportCenterY - img.height / 2,
                    width: img.width,
                    height: img.height,
                    dataUrl: itemData.content,
                    zIndex: 0,
                    visible: true
                };
                setItems(prev => {
                    const maxZIndex = prev.length > 0 ? Math.max(...prev.map(i => i.zIndex)) : -1;
                    return [...prev, { ...newItem, zIndex: maxZIndex + 1 }];
                });
                setStatusMessage({ text: 'Student image added!', type: 'success' });
            }
        } else {
            const newItem: TextItem = {
                id: generateId(),
                type: 'text',
                text: itemData.content,
                x: viewportCenterX,
                y: viewportCenterY,
                fontSize: 24,
                fontFamily: 'sans-serif',
                color: '#000000',
                isBold: false,
                isItalic: false,
                width: 200, // Approximate
                height: 30,
                zIndex: 0,
                visible: true
            };
            setItems(prev => {
                const maxZIndex = prev.length > 0 ? Math.max(...prev.map(i => i.zIndex)) : -1;
                return [...prev, { ...newItem, zIndex: maxZIndex + 1 }];
            });
            setStatusMessage({ text: 'Student text added!', type: 'success' });
        }
    }, [transform, setItems]);

    const handleToolSelect = useCallback((newTool: Tool) => {
        const isDrawingOrTextTool = ['pen', 'rectangle', 'circle', 'triangle', 'pentagon', 'text'].includes(newTool);
        if (selectedTool === 'highlighter' && isDrawingOrTextTool) {
            setToolOptions(prev => ({
                ...prev,
                strokeColor: '#000000',
                fillColor: '#00000033',
                strokeWidth: 4,
            }));
        }

        if (newTool === 'highlighter') {
            setToolOptions(prev => ({
                ...prev,
                strokeColor: '#FBBF24', // Yellow
                fillColor: '#FBBF2433',
                strokeWidth: 30,
            }));
        }

        setSelectedTool(newTool);
    }, [selectedTool]);

    const handleExitPresentation = useCallback(() => {
        if (presentationState.preTransform) {
            setTransform(presentationState.preTransform);
        }
        setPresentationState({ item: null, preTransform: null, fitHeightTransform: null, fitWidthTransform: null, zoomMode: null });
    }, [presentationState.preTransform]);

    useEffect(() => {
        if (presentationState.item && !presentationState.fitHeightTransform) {
            const canvasWrapper = canvasWrapperRef.current;
            if (!canvasWrapper) return;

            const { clientWidth, clientHeight } = canvasWrapper;
            const { item } = presentationState;

            const padding = 0;
            const effectiveWidth = Math.max(clientWidth - padding * 2, 1);
            const effectiveHeight = Math.max(clientHeight - padding * 2, 1);

            const scaleX = effectiveWidth / item.width;
            const fitWidthTransform = {
                scale: scaleX,
                x: (clientWidth / 2) - (item.x + item.width / 2) * scaleX,
                y: (clientHeight / 2) - (item.y + item.height / 2) * scaleX,
            };

            const scaleY = effectiveHeight / item.height;
            const fitHeightTransform = {
                scale: scaleY,
                x: (clientWidth / 2) - (item.x + item.width / 2) * scaleY,
                y: (clientHeight / 2) - (item.y + item.height / 2) * scaleY,
            };

            const isVertical = item.height > item.width;
            const initialTransform = isVertical ? fitHeightTransform : fitWidthTransform;
            const initialZoomMode = isVertical ? 'fitHeight' : 'fitWidth';

            setPresentationState(prev => ({
                ...prev,
                fitHeightTransform,
                fitWidthTransform,
                zoomMode: isVertical ? initialZoomMode : null
            }));
            setTransform(initialTransform);
        }
    }, [presentationState.item, presentationState.fitHeightTransform, setTransform]);

    useEffect(() => {
        if (statusMessage) {
            const duration = statusMessage.type === 'error' ? 8000 : 3000;
            const timer = setTimeout(() => setStatusMessage(null), duration);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);

    const tagItems = items.filter((item): item is TagItem => item.type === 'tag');

    useEffect(() => {
        if (tagItems.length > 0 && !isTagPanelVisible) {
            setIsTagPanelVisible(true);
        }
    }, [tagItems.length, isTagPanelVisible]);

    useEffect(() => {
        const processSharedUrl = async () => {
            if (window.location.hash.startsWith('#sharedCanvas=')) {
                const sharedId = window.location.hash.substring(14);
                if (!sharedId) return;

                try {
                    if (window.confirm('You\'ve opened a shared canvas link. Do you want to load it? This will replace your current canvas.')) {
                        setStatusMessage({ text: 'Loading shared canvas...', type: 'success' });
                        const { data, error } = await supabase.from('shared_canvases').select('*').eq('id', sharedId).single();

                        if (!error && data) {
                            let finalPackedData = data.packed_data || '';

                            let sharedItems, sharedTransform;

                            if (finalPackedData) {
                                try {
                                    const jsonString = decompressData(finalPackedData);
                                    const parsed = JSON.parse(jsonString);
                                    sharedItems = parsed.items;
                                    sharedTransform = parsed.transform;
                                } catch (e) {
                                    console.error("Decompression failed", e);
                                    throw new Error("Failed to process shared data.");
                                }
                            } else {
                                sharedItems = data.items;
                                sharedTransform = data.transform;
                            }

                            const itemsToLoad = validateAndMigrateItems(sharedItems, setStatusMessage);
                            resetItemsHistory(itemsToLoad);
                            if (sharedTransform) setTransform(sharedTransform);
                            setStatusMessage({ text: 'Shared canvas loaded successfully!', type: 'success' });
                        } else {
                            throw new Error("Shared canvas not found.");
                        }
                    }
                } catch (error) {
                    console.error("Failed to load shared canvas from Firebase:", error);
                    setStatusMessage({ text: 'Failed to load shared canvas.', type: 'error' });
                } finally {
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            }
        };

        // Only load canvas data if authenticated or guest, and NOT in student mode
        if ((currentUser || isGuest) && !isStudentMode) {
            const loadCanvasState = async () => {
                try {
                    const savedItemsData = await loadData<any[]>(ITEMS_STORAGE_KEY);
                    const itemsToLoad = validateAndMigrateItems(savedItemsData, setStatusMessage);
                    resetItemsHistory(itemsToLoad);

                    const savedTransform = await loadData<Transform>(TRANSFORM_STORAGE_KEY);
                    if (savedTransform) {
                        setTransform(savedTransform);
                    }
                    const savedBackgroundColor = await loadData<string>(BACKGROUND_COLOR_STORAGE_KEY);
                    if (savedBackgroundColor) {
                        setBackgroundColor(savedBackgroundColor);
                    }
                    const savedGridOpacity = await loadData<number>(GRID_OPACITY_STORAGE_KEY);
                    if (savedGridOpacity !== null && savedGridOpacity !== undefined) {
                        setGridOpacity(savedGridOpacity);
                    }

                } catch (error) {
                    console.error("Failed to load canvas items from IndexedDB:", error);
                } finally {
                    setIsLoadedFromDB(true);
                    await processSharedUrl();
                }
            };
            loadCanvasState();
        }
    }, [resetItemsHistory, currentUser, isGuest, isStudentMode]);



    // Auto-save Effect
    useEffect(() => {
        if (!currentUser || isStudentMode) return;

        const intervalId = setInterval(async () => {
            const currentItems = itemsRef.current;
            const currentTransform = transformRef.current;

            if (!isLoadedFromDB || currentItems.length === 0) {
                return;
            }

            const currentStateString = JSON.stringify({ items: currentItems, transform: currentTransform });
            if (currentStateString === lastSavedStateRef.current) return; // Skip if no changes

            // 1. Local Backup (IndexedDB)
            try {
                await saveData(ITEMS_STORAGE_KEY, currentItems);
                await saveData(TRANSFORM_STORAGE_KEY, currentTransform);

                // UI feedback for local save (if not saving to cloud)
                if (!currentFileIdRef.current) {
                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    autoSaveMessage.current = `Local auto-save at ${time}`;
                    setAutoSaveOpacity(1);
                    if (autoSaveMessageTimeoutRef.current) clearTimeout(autoSaveMessageTimeoutRef.current);
                    autoSaveMessageTimeoutRef.current = window.setTimeout(() => setAutoSaveOpacity(0), 3000);
                }
            } catch (error) {
                console.error("Local auto-save failed:", error);
            }

            // 2. Cloud Sync (Firestore)
            const fileId = currentFileIdRef.current;
            const fileName = saveNameRef.current;
            const userId = currentUser.id;

            if (fileId && fileName) {
                try {
                    const compressedBase64 = compressData(currentStateString);
                    const lastModified = Date.now();

                    const { error: saveError } = await supabase.from('canvas_saves').upsert({
                        id: fileId,
                        user_id: currentUser.id, // Using id instead of uid
                        name: fileName,
                        last_modified: lastModified,
                        packed_data: compressedBase64
                    });
                    if (saveError) throw saveError;

                    lastSavedStateRef.current = currentStateString;

                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    autoSaveMessage.current = `Cloud saved at ${time}`;
                    setAutoSaveOpacity(1);
                    if (autoSaveMessageTimeoutRef.current) clearTimeout(autoSaveMessageTimeoutRef.current);
                    autoSaveMessageTimeoutRef.current = window.setTimeout(() => setAutoSaveOpacity(0), 3000);

                } catch (e) {
                    console.error("Cloud auto-save failed", e);
                    autoSaveMessage.current = 'Cloud save failed';
                    setAutoSaveOpacity(1);
                }
            } else {
                lastSavedStateRef.current = currentStateString;
            }
        }, 30000); // 30 seconds

        return () => {
            clearInterval(intervalId);
            if (autoSaveMessageTimeoutRef.current) {
                clearTimeout(autoSaveMessageTimeoutRef.current);
            }
        };
    }, [currentUser, isLoadedFromDB, isStudentMode]);

    useEffect(() => {
        if (isLoadedFromDB && currentUser && !isStudentMode) {
            saveData(BACKGROUND_COLOR_STORAGE_KEY, backgroundColor).catch(err => {
                console.error("Failed to save background color:", err);
            });
        }
    }, [backgroundColor, isLoadedFromDB, currentUser, isStudentMode]);

    useEffect(() => {
        if (isLoadedFromDB && currentUser && !isStudentMode) {
            saveData(GRID_OPACITY_STORAGE_KEY, gridOpacity).catch(err => {
                console.error("Failed to save grid opacity:", err);
            });
        }
    }, [gridOpacity, isLoadedFromDB, currentUser, isStudentMode]);

    const handleNewCanvas = useCallback(() => {
        if (window.confirm(t('modals.prompts.newCanvas'))) {
            resetItemsHistory([]);
            setTransform({ scale: 1, x: 0, y: 0 });
            setSelectedItemIds([]);
            setFileInfo(null, '');
            deleteData(ITEMS_STORAGE_KEY).catch(err => console.error("Failed to clear IndexedDB canvas items:", err));
            deleteData(TRANSFORM_STORAGE_KEY).catch(err => console.error("Failed to clear IndexedDB canvas transform:", err));
        }
    }, [resetItemsHistory]);

    const handleOpenSaveModal = useCallback(async () => {
        // Fetch list to show existing files so user can choose to overwrite
        await fetchSavesList();

        // If not creating a new file from scratch, keep the name
        // But if currentFileId is null, clear it to force user to name it
        if (!currentFileId) {
            setSaveName('');
        }
        setIsSaveModalOpen(true);
    }, [currentFileId, fetchSavesList]);

    const handleOpenLoadModal = useCallback(async () => {
        await fetchSavesList();
        setIsLoadModalOpen(true);
    }, [fetchSavesList]);

    const handleSave = async (targetId: string | null = null) => {
        const success = await hookHandleSave(targetId, saveName);
        if (success) {
            setIsSaveModalOpen(false);
        }
    };

    const handleQuickSave = () => {
        if (currentFileId) {
            handleSave(currentFileId);
        } else {
            handleOpenSaveModal();
        }
    };

    useEffect(() => {
        if ((!currentUser && !isGuest) || isStudentMode) return; // Disable shortcuts if not logged in/guest

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (presentationState.item) {
                    handleExitPresentation();
                    return;
                }
                setIsSaveModalOpen(false);
                setIsLoadModalOpen(false);
                setIsShareModalOpen(false);
                setIsCalculatorOpen(false);
                setIsTimerOpen(false);
                setIsPresenterRaffleOpen(false);
                setIsTagPanelVisible(false);
                setIsChecklistVisible(false);
                setIsMobileMenuOpen(false);
                setIsClassroomPanelOpen(false);
            }
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                if (!isSpacePressedRef.current) {
                    isSpacePressedRef.current = true;
                    previousToolRef.current = selectedTool;
                    handleToolSelect('hand');
                }
                return;
            }

            // Handle deletion of selected items
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedItemIds.length > 0) {
                    e.preventDefault();
                    setItems(prev => prev.filter(item => !selectedItemIds.includes(item.id)));
                    setSelectedItemIds([]);
                    return;
                }
            }

            const key = e.key.toLowerCase();
            const isCtrlOrMeta = e.ctrlKey || e.metaKey;

            if (isCtrlOrMeta && key === 's') {
                e.preventDefault();
                if (isProcessingCloud) return;

                if (e.shiftKey) {
                    handleOpenSaveModal(); // Ctrl+Shift+S -> Save As
                } else {
                    handleQuickSave(); // Ctrl+S -> Quick Save (Overwrite)
                }
                return;
            }
            if (isCtrlOrMeta && key === 'l') {
                e.preventDefault();
                if (!isProcessingCloud) handleOpenLoadModal();
                return;
            }
            if (isCtrlOrMeta && key === 'n') {
                e.preventDefault();
                if (items.length > 0) handleNewCanvas();
                return;
            }
            if (isCtrlOrMeta && key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    if (canRedo) redo();
                } else {
                    if (canUndo) undo();
                }
                return;
            }
            if (isCtrlOrMeta && key === 'y') {
                e.preventDefault();
                if (canRedo) redo();
                return;
            }

            const toolMap: { [key: string]: Tool } = {
                's': 'select',
                'h': 'hand',
                'p': 'pen',
                'l': 'highlighter',
                'c': 'circle',
                'r': 'rectangle',
                't': 'tag',
                'e': 'eraser',
                'q': 'sticker',
            };

            if (toolMap[key]) {
                e.preventDefault();
                handleToolSelect(toolMap[key]);
            } else if (['1', '2', '3'].includes(key)) {
                e.preventDefault();
                let color = '';
                if (key === '1') color = '#000000'; // Black
                if (key === '2') color = '#FFFFFF'; // White
                if (key === '3') color = '#3B82F6'; // Blue

                if (color) {
                    setToolOptions(prevOptions => ({
                        ...prevOptions,
                        strokeColor: color,
                        fillColor: color + '33',
                    }));
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                    return;
                }
                if (isSpacePressedRef.current) {
                    isSpacePressedRef.current = false;
                    if (previousToolRef.current) {
                        handleToolSelect(previousToolRef.current);
                        previousToolRef.current = null;
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleToolSelect, presentationState.item, handleExitPresentation, items, isProcessingCloud, handleNewCanvas, handleOpenLoadModal, handleOpenSaveModal, selectedTool, currentUser, currentFileId, saveName, isStudentMode, undo, redo, canUndo, canRedo]);

    const handlePaste = useCallback(async (event: ClipboardEvent) => {
        const clipboardItems = event.clipboardData?.items;
        if (!clipboardItems) return;

        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        for (const item of clipboardItems) {
            if (item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                if (!file) continue;

                try {
                    const dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });

                    const { width, height } = await new Promise<{ width: number, height: number }>((resolve) => {
                        const img = new Image();
                        img.onload = () => resolve({ width: img.width, height: img.height });
                        img.src = dataUrl;
                    });

                    const viewportCenterX = (window.innerWidth / 2 - transform.x) / transform.scale;
                    const viewportCenterY = (window.innerHeight / 2 - transform.y) / transform.scale;

                    const newImageItem: ImageItem = {
                        id: generateId(),
                        type: 'image',
                        width,
                        height,
                        dataUrl,
                        x: viewportCenterX - width / 2,
                        y: viewportCenterY - height / 2,
                        zIndex: 0,
                        visible: true,
                    };

                    setItems(currentItems => {
                        const maxZIndex = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.zIndex)) : -1;
                        return [...currentItems, { ...newImageItem, zIndex: maxZIndex + 1 }];
                    });

                    setStatusMessage({ text: 'Image pasted successfully!', type: 'success' });

                } catch (error) {
                    console.error("Error pasting image:", error);
                    setStatusMessage({ text: 'Failed to paste image.', type: 'error' });
                }
                return; // Stop after handling image
            }
        }

        // If not an image, check for Youtube link in text
        const pastedText = event.clipboardData.getData('text');
        if (pastedText) {
            // Regex to extract video ID from various YouTube URL formats
            const match = pastedText.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/)([^\s&?]+)/);
            if (match && match[1]) {
                event.preventDefault();
                const videoId = match[1];

                const viewportCenterX = (window.innerWidth / 2 - transform.x) / transform.scale;
                const viewportCenterY = (window.innerHeight / 2 - transform.y) / transform.scale;

                // Typical High Quality Thumbnail is 480x360
                const width = 480;
                const height = 360;

                const newYoutubeItem: YoutubeItem = {
                    id: generateId(),
                    type: 'youtube',
                    videoId,
                    width,
                    height,
                    x: viewportCenterX - width / 2,
                    y: viewportCenterY - height / 2,
                    zIndex: 0,
                    visible: true,
                };

                setItems(currentItems => {
                    const maxZIndex = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.zIndex)) : -1;
                    return [...currentItems, { ...newYoutubeItem, zIndex: maxZIndex + 1 }];
                });
                setStatusMessage({ text: 'YouTube link pasted!', type: 'success' });
            }
        }

    }, [transform, setItems]);

    useEffect(() => {
        if (currentUser && !isStudentMode) {
            window.addEventListener('paste', handlePaste);
            return () => {
                window.removeEventListener('paste', handlePaste);
            };
        }
    }, [handlePaste, currentUser, isStudentMode]);


    const handleFileChange = useCallback(async (files: File[]) => {
        if (!files || files.length === 0) return;

        setIsLoadingPdf(true);
        try {
            const allNewPagesByFile: Omit<ImageItem, 'id' | 'x' | 'y' | 'zIndex' | 'visible'>[][] = [];

            for (const file of files) {
                const pagesForThisFile: Omit<ImageItem, 'id' | 'x' | 'y' | 'zIndex' | 'visible'>[] = [];
                const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
                const pdf = await loadingTask.promise;

                const pagePromises = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    pagePromises.push(async () => {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 1.2 }); // Reduced scale slightly for performance
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d', { willReadFrequently: true });
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        if (context) {
                            await page.render({ canvasContext: context, viewport: viewport }).promise;
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Reduced quality slightly for faster processing
                            return {
                                type: 'image' as const,
                                width: viewport.width,
                                height: viewport.height,
                                dataUrl: dataUrl,
                                isPdfPage: true,
                            };
                        }
                        return null;
                    });
                }

                // Execute all page renders concurrently
                const results = await Promise.all(pagePromises.map(p => p()));
                pagesForThisFile.push(...results.filter((res): res is NonNullable<typeof res> => res !== null));
                if (pagesForThisFile.length > 0) {
                    allNewPagesByFile.push(pagesForThisFile);
                }
            }


            setItems(currentItems => {
                const startX = 50;
                let currentY = 50;

                if (currentItems.length > 0) {
                    let maxY = -Infinity;
                    currentItems.forEach(item => {
                        let itemBottom = item.y;
                        if (item.type === 'image' || item.type === 'shape' || item.type === 'text' || item.type === 'tag' || item.type === 'sticker') {
                            itemBottom += (item as any).height || 0;
                        } else if (item.type === 'path' && item.points.length > 0) {
                            itemBottom = Math.max(...item.points.map(p => p.y));
                        }
                        maxY = Math.max(maxY, itemBottom);
                    });
                    currentY = (maxY === -Infinity ? 50 : maxY) + 50;
                }

                const allNewItems: ImageItem[] = [];
                let rowMaxHeight = 0;

                allNewPagesByFile.forEach((pagesFromFile, fileIndex) => {
                    let currentX = startX;

                    if (fileIndex > 0) {
                        currentY += rowMaxHeight + 50;
                    }
                    rowMaxHeight = 0;

                    pagesFromFile.forEach(pageData => {
                        const item: ImageItem = {
                            id: generateId(),
                            ...pageData,
                            x: currentX,
                            y: currentY,
                            zIndex: 0,
                            visible: true,
                        };
                        allNewItems.push(item);
                        currentX += pageData.width + 20;
                        rowMaxHeight = Math.max(rowMaxHeight, pageData.height);
                    });
                });

                const currentMaxZIndex = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.zIndex)) : -1;
                const finalNewItems = allNewItems.map((item, index) => ({
                    ...item,
                    zIndex: currentMaxZIndex + 1 + index,
                }));
                return [...currentItems, ...finalNewItems];
            });

        } catch (error) {
            console.error("Error loading PDF(s):", error);
            alert("Failed to load one or more PDFs. Please check the console for details.");
        } finally {
            setIsLoadingPdf(false);
        }
    }, [setItems]);

    const handleClearCanvas = () => {
        if (window.confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
            resetItemsHistory([]);
            setTransform({ scale: 1, x: 0, y: 0 });
            setSelectedItemIds([]);
            setSaveName('');
            deleteData(ITEMS_STORAGE_KEY).catch(err => console.error("Failed to clear IndexedDB canvas items:", err));
            deleteData(TRANSFORM_STORAGE_KEY).catch(err => console.error("Failed to clear IndexedDB canvas transform:", err));
        }
    };

    const handleOpenShareModal = () => {
        setShareableLink('');
        setIsShareModalOpen(true);
    };

    const handleGenerateShareLink = async () => {
        setIsGeneratingLink(true);
        try {
            const jsonString = JSON.stringify({ items, transform });
            const compressedBase64 = compressData(jsonString);
            const CHUNK_SIZE = 800000;

            const newId = generateId();
            const { error } = await supabase.from('shared_canvases').insert({
                id: newId,
                packed_data: compressedBase64,
                version: 2
            });
            if (error) throw error;

            const baseUrl = window.location.origin + window.location.pathname;
            const url = `${baseUrl}#sharedCanvas=${newId}`;

            setShareableLink(url);
        } catch (error) {
            console.error("Failed to generate share link with Firebase:", error);
            setShareableLink('ERROR: Could not generate share link. Check console for details.');
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const handleLoad = async (id: string) => {
        await hookHandleLoad(id);
        setIsLoadModalOpen(false);
    };

    const handleDelete = async (id: string, name: string) => {
        await hookHandleDelete(id, name);
    };

    const handleEnterPresentation = useCallback((item: ImageItem) => {
        setPresentationState({
            item,
            preTransform: transform,
            fitHeightTransform: null,
            fitWidthTransform: null,
            zoomMode: null,
        });
    }, [transform]);

    const handleTogglePresentationZoom = useCallback(() => {
        setPresentationState(prev => {
            if (!prev.item || !prev.zoomMode || !prev.fitHeightTransform || !prev.fitWidthTransform) return prev;

            const newZoomMode = prev.zoomMode === 'fitHeight' ? 'fitWidth' : 'fitHeight';
            const newTransform = newZoomMode === 'fitHeight' ? prev.fitHeightTransform : prev.fitWidthTransform;

            setTransform(newTransform);

            return { ...prev, zoomMode: newZoomMode };
        });
    }, []);

    const handlePresentNavigate = useCallback((direction: 'next' | 'prev') => {
        if (!presentationState.item) return;

        const pdfPages = items
            .filter((item): item is ImageItem => item.type === 'image' && !!item.isPdfPage)
            .sort((a, b) => a.x - b.x);

        const currentIndex = pdfPages.findIndex(p => p.id === presentationState.item?.id);
        if (currentIndex === -1) return;

        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex >= 0 && nextIndex < pdfPages.length) {
            handleEnterPresentation(pdfPages[nextIndex]);
        }
    }, [items, presentationState.item, handleEnterPresentation]);

    const handleTagNavigation = (tag: TagItem) => {
        const canvasWrapper = canvasWrapperRef.current;
        if (!canvasWrapper) return;

        const { clientWidth, clientHeight } = canvasWrapper;
        const newScale = 1;

        const newX = (clientWidth / 2) - tag.x * newScale;
        const newY = (clientHeight / 2) - tag.y * newScale;

        setTransform({ scale: newScale, x: newX, y: newY });
        setIsTagPanelVisible(false);
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleUpdateTagTitle = (id: string, newTitle: string) => {
        setItems(currentItems =>
            currentItems.map(item => {
                if (item.id === id && item.type === 'tag') {
                    return { ...item, title: newTitle };
                }
                return item;
            })
        );
    };

    const pdfPagesForNav = presentationState.item ? items
        .filter((item): item is ImageItem => item.type === 'image' && !!item.isPdfPage)
        .sort((a, b) => a.x - b.x) : [];

    const currentPdfIndex = presentationState.item ? pdfPagesForNav.findIndex(p => p.id === presentationState.item?.id) : -1;
    const hasPrevPdf = currentPdfIndex > 0;
    const hasNextPdf = currentPdfIndex !== -1 && currentPdfIndex < pdfPagesForNav.length - 1;

    const getCurrentFitTransform = useCallback(() => {
        if (!presentationState.item) return null;
        if (presentationState.zoomMode === 'fitHeight') return presentationState.fitHeightTransform;
        if (presentationState.zoomMode === 'fitWidth') return presentationState.fitWidthTransform;

        if (presentationState.fitHeightTransform && presentationState.fitWidthTransform) {
            return presentationState.fitHeightTransform.scale < presentationState.fitWidthTransform.scale
                ? presentationState.fitHeightTransform
                : presentationState.fitWidthTransform;
        }
        return null;
    }, [presentationState]);

    const currentFitTransform = getCurrentFitTransform();
    const isZoomedInPresentation = !!currentFitTransform && JSON.stringify(transform) !== JSON.stringify(currentFitTransform);

    const singleSelectedItem = selectedItemIds.length === 1 ? items.find(i => i.id === selectedItemIds[0]) : null;
    const canPresent = singleSelectedItem?.type === 'image' && !!singleSelectedItem.isPdfPage;

    const renderMobileMenu = () => {
        const MenuItem: React.FC<{ icon: string, title: string, onClick: () => void, disabled?: boolean }> = ({ icon, title, onClick, disabled }) => (
            <button
                onClick={() => { onClick(); setIsMobileMenuOpen(false); }}
                disabled={disabled}
                className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 rounded-lg hover:bg-gray-100 disabled:text-gray-400 disabled:bg-white disabled:cursor-not-allowed transition-colors"
            >
                <Icon name={icon} className="w-5 h-5" />
                <span>{title}</span>
            </button>
        );

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMobileMenuOpen(false)}>
                <div
                    className="absolute right-0 top-0 h-full w-72 max-w-[80vw] bg-white shadow-xl p-4 overflow-y-auto animate-slide-in-right"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <div className="flex items-center gap-2">
                            {currentUser ? (
                                <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <Icon name="user" className="w-4 h-4 text-gray-600" />
                                </div>
                            )}
                            <span className="text-sm font-medium truncate max-w-[120px]">
                                {currentUser ? currentUser.displayName : 'Guest'}
                            </span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-gray-100">
                            <Icon name="exit" />
                        </button>
                    </div>
                    <div className="flex flex-col space-y-1">
                        {currentUser ? (
                            <MenuItem icon="exit" title="Logout" onClick={handleLogout} />
                        ) : (
                            <MenuItem icon="user" title="Login" onClick={() => { }} />
                        )}
                        <div className="pt-1 pb-2"><div className="h-px bg-gray-200"></div></div>
                        <MenuItem icon="undo" title="Undo" onClick={undo} disabled={!canUndo} />
                        <MenuItem icon="redo" title="Redo" onClick={redo} disabled={!canRedo} />
                        <div className="pt-1 pb-2"><div className="h-px bg-gray-200"></div></div>
                        <MenuItem icon="present" title="Present Page" onClick={() => handleEnterPresentation(singleSelectedItem as ImageItem)} disabled={!canPresent} />
                        <MenuItem icon="new-canvas" title="New Canvas" onClick={handleNewCanvas} disabled={items.length === 0} />
                        <MenuItem icon="trash" title="Clear Canvas" onClick={handleClearCanvas} disabled={items.length === 0} />
                        <MenuItem icon="checklist" title="Toggle Checklist" onClick={() => setIsChecklistVisible(prev => !prev)} />
                        <div className="pt-1 pb-2"><div className="h-px bg-gray-200"></div></div>
                        <MenuItem icon="cloud-upload" title="Save to Cloud" onClick={handleOpenSaveModal} disabled={!!isProcessingCloud} />
                        <MenuItem icon="cloud-download" title="Load from Cloud" onClick={handleOpenLoadModal} disabled={!!isProcessingCloud} />
                        <MenuItem icon="share" title="Share Canvas" onClick={handleOpenShareModal} disabled={items.length === 0} />
                        <div className="pt-1 pb-2"><div className="h-px bg-gray-200"></div></div>
                        <MenuItem icon="raffle" title="Presenter Raffle" onClick={() => setIsPresenterRaffleOpen(prev => !prev)} />
                        <MenuItem icon="calculator" title="Calculator" onClick={() => setIsCalculatorOpen(prev => !prev)} />
                        <MenuItem icon="timer" title="Timer" onClick={() => setIsTimerOpen(prev => !prev)} />
                        <div className="pt-1 pb-2"><div className="h-px bg-gray-200"></div></div>
                        <div className="px-3 py-2">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Background</h3>
                            <div className="flex items-center space-x-3">
                                {backgroundColors.map(({ name, color }) => (
                                    <button
                                        key={color}
                                        title={name}
                                        onClick={() => setBackgroundColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 border-white transition-transform transform hover:scale-110 ${backgroundColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : 'ring-1 ring-gray-300'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isStudentMode) {
        return <StudentClient />;
    }

    if (!isAuthReady) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 font-medium">Loading Smart Board...</p>
                </div>
            </div>
        );
    }

    if (!currentUser && !isGuest) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center transform transition-all hover:scale-[1.01] duration-300">
                    <div className="mb-8 flex justify-center">
                        <img src="/icon.jpg" alt="Smart Board Logo" className="w-20 h-20 rounded-2xl shadow-md border border-gray-100" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.title')}</h1>
                    <p className="text-gray-600 mb-8">
                        Smart Board를 사용하려면<br />tcreator.kr에 로그인해 주세요.
                    </p>

                    <a
                        href="https://tcreator.kr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 font-semibold text-lg no-underline"
                    >
                        <span>tcreator.kr로 이동</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>

                    <div className="mt-4 text-center">
                        <span className="text-gray-500 text-sm mr-2">{t('auth.guestPrompt')}</span>
                        <button
                            type="button"
                            onClick={() => setIsGuest(true)}
                            className="text-gray-600 font-semibold hover:text-gray-900 underline decoration-gray-400 decoration-1 underline-offset-4 bg-transparent border-none p-0 cursor-pointer inline transition-colors"
                        >
                            {t('auth.continueGuest')}
                        </button>
                    </div>

                    <div className="mt-8 text-xs text-gray-400">
                        <p>&copy; {new Date().getFullYear()} {t('auth.rights')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen flex flex-col font-sans overflow-hidden">
            {!presentationState.item && (
                <>
                    {/* Desktop Header */}
                    <header className="hidden md:grid grid-cols-3 items-center p-2 bg-white shadow-md z-20">
                        {/* Left Controls */}
                        <div className="flex items-center space-x-2 justify-start">
                            {/* Settings Button - Moved to Left */}
                            <div className="relative group mr-2">
                                <button 
                                    onClick={() => setIsSettingsOpen(true)} 
                                    className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-200 transition-colors" 
                                    title={t('settings.title')}
                                >
                                    <Icon name="settings" className="w-7 h-7 text-gray-600" />
                                </button>
                            </div>

                            <div className="w-px h-6 bg-gray-300 mx-2"></div>

                            <button onClick={undo} disabled={!canUndo} title={t('toolbar.undo')} className="flex items-center space-x-2 px-3 py-2 text-sm bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                                <Icon name="undo" className="w-5 h-5" />
                            </button>
                            <button onClick={redo} disabled={!canRedo} title={t('toolbar.redo')} className="flex items-center space-x-2 px-3 py-2 text-sm bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                                <Icon name="redo" className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleEnterPresentation(singleSelectedItem as ImageItem)} disabled={!canPresent} title={t('toolbar.present')} className="flex items-center space-x-2 px-3 py-2 text-sm bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                                <Icon name="present" className="w-5 h-5" />
                            </button>
                            <button onClick={handleNewCanvas} disabled={items.length === 0} title={t('toolbar.newCanvas')} className="flex items-center space-x-2 px-3 py-2 text-sm bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                                <Icon name="new-canvas" className="w-5 h-5" />
                            </button>

                        </div>

                        {/* Centered Title */}
                        <div className="flex items-center space-x-2 justify-center">
                            <img src="/icon.jpg" alt="Logo" className="w-6 h-6 rounded-md shadow-sm" />
                            <h1 className="text-xl font-bold text-gray-800">Smart Board</h1>
                            <div>
                                <div
                                    className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
                                    title="kang@tcreator.kr"
                                    onClick={() => {
                                        navigator.clipboard.writeText('kang@tcreator.kr');
                                        setStatusMessage({ text: t('modals.prompts.emailCopied'), type: 'success' });
                                    }}
                                >
                                    by @teacher.kang
                                </div>
                            </div>
                            {currentFileId && saveName && (
                                isEditingTitle ? (
                                    <input
                                        type="text"
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        onBlur={() => {
                                            const newName = tempTitle.trim();
                                            if (newName && newName !== saveName) {
                                                setFileInfo(currentFileId, newName);
                                            }
                                            setIsEditingTitle(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const newName = tempTitle.trim();
                                                if (newName && newName !== saveName) {
                                                    setFileInfo(currentFileId, newName);
                                                }
                                                setIsEditingTitle(false);
                                            } else if (e.key === 'Escape') {
                                                setIsEditingTitle(false);
                                            }
                                        }}
                                        autoFocus
                                        className="text-xs px-2 py-0.5 bg-white text-blue-700 rounded-full border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[150px]"
                                    />
                                ) : (
                                    <span 
                                        onClick={() => {
                                            setTempTitle(saveName);
                                            setIsEditingTitle(true);
                                        }}
                                        className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200 truncate max-w-[150px] cursor-pointer hover:bg-blue-200 transition-colors"
                                        title={t('toolbar.renameClick', 'Click to rename')}
                                    >
                                        {saveName}
                                    </span>
                                )
                            )}
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center space-x-2 justify-end">
                            {statusMessage && (
                                <div className={`hidden lg:block text-sm px-3 py-1 rounded-md transition-opacity duration-300 ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {statusMessage.text}
                                </div>
                            )}

                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            {/* Widgets moved back to right */}
                            <div className="relative flex items-center">
                                <button onClick={() => setIsChecklistVisible(prev => !prev)} title={t('toolbar.checklist')} className="flex items-center space-x-2 px-3 py-2 text-sm bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors">
                                    <Icon name="checklist" className="w-5 h-5" />
                                </button>
                            </div>

                            <button onClick={() => setIsClassroomPanelOpen(prev => !prev)} title={t('toolbar.classroom')} className={`p-2 rounded-lg shadow-md transition-colors ${isClassroomPanelOpen ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}>
                                <Icon name="users" />
                            </button>
                            <button onClick={() => setIsPresenterRaffleOpen(prev => !prev)} title={t('toolbar.raffle')} className={`p-2 rounded-lg shadow-md transition-colors ${isPresenterRaffleOpen ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}>
                                <Icon name="raffle" />
                            </button>
                            <button onClick={() => setIsCalculatorOpen(prev => !prev)} title={t('toolbar.calculator')} className={`p-2 rounded-lg shadow-md transition-colors ${isCalculatorOpen ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}>
                                <Icon name="calculator" />
                            </button>
                            <button onClick={() => setIsTimerOpen(prev => !prev)} title={t('toolbar.timer')} className={`p-2 rounded-lg shadow-md transition-colors ${isTimerOpen ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}>
                                <Icon name="timer" />
                            </button>

                            <div className="w-px h-6 bg-gray-300"></div>

                            <button onClick={handleClearCanvas} title={t('toolbar.clear')} disabled={items.length === 0} className="p-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                                <Icon name="trash" />
                            </button>

                            <div className="w-px h-6 bg-gray-300"></div>

                            <div className="relative">
                            <button onClick={handleOpenSaveModal} disabled={!!isProcessingCloud} className="p-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors" title={t('toolbar.save')}>
                                {isProcessingCloud ? (
                                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <Icon name="cloud-upload" />
                                )}
                            </button>
                            {/* Auto-save status message */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs text-gray-500 transition-opacity duration-500 whitespace-nowrap pointer-events-none z-50" style={{ opacity: autoSaveOpacity }}>
                                {autoSaveMessage.current}
                            </div>
                            </div>
                            <button onClick={handleOpenLoadModal} disabled={!!isProcessingCloud} className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors" title={t('toolbar.load')}>
                                <Icon name="cloud-download" />
                            </button>
                            <button onClick={handleOpenShareModal} disabled={items.length === 0} className="p-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors" title={t('toolbar.share')}>
                                <Icon name="share" />
                            </button>

                            <div className="w-px h-6 bg-gray-300"></div>

                            <FileUploadButton onFileChange={handleFileChange} isLoading={isLoadingPdf} title={t('toolbar.upload')} />
                        </div>
                    </header>

                    {/* Mobile Header */}
                    <header className="flex md:hidden items-center justify-between p-2 bg-white shadow-md z-20">
                        <div className="flex items-center space-x-2">
                            <img src="/icon.jpg" alt="Logo" className="w-6 h-6 rounded-md shadow-sm" />
                            <h1 className="text-xl font-bold text-gray-800">{t('auth.title')}</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FileUploadButton onFileChange={handleFileChange} isLoading={isLoadingPdf} title={t('toolbar.upload')} />
                            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                                <Icon name="menu" />
                            </button>
                        </div>
                    </header>

                    {isMobileMenuOpen && renderMobileMenu()}

                    {/* Settings Modal */}
                    {isSettingsOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm m-4 animate-scale-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Icon name="settings" className="w-6 h-6 text-gray-600" />
                                        {t('settings.title')}
                                    </h2>
                                    <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <Icon name="exit" className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* User Profile Section */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {currentUser ? currentUser.email : t('profile.guest')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsSettingsOpen(false);
                                                handleLogout();
                                            }}
                                            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors border border-red-200"
                                            title={t('auth.logout')}
                                        >
                                            {t('auth.logout')}
                                        </button>
                                    </div>

                                    {/* Language Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.language')}</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <button
                                                onClick={() => changeLanguage('ko')}
                                                className={`px-4 py-2 text-left rounded-lg border flex items-center justify-between transition-colors ${i18n.language.startsWith('ko') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50 border-gray-200'}`}
                                            >
                                                <span>한국어</span>
                                                {i18n.language.startsWith('ko') && <span className="text-blue-500">✓</span>}
                                            </button>
                                            <button
                                                onClick={() => changeLanguage('en')}
                                                className={`px-4 py-2 text-left rounded-lg border flex items-center justify-between transition-colors ${i18n.language.startsWith('en') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50 border-gray-200'}`}
                                            >
                                                <span>English</span>
                                                {i18n.language.startsWith('en') && <span className="text-blue-500">✓</span>}
                                            </button>
                                            <button
                                                onClick={() => changeLanguage('ja')}
                                                className={`px-4 py-2 text-left rounded-lg border flex items-center justify-between transition-colors ${i18n.language.startsWith('ja') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50 border-gray-200'}`}
                                            >
                                                <span>日本語</span>
                                                {i18n.language.startsWith('ja') && <span className="text-blue-500">✓</span>}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
                                    >
                                        {t('settings.close')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
            <div className="relative flex-grow overflow-hidden" ref={canvasWrapperRef}>
                {!presentationState.item ? (
                    <>
                        <Toolbar
                            selectedTool={selectedTool}
                            setSelectedTool={handleToolSelect}
                            toolOptions={toolOptions}
                            setToolOptions={setToolOptions}
                            isMultiTouchEnabled={isMultiTouchEnabled}
                            setIsMultiTouchEnabled={setIsMultiTouchEnabled}
                        />
                        {isTagPanelVisible && tagItems.length > 0 && (
                            <TagPanel
                                tags={tagItems}
                                onNavigate={handleTagNavigation}
                                onUpdateTitle={handleUpdateTagTitle}
                                onClose={() => setIsTagPanelVisible(false)}
                            />
                        )}
                        {isChecklistVisible && <Checklist onClose={() => setIsChecklistVisible(false)} />}
                        {isClassroomPanelOpen && currentUser && (
                            <ClassroomPanel
                                onClose={() => setIsClassroomPanelOpen(false)}
                                onDropItem={handleClassroomDrop}
                                currentUserId={currentUser.uid}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <PresentationToolbar
                            selectedTool={selectedTool}
                            setSelectedTool={handleToolSelect}
                            toolOptions={toolOptions}
                            setToolOptions={setToolOptions}
                            onExit={handleExitPresentation}
                            onToggleZoom={handleTogglePresentationZoom}
                            zoomMode={presentationState.zoomMode}
                        />
                        <button
                            onClick={() => handlePresentNavigate('prev')}
                            disabled={!hasPrevPdf}
                            className="fixed left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                            title="Previous Page"
                        >
                            <Icon name="arrow-left-circle" className="w-8 h-8" />
                        </button>
                        <button
                            onClick={() => handlePresentNavigate('next')}
                            disabled={!hasNextPdf}
                            className="fixed right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                            title="Next Page"
                        >
                            <Icon name="arrow-right-circle" className="w-8 h-8" />
                        </button>
                        {isZoomedInPresentation && (
                            <button
                                onClick={() => setTransform(currentFitTransform!)}
                                className="fixed top-4 right-4 z-30 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 text-gray-700 transition-transform transform hover:scale-105"
                                title="Fit to Screen"
                            >
                                <Icon name="fit-to-screen" className="w-6 h-6" />
                            </button>
                        )}
                    </>
                )}
                <Canvas
                    items={items}
                    setItems={setItems}
                    selectedTool={selectedTool}
                    toolOptions={toolOptions}
                    transform={transform}
                    setTransform={setTransform}
                    selectedItemIds={selectedItemIds}
                    setSelectedItemIds={setSelectedItemIds}
                    undo={undo}
                    redo={redo}
                    backgroundColor={backgroundColor}
                    setBackgroundColor={setBackgroundColor}
                    backgroundColors={backgroundColors}
                    onEnterPresentation={handleEnterPresentation}
                    isPresentationMode={!!presentationState.item}
                    presentationFitTransform={currentFitTransform}
                    gridOpacity={gridOpacity}
                    setGridOpacity={setGridOpacity}
                    onYoutubePlay={setPlayingYoutubeId}
                    isMultiTouchEnabled={isMultiTouchEnabled}
                />

                {/* Floating Quick Access Toolbars */}
                {!presentationState.item && (currentUser || isGuest) ? (
                    <>
                        <FloatingToolbar
                            position="left"
                            selectedTool={selectedTool}
                            setSelectedTool={handleToolSelect}
                        />
                        <FloatingToolbar
                            position="right"
                            selectedTool={selectedTool}
                            setSelectedTool={handleToolSelect}
                        />
                    </>
                ) : null}
            </div>

            {/* Save Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-2">
                            <Icon name="cloud-upload" className="w-5 h-5 text-blue-600" />
                            {t('modals.save.title')}
                        </h3>

                        <div>
                            <label htmlFor="save-name" className="block text-sm font-medium text-gray-700">{t('modals.save.fileName')}</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="save-name"
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder={t('modals.save.fileNamePlaceholder')}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* New List Block */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('modals.save.existingFiles')}</label>
                            <div className="border border-gray-300 rounded-md h-48 overflow-y-auto bg-gray-50">
                                {savesList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                                        <Icon name="cloud-upload" className="w-8 h-8 mb-2 opacity-50" />
                                        <p>{t('modals.save.noFiles')}</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 bg-white">
                                        {savesList.map(save => (
                                            <li
                                                key={save.id}
                                                onClick={() => setSaveName(save.name)}
                                                className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center group ${saveName === save.name ? 'bg-blue-100 ring-1 ring-inset ring-blue-500' : ''}`}
                                            >
                                                <div className="flex items-center overflow-hidden">
                                                    <Icon name="save" className={`w-4 h-4 mr-3 flex-shrink-0 ${saveName === save.name ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    <span className={`text-sm truncate ${saveName === save.name ? 'font-medium text-blue-800' : 'text-gray-700'}`}>{save.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0 group-hover:text-gray-600">
                                                    {new Date(save.lastModified).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                {t('modals.save.cancel')}
                            </button>
                            {currentFileId && (
                                <button
                                    type="button"
                                    onClick={() => handleSave(currentFileId)}
                                    disabled={!saveName.trim() || isProcessingCloud === 'save-button'}
                                    className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
                                    title={t('modals.save.saveOverwrite')}
                                >
                                    {isProcessingCloud === 'save-button' && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                    {t('modals.save.saveOverwrite')}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleSave(null)}
                                disabled={!saveName.trim() || isProcessingCloud === 'save-button'}
                                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                {isProcessingCloud === 'save-button' && !currentFileId && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {currentFileId ? t('modals.save.saveAsNew') : t('modals.save.saveBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Load Modal */}
            {isLoadModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                                <Icon name="cloud-download" className="w-5 h-5 text-blue-600" />
                                {t('modals.load.title')}
                            </h3>
                            <button onClick={() => setIsLoadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto pr-2">
                            {savesList.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">{t('modals.load.noCanvases')}</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {[...savesList].sort((a, b) => b.lastModified - a.lastModified).map(save => (
                                        <li key={save.id} className="py-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{save.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {t('modals.load.lastSaved')}: {new Date(save.lastModified).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleLoad(save.id)}
                                                    disabled={!!isProcessingCloud}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                                                >
                                                    {isProcessingCloud === save.id && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                                    {t('modals.load.loadBtn')}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(save.id, save.name)}
                                                    disabled={!!isProcessingCloud}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200"
                                                >
                                                    {isProcessingCloud === save.id ? '...' : <Icon name="trash" />}
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">{t('modals.share.title')}</h3>
                            <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div>
                            {isGeneratingLink ? (
                                <div className="flex items-center justify-center p-4">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>{t('modals.share.generating')}</span>
                                </div>
                            ) : shareableLink ? (
                                <div>
                                    <label htmlFor="share-url" className="block text-sm font-medium text-gray-700">{t('modals.share.yourLink')}</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            id="share-url"
                                            value={shareableLink}
                                            readOnly
                                            className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 px-3 py-2 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            onFocus={(e) => e.target.select()}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(shareableLink);
                                                setStatusMessage({ text: t('modals.prompts.linkCopied'), type: 'success' });
                                            }}
                                            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            <Icon name="copy" className="h-5 w-5 text-gray-400" />
                                            <span>{t('modals.share.copy')}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-4">{t('modals.share.description')}</p>
                                    <button
                                        type="button"
                                        onClick={handleGenerateShareLink}
                                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        {t('modals.share.generateBtn')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* YouTube Playback Modal */}
            {playingYoutubeId && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]" onClick={() => setPlayingYoutubeId(null)}>
                    <div className="relative w-[90vw] max-w-5xl aspect-video bg-black shadow-2xl rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                            onClick={() => setPlayingYoutubeId(null)}
                            title="Close Video"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${playingYoutubeId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            {/* Conditional rendering for tools */}
            {isCalculatorOpen && <Calculator onClose={() => setIsCalculatorOpen(false)} />}
            {isTimerOpen && <Timer onClose={() => setIsTimerOpen(false)} />}
            {isPresenterRaffleOpen && <PresenterRaffle onClose={() => setIsPresenterRaffleOpen(false)} />}
        </div>
    );
};

export default App;
